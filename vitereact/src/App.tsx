import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/* Import views: unique views (UV_*) and shared global views (GV_*) */
import GV_TopNav from "@/components/views/GV_TopNav.tsx";
import GV_Footer from "@/components/views/GV_Footer.tsx";
import UV_Homepage from "@/components/views/UV_Homepage.tsx";
import UV_TemplateSelection from "@/components/views/UV_TemplateSelection.tsx";
import UV_CMS from "@/components/views/UV_CMS.tsx";
import UV_Page_Blog from "@/components/views/UV_Page_Blog.tsx";
import UV_Page_Portfolio from "@/components/views/UV_Page_Portfolio.tsx";
import UV_Page_Contact from "@/components/views/UV_Page_Contact.tsx";

const queryClient = new QueryClient();

// ErrorBoundary Component to handle errors gracefully across the app
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Caught in Error Boundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong. Please try again later.</h2>;
    }

    return this.props.children;
  }
}

const AuthMessage = ({ message }) => (
  <div>{message}</div>
);

const use_app_store = create<AppState>(
  persist(
    (set) => ({
      user_authenticated: false,
      notifications: [],
      set_user_authenticated: (authenticated) =>
        set(() => ({ user_authenticated: authenticated })),
      
      add_notification: (notification) =>
        set((state) => ({ notifications: [...state.notifications, notification] })),

      remove_notification: (index) =>
        set((state) => ({
          notifications: state.notifications.filter((_, i) => i !== index),
        })),
    }),
    { name: "app-store" }
  )
);

export { use_app_store };

const App: React.FC = () => {
  const { user_authenticated } = use_app_store();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <GV_TopNav />

          <Routes>
            <Route
              path="/"
              element={
                user_authenticated ? (
                  <UV_Homepage />
                ) : (
                  <AuthMessage message="Please log in to view the Homepage" />
                )
              }
            />
            <Route path="/templates" element={<UV_TemplateSelection />} />
            <Route
              path="/cms"
              element={
                user_authenticated ? (
                  <UV_CMS />
                ) : (
                  <AuthMessage message="Please log in to manage your content" />
                )
              }
            />
            <Route
              path="/blog"
              element={
                user_authenticated ? (
                  <UV_Page_Blog />
                ) : (
                  <AuthMessage message="Please log in to manage your blogs" />
                )
              }
            />
            <Route
              path="/portfolio"
              element={
                user_authenticated ? (
                  <UV_Page_Portfolio />
                ) : (
                  <AuthMessage message="Please log in to manage your portfolio" />
                )
              }
            />
            <Route
              path="/contact"
              element={
                user_authenticated ? (
                  <UV_Page_Contact />
                ) : (
                  <AuthMessage message="Configuration is restricted, but viewable" />
                )
              }
            />
          </Routes>

          <GV_Footer />
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;