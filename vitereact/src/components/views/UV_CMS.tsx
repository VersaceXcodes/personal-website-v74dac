import React, { useEffect, useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { use_app_store } from "@/store/main";
import { Link } from "react-router-dom";

// Interfaces for TypeScript
interface SEOData {
  title: string;
  description: string;
  keywords: string[];
}

interface PageContent {
  // Define specific structure based on backend data
  sections: { id: string; content: any }[];
}

interface PageUpdatePayload {
  content: PageContent;
  seo_meta: SEOData;
}

// UV_CMS View Component
const UV_CMS: React.FC = () => {
  const { user_authenticated, add_notification } = use_app_store();
  const queryClient = useQueryClient();

  const [currentPageId, setCurrentPageId] = useState<string>("");
  const [modifiedContent, setModifiedContent] = useState<PageContent>({ sections: [] });
  const [seoMetaData, setSeoMetaData] = useState<SEOData>({
    title: "",
    description: "",
    keywords: [],
  });

  // Assume 'siteId' is dynamically available
  const siteId = "dynamic-site-id";

  // Function to load page content
  const { data: pageContent, refetch } = useQuery<PageContent, Error>(
    ["pageContent", currentPageId],
    async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/sites/${siteId}/pages/${currentPageId}`
      );
      return data;
    },
    {
      enabled: !!currentPageId, // Only fetch if pageId is set
    }
  );

  // Function to save a draft of the page
  const saveDraftMutation = useMutation<void, Error, PageUpdatePayload>(
    async ({ content, seo_meta }) => {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/sites/${siteId}/pages/${currentPageId}`,
        { content, seo_meta }
      );
    },
    {
      onSuccess: () => {
        add_notification({ type: "success", message: "Draft saved successfully" });
        queryClient.invalidateQueries(["pageContent", currentPageId]);
      },
      onError: (error: Error) => {
        add_notification({ type: "error", message: `Error saving draft: ${error.message}` });
      },
    }
  );

  // Function to publish page content
  const publishContentMutation = useMutation<void, Error, PageUpdatePayload>(
    async ({ content, seo_meta }) => {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/sites/${siteId}/pages/${currentPageId}`,
        { content, seo_meta }
      );
    },
    {
      onSuccess: () => {
        add_notification({ type: "success", message: "Content published successfully" });
      },
      onError: (error: Error) => {
        add_notification({ type: "error", message: `Error publishing content: ${error.message}` });
      },
    }
  );

  useEffect(() => {
    if (pageContent) {
      setModifiedContent(pageContent);
      // Handle SEO data setup if returned from backend
      setSeoMetaData(pageContent?.seo_meta || { title: "", description: "", keywords: [] }); // default or backend setup
    }
  }, [pageContent]);

  const handleSaveDraft = () => {
    saveDraftMutation.mutate({ content: modifiedContent, seo_meta: seoMetaData });
  };

  const handlePublishContent = () => {
    publishContentMutation.mutate({ content: modifiedContent, seo_meta: seoMetaData });
  };

  return (
    <>
      <div className="container mx-auto p-4">
        {user_authenticated ? (
          <>
            <div className="mb-4">
              <select
                className="border rounded p-2"
                onChange={(e) => setCurrentPageId(e.target.value)}
                value={currentPageId}
              >
                <option value="">Select Page</option>
                <option value="home">Home</option>
                <option value="about">About</option>
                <option value="blog">Blog</option>
                <option value="portfolio">Portfolio</option>
                <option value="contact">Contact</option>
              </select>
            </div>

            <div className="mb-4">
              <div className="border rounded p-4">
                <h3 className="text-lg font-semibold">Content Editor</h3>
                {/* Implement drag-and-drop UI */}
                <div className="mt-2">
                  <textarea
                    className="w-full border rounded p-2"
                    rows={10}
                    value={JSON.stringify(modifiedContent.sections)}
                    onChange={(e) => setModifiedContent({ sections: JSON.parse(e.target.value) })}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="border rounded p-4">
                <h3 className="text-lg font-semibold">SEO Settings</h3>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Title"
                    className="block w-full mb-2 p-2 border"
                    value={seoMetaData.title}
                    onChange={(e) => setSeoMetaData({ ...seoMetaData, title: e.target.value })}
                    aria-label="SEO Title"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="block w-full mb-2 p-2 border"
                    value={seoMetaData.description}
                    onChange={(e) => setSeoMetaData({ ...seoMetaData, description: e.target.value })}
                    aria-label="SEO Description"
                  />
                  <input
                    type="text"
                    placeholder="Keywords (comma separated)"
                    className="block w-full mb-2 p-2 border"
                    value={seoMetaData.keywords.join(", ")}
                    onChange={(e) =>
                      setSeoMetaData({
                        ...seoMetaData,
                        keywords: e.target.value.split(", "),
                      })
                    }
                    aria-label="SEO Keywords"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSaveDraft}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Save Draft
              </button>
              <button
                onClick={handlePublishContent}
                className="bg-green-500 text-white p-2 rounded"
              >
                Publish
              </button>
            </div>

          </>
        ) : (
          <div>Please log in to manage your content</div>
        )}
      </div>
    </>
  );
};

export default UV_CMS;