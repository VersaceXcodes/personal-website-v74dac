import create from "zustand";
import { persist } from "zustand/middleware";

// Define a type for Notification object
interface Notification {
  type: string;
  message: string;
}

// Define the shape of our global store
interface AppState {
  user_authenticated: boolean;
  notifications: Notification[];
  
  set_user_authenticated: (authenticated: boolean) => void;
  add_notification: (notification: Notification) => void;
  remove_notification: (index: number) => void;
}

// Create the Zustand store with persistence using persist middleware
export const use_app_store = create<AppState>()(
  persist(
    (set) => ({
      user_authenticated: false, // Initial default state for user authentication
      notifications: [],         // Initial empty array for notifications
      
      set_user_authenticated: (authenticated) =>
        set(() => ({ user_authenticated: authenticated })),

      add_notification: (notification) =>
        set((state) => ({ notifications: [...state.notifications, notification] })),

      remove_notification: (index) =>
        set((state) => ({
          notifications: state.notifications.filter((_, i) => i !== index),
        })),
    }),
    {
      name: "app-storage", // unique name for storage item
    }
  )
);