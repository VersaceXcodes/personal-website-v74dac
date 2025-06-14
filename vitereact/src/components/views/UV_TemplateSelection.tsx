import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { use_app_store } from '@/store/main';
import { Link, useSearchParams } from 'react-router-dom';

// Interfaces for data
interface Template {
  template_id: string;
  name: string;
  category: string;
  preview_url: string;
}

interface SiteCreateRequest {
  template_id: string;
}

// Fetch templates from the API
const fetchTemplates = async (category?: string): Promise<Template[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/templates`,
    { params: category ? { category } : undefined }
  );
  return data.templates;
};

const UV_TemplateSelection: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewData, setPreviewData] = useState<Template | null>(null);
  const { user_authenticated, add_notification } = use_app_store();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const category = searchParams.get('templateCategory');

  // Fetch templates with react-query
  const {
    data: templates,
    isLoading,
    isError,
    error,
  } = useQuery<Template[], Error>(['templates', category], () => fetchTemplates(category));

  const createSite = async (newSite: SiteCreateRequest) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/sites`,
      newSite
    );
    return data;
  };

  const createSiteMutation = useMutation(createSite, {
    onSuccess: () => {
      add_notification({ type: 'success', message: 'Site created successfully' });
      queryClient.invalidateQueries('sites');
      // Redirect to CMS
      window.location.href = '/cms';
    },
    onError: (mutationError: any) => {
      add_notification({ type: 'error', message: mutationError.message });
    },
  });

  const handlePreview = (template: Template) => {
    setPreviewData(template);
  };

  const handleSelect = (templateId: string) => {
    if (!user_authenticated) {
      add_notification({ type: 'error', message: 'Please log in to select a template and customize' });
      return;
    }
    setSelectedTemplateId(templateId);
    createSiteMutation.mutate({ template_id: templateId });
  };

  return (
    <>
      {isLoading && <div>Loading templates...</div>}
      {isError && <div>Error loading templates: {error?.message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates && templates.map((template) => (
          <div key={template.template_id} className="border p-4">
            <h3 className="font-bold">{template.name}</h3>
            <img src={template.preview_url} alt={`${template.name} preview`} className="w-full h-40 object-cover" />
            <button
              onClick={() => handlePreview(template)}
              className="bg-blue-500 text-white rounded p-2 mt-2"
            >
              Preview
            </button>
            <button
              onClick={() => handleSelect(template.template_id)}
              className="bg-green-500 text-white rounded p-2 mt-2"
            >
              Select
            </button>
          </div>
        ))}
      </div>

      {previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-xl mb-2">{previewData.name}</h2>
            <p>{previewData.description}</p>
            <button
              onClick={() => setPreviewData(null)}
              className="mt-4 bg-red-500 text-white p-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_TemplateSelection;