import React from 'react';
import { Link, useHistory } from 'react-router-dom';

const GV_Footer: React.FC = () => {
  const history = useHistory();

  // Handles clicking on legal links
  const navigateToLegal = (path: string) => {
    history.push(path);
  };

  // Handles redirection based on which social media icon is clicked
  const socialMediaRedirect = (url: string) => {
    window.open(url, '_blank');
  };

  // Handles click on contact information
  const openContactInfo = () => {
    window.location.href = 'mailto:support@example.com';
  };

  return (
    <>
      <footer className="bg-gray-800 text-white p-6 fixed bottom-0 w-full flex justify-between items-center">
        {/* Quick Links */}
        <div className="flex space-x-4">
          <Link to="/privacy-policy" onClick={() => navigateToLegal('/privacy-policy')} className="hover:underline">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" onClick={() => navigateToLegal('/terms-of-service')} className="hover:underline">
            Terms of Service
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-4">
          <button onClick={() => socialMediaRedirect('https://facebook.com')} aria-label="Facebook" className="hover:opacity-75">
            <img src="https://picsum.photos/30?1" alt="Facebook Link" />
          </button>
          <button onClick={() => socialMediaRedirect('https://twitter.com')} aria-label="Twitter" className="hover:opacity-75">
            <img src="https://picsum.photos/30?2" alt="Twitter Link" />
          </button>
          <button onClick={() => socialMediaRedirect('https://instagram.com')} aria-label="Instagram" className="hover:opacity-75">
            <img src="https://picsum.photos/30?3" alt="Instagram Link" />
          </button>
        </div>

        {/* Contact Info */}
        <div>
          <button onClick={openContactInfo} className="hover:underline">
            Contact Us
          </button>
        </div>
      </footer>
    </>
  );
};

export default GV_Footer;