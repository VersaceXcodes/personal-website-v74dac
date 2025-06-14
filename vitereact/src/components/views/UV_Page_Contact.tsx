import React, { useEffect, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { use_app_store } from "@/store/main";
import { Link, useParams } from "react-router-dom";

interface FormConfigurations {
  nameFieldEnabled: boolean;
  emailFieldEnabled: boolean;
  messageFieldEnabled: boolean;
  captchaEnabled: boolean;
}

interface MapSettings {
  latitude: number;
  longitude: number;
  zoomLevel: number;
}

interface NotificationSettings {
  emailEnabled: boolean;
  sendCopyToSelf: boolean;
}

const UV_Page_Contact: React.FC = () => {
  const userAuthenticated = use_app_store((state) => state.user_authenticated);
  const addNotification = use_app_store((state) => state.add_notification);
  const { site_id } = useParams<{ site_id: string }>();

  // Local state for configurations
  const [formConfigurations, setFormConfigurations] = useState<FormConfigurations>({
    nameFieldEnabled: true,
    emailFieldEnabled: true,
    messageFieldEnabled: true,
    captchaEnabled: true,
  });

  const [mapSettings, setMapSettings] = useState<MapSettings>({
    latitude: 0,
    longitude: 0,
    zoomLevel: 15,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    sendCopyToSelf: false,
  });

  const queryClient = useQueryClient();

  // Mutation for saving form configurations
  const saveFormConfigurations = useMutation({
    mutationFn: async (config: FormConfigurations) => {
      const response = await axios.put(`/api/sites/${site_id}/contact`, config);
      return response.data;
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'Form configurations saved successfully.' });
      queryClient.invalidateQueries(['site_contact', site_id]);
    },
    onError: () => {
      addNotification({ type: 'error', message: 'Failed to save form configurations.' });
    },
  });

  // Mutation for updating map settings
  const updateMapSettings = useMutation({
    mutationFn: async (settings: MapSettings) => {
      const response = await axios.put(`/api/sites/${site_id}/contact`, settings);
      return response.data;
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'Map settings updated successfully.' });
      queryClient.invalidateQueries(['site_contact', site_id]);
    },
    onError: () => {
      addNotification({ type: 'error', message: 'Failed to update map settings.' });
    },
  });

  // Mutation for configuring notification settings
  const configureNotificationSettings = useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      const response = await axios.put(`/api/sites/${site_id}/contact`, settings);
      return response.data;
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'Notification settings updated successfully.' });
      queryClient.invalidateQueries(['site_contact', site_id]);
    },
    onError: () => {
      addNotification({ type: 'error', message: 'Failed to update notification settings.' });
    },
  });

  // Handle form configuration change
  const handleFormConfigurationChange = (field: keyof FormConfigurations) => {
    setFormConfigurations((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle map settings change
  const handleMapSettingsChange = (field: keyof MapSettings, value: number) => {
    setMapSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Handle notification settings change
  const handleNotificationSettingsChange = (field: keyof NotificationSettings) => {
    setNotificationSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Authentication check and UI
  if (!userAuthenticated) {
    return <div>Configuration access is restricted, please login to modify settings.</div>;
  }

  return (
    <>
      <h1>Contact Page Setup</h1>
      <div className="space-y-4">
        <div className="form-section">
          <h2>Form Configuration</h2>
          <label>
            <input
              type="checkbox"
              checked={formConfigurations.nameFieldEnabled}
              onChange={() => handleFormConfigurationChange('nameFieldEnabled')}
            />
            Enable Name Field
          </label>
          <label>
            <input
              type="checkbox"
              checked={formConfigurations.emailFieldEnabled}
              onChange={() => handleFormConfigurationChange('emailFieldEnabled')}
            />
            Enable Email Field
          </label>
          <label>
            <input
              type="checkbox"
              checked={formConfigurations.messageFieldEnabled}
              onChange={() => handleFormConfigurationChange('messageFieldEnabled')}
            />
            Enable Message Field
          </label>
          <label>
            <input
              type="checkbox"
              checked={formConfigurations.captchaEnabled}
              onChange={() => handleFormConfigurationChange('captchaEnabled')}
            />
            Enable Captcha
          </label>
          <button
            onClick={() => saveFormConfigurations.mutate(formConfigurations)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save Form Configurations
          </button>
        </div>

        <div className="map-section">
          <h2>Map Settings</h2>
          <label>
            Latitude
            <input
              type="number"
              value={mapSettings.latitude}
              onChange={(e) => handleMapSettingsChange('latitude', parseFloat(e.target.value))}
            />
          </label>
          <label>
            Longitude
            <input
              type="number"
              value={mapSettings.longitude}
              onChange={(e) => handleMapSettingsChange('longitude', parseFloat(e.target.value))}
            />
          </label>
          <label>
            Zoom Level
            <input
              type="number"
              value={mapSettings.zoomLevel}
              onChange={(e) => handleMapSettingsChange('zoomLevel', parseFloat(e.target.value))}
            />
          </label>
          <button
            onClick={() => updateMapSettings.mutate(mapSettings)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Update Map Settings
          </button>
        </div>

        <div className="notification-section">
          <h2>Notification Settings</h2>
          <label>
            <input
              type="checkbox"
              checked={notificationSettings.emailEnabled}
              onChange={() => handleNotificationSettingsChange('emailEnabled')}
            />
            Enable Email Notifications
          </label>
          <label>
            <input
              type="checkbox"
              checked={notificationSettings.sendCopyToSelf}
              onChange={() => handleNotificationSettingsChange('sendCopyToSelf')}
            />
            Send Copy to Self
          </label>
          <button
            onClick={() => configureNotificationSettings.mutate(notificationSettings)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save Notification Settings
          </button>
        </div>
      </div>
    </>
  );
};

export default UV_Page_Contact;