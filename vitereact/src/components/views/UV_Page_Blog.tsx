import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { use_app_store } from '@/store/main';
import { Link } from 'react-router-dom';

interface Post {
  post_id: string;
  title: string;
  date: string;
}

interface Comment {
  comment_id: string;
  author_name: string;
  content: string;
}

const fetchPosts = async (): Promise<Post[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/posts`);
  return data;
};

const fetchComments = async (postId: string): Promise<Comment[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/posts/${postId}/comments`);
  return data.comments;
};

const UV_Page_Blog: React.FC = () => {
  const { user_authenticated, add_notification } = use_app_store();
  const queryClient = useQueryClient();

  const { data: posts, isLoading: postsLoading, isError: postsError } = useQuery<Post[], Error>({
    queryKey: ['posts'],
    queryFn: fetchPosts
  });

  const { mutate: createPost } = useMutation({
    mutationFn: async () => {
      if (!user_authenticated) throw new Error('User is not authenticated');
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/posts`, {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      add_notification({ type: 'success', message: 'New post created successfully' });
    },
    onError: () => {
      add_notification({ type: 'error', message: 'Failed to create new post' });
    }
  });

  const handleCreateNewPost = () => {
    if (!user_authenticated) {
      add_notification({ type: 'error', message: 'Please log in to create a new post' });
      return;
    }
    createPost();
  };

  return (
    <>
      {user_authenticated ? (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <button
            className="mt-4 mb-4 btn-primary"
            onClick={handleCreateNewPost}
          >
            New Post
          </button>
          {postsLoading ? (
            <div>Loading posts...</div>
          ) : postsError ? (
            <div>Error loading posts</div>
          ) : (
            posts && (
              <ul className="list-disc pl-5">
                {posts.map(({ post_id, title, date }) => (
                  <li key={post_id} className="mb-2">
                    <h2 className="text-xl">{title}</h2>
                    <p className="text-gray-500">{date}</p>
                    <Link to={`/blog/edit/${post_id}`} className="text-blue-500 hover:underline">
                      Edit Post
                    </Link>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      ) : (
        <div>Please log in to manage your blogs.</div>
      )}
    </>
  );
};

export default UV_Page_Blog;