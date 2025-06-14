import React, { useState } from "react";
import { Link } from "react-router-dom";
import { use_app_store } from "@/store/main";

const GV_TopNav: React.FC = () => {
  const { user_authenticated, set_user_authenticated } = use_app_store();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);

  const toggleUserProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo / Home Link */}
        <Link to="/" className="text-xl font-bold text-gray-800">
          MyPersonaSite
        </Link>

        {/* Navigation Links */}
        <div className="flex space-x-4">
          <Link to="/templates" className="text-gray-600 hover:text-gray-900">
            Template Library
          </Link>
          {user_authenticated && (
            <Link to="/cms" className="text-gray-600 hover:text-gray-900">
              CMS
            </Link>
          )}
          <Link to="/contact" className="text-gray-600 hover:text-gray-900">
            Contact Support
          </Link>
        </div>

        {/* User Profile Dropdown for Authenticated Users */}
        {user_authenticated && (
          <div className="relative">
            <button
              onClick={toggleUserProfileDropdown}
              className="flex items-center text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <span className="mr-2">Profile</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Link
                  to="/profile/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    set_user_authenticated(false);
                    setProfileDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GV_TopNav;