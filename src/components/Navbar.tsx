'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    
    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open on mobile
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Overlay for mobile menu - click to close */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      
    <nav className="bg-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href="/" 
                className="text-xl sm:text-2xl font-bold text-blue-600 p-2 -m-2 sm:p-0 sm:m-0"  
                onClick={() => setIsMenuOpen(false)}  /* Close menu on logo click */
              >
                Das Board
              </Link>
            </div>
            {/* Desktop navigation - hidden on mobile */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 lg:space-x-8">
              <Link
                href="/"
                className="border-transparent text-gray-500 hover:border-blue-300 hover:text-gray-700 inline-flex items-center px-2 lg:px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/screenshots"
                className="border-transparent text-gray-500 hover:border-blue-300 hover:text-gray-700 inline-flex items-center px-2 lg:px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              >
                Screenshots
              </Link>
              <Link
                href="/pricing"
                className="border-transparent text-gray-500 hover:border-blue-300 hover:text-gray-700 inline-flex items-center px-2 lg:px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              >
                Pricing
              </Link>
              <Link
                href="/about-us"
                className="border-transparent text-gray-500 hover:border-blue-300 hover:text-gray-700 inline-flex items-center px-2 lg:px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                href="/legal"
                className="border-transparent text-gray-500 hover:border-blue-300 hover:text-gray-700 inline-flex items-center px-2 lg:px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              >
                Legal
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link
              href="/signup"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Up
            </Link>
          </div>
          {/* Mobile menu button - enhanced touch target */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-3 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"  /* Increased padding for touch */
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon - larger for mobile */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-7 w-7`}  /* Increased size */
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon - larger for mobile */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-7 w-7`}  /* Increased size */
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-out menu with animation */}
      <div className={`
        fixed top-16 right-0 bottom-0 w-full sm:hidden bg-white shadow-xl
        transform transition-transform duration-300 ease-in-out z-40
        ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}  /* Off-canvas sliding menu */
        <div className="pt-4 pb-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">  /* Scrollable if content exceeds viewport */
          <Link
            href="/"
            className="block pl-4 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-gray-800 transition-all duration-200"  /* Increased padding for touch targets */
            onClick={() => setIsMenuOpen(false)}  /* Auto-close menu on navigation */
          >
            Home
          </Link>
          <Link
            href="/screenshots"
            className="block pl-4 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-gray-800 transition-all duration-200"  /* Increased padding for touch targets */
            onClick={() => setIsMenuOpen(false)}  /* Auto-close menu on navigation */
          >
            Screenshots
          </Link>
          <Link
            href="/pricing"
            className="block pl-4 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-gray-800 transition-all duration-200"  /* Increased padding for touch targets */
            onClick={() => setIsMenuOpen(false)}  /* Auto-close menu on navigation */
          >
            Pricing
          </Link>
          <Link
            href="/about-us"
            className="block pl-4 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-gray-800 transition-all duration-200"  /* Increased padding for touch targets */
            onClick={() => setIsMenuOpen(false)}  /* Auto-close menu on navigation */
          >
            About Us
          </Link>
          <Link
            href="/legal"
            className="block pl-4 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-gray-800 transition-all duration-200"  /* Increased padding for touch targets */
            onClick={() => setIsMenuOpen(false)}  /* Auto-close menu on navigation */
          >
            Legal
          </Link>
          {/* Sign Up button - styled prominently on mobile */}
          <div className="px-4 pt-4 pb-2 border-t border-gray-200 mt-2">
            <Link
              href="/signup"
              className="block w-full text-center px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"  /* Full-width CTA button */
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
