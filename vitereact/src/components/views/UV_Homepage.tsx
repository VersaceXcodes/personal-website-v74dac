import React,{useEffect} from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { use_app_store } from '@/store/main';

// Types for recent edits
interface RecentEdit {
  page_id: string;
  title: string;
  last_modified: string;
}

const fetchRecentEdits = async (): Promise<RecentEdit[]> => {
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/sites/1/pages`);
    return data;
  } catch (error) {
    console.error('Failed to fetch recent edits:', error);
    return [];
  }
};

const UV_Homepage: React.FC = () => {
  const navigate = useNavigate();
  const { user_authenticated, user_greeting = '' } = use_app_store(state => ({
    user_authenticated: state.user_authenticated,
    user_greeting: state.user_greeting
  }));

  useEffect(() => {
    if (!user_authenticated) {
      navigate('/login');
    }
  }, [user_authenticated, navigate]);

  const { data: recent_edits = [], isLoading, isError } = useQuery<RecentEdit[], Error>({
    queryKey: ['recent_edits'],
    queryFn: fetchRecentEdits
  });

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded p-6">
          <h1 className="text-2xl font-bold">{`Welcome, ${user_greeting}`}</h1>

          <div className="mt-6">
            <h2 className="font-bold text-lg">Quick Start Guide</h2>
            <ul className="mt-2 list-disc pl-6">
              <li>
                <Link to="/templates" className="text-blue-500 hover:underline">Select a website template</Link>
              </li>
              <li>
                <Link to="/cms" className="text-blue-500 hover:underline">Manage site content</Link>
              </li>
              <li>
                <Link to="/blog" className="text-blue-500 hover:underline">Create and manage blog posts</Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-blue-500 hover:underline">Showcase your portfolio</Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-500 hover:underline">Set up your contact page</Link>
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <h2 className="font-bold text-lg">Recently Edited Pages</h2>
            {isLoading ? (
              <p>Loading...</p>
            ) : isError ? (
              <p className="text-red-500">Error loading recent edits</p>
            ) : (
              <ul className="mt-2 list-disc pl-6">
                {recent_edits.map(edit => (
                  <li key={edit.page_id} className="text-gray-700">
                    {edit.title} - Last modified: {new Date(edit.last_modified).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Homepage;