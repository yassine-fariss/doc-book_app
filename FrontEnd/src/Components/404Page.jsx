import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";

const PageNotfond = () => {
  document.title = "404 - Page Not Found";
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-xl space-y-8 animate-fade-in">
        
        {/* Error Icon badge */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
            <ExclamationTriangleIcon className="w-10 h-10" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-3">
          <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">404</h1>
          <h2 className="text-xl font-bold text-gray-800">Oops! Page Not Found</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-full hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm shadow-md"
          >
            <HomeIcon className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PageNotfond;
