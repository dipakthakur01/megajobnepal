import React, { useEffect } from "react";
import "./globals.css";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    // Set document title and meta tags
    document.title = "MegaJobNepal - Find Your Dream Job in Nepal";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "Nepal's leading job portal connecting job seekers with top employers. Find jobs, build your career, and hire the best talent in Nepal.");
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = "Nepal's leading job portal connecting job seekers with top employers. Find jobs, build your career, and hire the best talent in Nepal.";
      document.head.appendChild(meta);
    }

    // Set meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', "jobs Nepal, career Nepal, employment Nepal, job portal Nepal, MegaJobNepal");
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = "jobs Nepal, career Nepal, employment Nepal, job portal Nepal, MegaJobNepal";
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="font-inter">
      {children}
    </div>
  );
}
