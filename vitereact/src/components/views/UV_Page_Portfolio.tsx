import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAppStore } from "@/store/main";
import { Link } from "react-router-dom";

interface PortfolioItem {
  item_id: string;
  title: string;
  image_url: string;
}

const fetchPortfolioItems = async (): Promise<PortfolioItem[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/portfolio/items`);
  return data.items;
};

const uploadImage = async (newImage: FormData): Promise<PortfolioItem> => {
  const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/portfolio/upload`, newImage, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

const editImageCaption = async (item: PortfolioItem): Promise<void> => {
  await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/portfolio/item/${item.item_id}`, item);
};

const deletePortfolioItem = async (item_id: string): Promise<void> => {
  await axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/portfolio/item/${item_id}`);
};

const UV_Page_Portfolio: React.FC = () => {
  const { user_authenticated, add_notification } = useAppStore();
  const queryClient = useQueryClient();
  const [currentItem, setCurrentItem] = useState<PortfolioItem | null>(null);
  const [imageUploadStatus, setImageUploadStatus] = useState<string>("idle");

  const { data: portfolioItems, isLoading, error } = useQuery<PortfolioItem[], Error>({
    queryKey: ["portfolioItems"],
    queryFn: fetchPortfolioItems,
  });

  const uploadMutation = useMutation(uploadImage, {
    onMutate: () => setImageUploadStatus("uploading"),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries(["portfolioItems"]);
      setImageUploadStatus("success");
      add_notification({ type: "success", message: "Image uploaded successfully" });
    },
    onError: () => {
      setImageUploadStatus("error");
      add_notification({ type: "error", message: "Failed to upload image" });
    },
  });

  const editMutation = useMutation(editImageCaption, {
    onSuccess: () => {
      queryClient.invalidateQueries(["portfolioItems"]);
      add_notification({ type: "success", message: "Caption edited successfully" });
    },
    onError: () => {
      add_notification({ type: "error", message: "Failed to edit caption" });
    }
  });

  const deleteMutation = useMutation(deletePortfolioItem, {
    onSuccess: () => {
      queryClient.invalidateQueries(["portfolioItems"]);
      add_notification({ type: "success", message: "Item deleted successfully" });
    },
    onError: () => {
      add_notification({ type: "error", message: "Failed to delete item" });
    },
  });

  if (!user_authenticated) {
    return <div>Please log in to manage your portfolio.</div>;
  }

  if (isLoading) {
    return <div>Loading portfolio items...</div>;
  }

  if (error) {
    return <div>Error loading portfolio items. Please try again later.</div>;
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append("image", event.target.files[0]);
      uploadMutation.mutate(formData);
    }
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Portfolio Management</h1>
        <div className="mb-4">
          <label htmlFor="image-upload" className="cursor-pointer bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
            Upload New Image
          </label>
          <input type="file" id="image-upload" className="hidden" onChange={handleImageUpload} />
          {imageUploadStatus === "uploading" && <span className="ml-2 text-blue-500">Uploading...</span>}
          {imageUploadStatus === "error" && <span className="ml-2 text-red-500">Upload failed. Try again.</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {portfolioItems?.map((item) => (
            <div key={item.item_id} className="border p-2">
              <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover mb-2" />
              <h3 className="font-bold">{item.title}</h3>
              <div className="flex justify-between mt-2">
                <button onClick={() => setCurrentItem(item)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Edit</button>
                <button onClick={() => deleteMutation.mutate(item.item_id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
        {currentItem && (
          <div className="mt-4 p-4 bg-gray-100 border">
            <h3 className="font-bold">Edit Item: {currentItem.title}</h3>
            <input
              type="text"
              value={currentItem.title}
              onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
              className="border p-1 mb-2 w-full"
            />
            <button
              onClick={() => {
                if (currentItem) {
                  editMutation.mutate(currentItem);
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_Page_Portfolio;