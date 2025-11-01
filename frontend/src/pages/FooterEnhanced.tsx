import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
const companyLogo = '/CompanyLogo.png';

export function FooterEnhanced() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  // Navigation helper function
  const navigateTo = (path: string) => {
    window.open(path, '_self');
  };

  // Open external link in new tab
  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Show modal with content
  const showModalContent = (title: string, content: string) => {
    setModalContent({ title, content });
    setShowModal(true);
  };

  // Newsletter subscription
  const handleNewsletterSubmit = () => {
    if (!newsletterEmail) {
      toast.error('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Simulate newsletter subscription
    toast.success('Successfully subscribed to job alerts!');
    setNewsletterEmail('');
  };

  const quickLinks = [
    { name: 'About Us', action: () => navigateTo('/about') },
    { name: 'How It Works', action: () => showModalContent('How It Works', 'MegaJobNepal connects job seekers with employers through our comprehensive platform. Job seekers can browse jobs, apply online, and track applications. Employers can post jobs, search resumes, and manage candidates efficiently.') },
    { name: 'Pricing', action: () => navigateTo('/employers') },
    { name: 'FAQs', action: () => showModalContent('Frequently Asked Questions', 'Q: How do I create an account?\nA: Click the Login/Register button and fill out the form.\n\nQ: Is the service free for job seekers?\nA: Yes, all job seeker features are completely free.\n\nQ: How do I post a job?\nA: Employers can post jobs through the employer dashboard after registration.\n\nQ: How do I edit my profile?\nA: Log in to your dashboard to edit your profile information.') },
    { name: 'Contact Us', action: () => navigateTo('/contact') },
    { name: 'Blog', action: () => navigateTo('/blogs') }
  ];

  const forJobSeekers = [
    { name: 'Browse Jobs', action: () => navigateTo('/jobs') },
    { name: 'Career Advice', action: () => navigateTo('/blogs') },
    { name: 'Resume Builder', action: () => showModalContent('Resume Builder', 'Create a professional resume using our built-in resume builder. Log in to your job seeker dashboard to access this feature and create compelling resumes that stand out to employers.') },
    { name: 'Interview Tips', action: () => navigateTo('/blogs') },
    { name: 'Salary Guide', action: () => showModalContent('Salary Guide', 'Get insights into salary ranges for different positions across Nepal. Our salary guide helps you understand market rates and negotiate better compensation packages.') },
    { name: 'Job Alerts', action: () => showModalContent('Job Alerts', 'Set up personalized job alerts based on your preferences. Get notified when new jobs matching your criteria are posted. Available in your job seeker dashboard.') }
  ];

  const forEmployers = [
    { name: 'Post a Job', action: () => navigateTo('/employer/dashboard') },
    { name: 'Browse Resumes', action: () => navigateTo('/employer/dashboard') },
     { name: 'Recruiting Solutions', action: () => navigateTo('/employers') },
     { name: 'Employer Branding', action: () => navigateTo('/employers') },
     { name: 'Hiring Events', action: () => showModalContent('Hiring Events', 'Organize and participate in virtual hiring events to connect with top talent. Contact our team to learn more about hosting hiring events on our platform.') },
     { name: 'Talent Solutions', action: () => navigateTo('/employers') }
  ];

  const categories = [
    { name: 'Information Technology', action: () => navigateTo('/jobs?category=Information Technology') },
    { name: 'Banking & Finance', action: () => navigateTo('/jobs?category=Banking & Finance') },
    { name: 'Sales & Marketing', action: () => navigateTo('/jobs?category=Sales & Marketing') },
    { name: 'Engineering', action: () => navigateTo('/jobs?category=Engineering') },
    { name: 'Healthcare', action: () => navigateTo('/jobs?category=Healthcare') },
    { name: 'Education', action: () => navigateTo('/jobs?category=Education') }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated with Latest Jobs</h3>
            <p className="text-blue-100 mb-6">Subscribe to our newsletter and get job alerts directly in your inbox</p>
            <div className="max-w-md mx-auto flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNewsletterSubmit()}
                className="bg-white text-gray-900 border-0"
              />
              <Button 
                onClick={handleNewsletterSubmit}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <img 
                  src={companyLogo} 
                  alt="MegaJob" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-gray-400 mb-4">
                Nepal's leading job portal connecting talented professionals with top employers across the country.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Kathmandu, Nepal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+977 1-4444444</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@megajobnepal.com.np</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Button 
                      variant="link" 
                      className="text-gray-400 hover:text-white p-0 h-auto justify-start"
                      onClick={link.action}
                    >
                      {link.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Job Seekers */}
            <div>
              <h4 className="text-lg font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2">
                {forJobSeekers.map((link, index) => (
                  <li key={index}>
                    <Button 
                      variant="link" 
                      className="text-gray-400 hover:text-white p-0 h-auto justify-start"
                      onClick={link.action}
                    >
                      {link.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h4 className="text-lg font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2">
                {forEmployers.map((link, index) => (
                  <li key={index}>
                    <Button 
                      variant="link" 
                      className="text-gray-400 hover:text-white p-0 h-auto justify-start"
                      onClick={link.action}
                    >
                      {link.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Job Categories */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Popular Categories</h4>
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <li key={index}>
                    <Button 
                      variant="link" 
                      className="text-gray-400 hover:text-white p-0 h-auto justify-start"
                      onClick={category.action}
                    >
                      {category.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      {/* Bottom Footer */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              <p>&copy; 2024 MegaJob. All rights reserved.</p>
              <button 
                onClick={() => navigateTo('/auth-test')}
                className="text-gray-400 hover:text-white text-xs block mt-1 underline"
              >
                🔧 Auth Test
              </button>
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6 text-sm">
              <Button 
                variant="link" 
                className="text-gray-400 hover:text-white p-0 h-auto"
                onClick={() => showModalContent('Privacy Policy', 'Our Privacy Policy outlines how we collect, use, and protect your personal information. We are committed to maintaining the confidentiality and security of your data.')}
              >
                Privacy Policy
              </Button>
              <Button 
                variant="link" 
                className="text-gray-400 hover:text-white p-0 h-auto"
                onClick={() => showModalContent('Terms of Service', 'By using MegaJobNepal, you agree to our terms and conditions. These terms govern your use of our platform and services.')}
              >
                Terms of Service
              </Button>
              <Button 
                variant="link" 
                className="text-gray-400 hover:text-white p-0 h-auto"
                onClick={() => showModalContent('Cookie Policy', 'We use cookies to enhance your browsing experience and provide personalized content. Learn more about our cookie usage and how to manage your preferences.')}
              >
                Cookie Policy
              </Button>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-gray-800"
                onClick={() => openExternal('https://facebook.com/megajobnepal')}
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-gray-800"
                onClick={() => openExternal('https://twitter.com/megajobnepal')}
              >
                <Twitter className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-gray-800"
                onClick={() => openExternal('https://instagram.com/megajobnepal')}
              >
                <Instagram className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-gray-800"
                onClick={() => openExternal('https://linkedin.com/company/megajobnepal')}
              >
                <Linkedin className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App Promotion */}
      <div className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-2">Get the MegaJob App</h4>
            <p className="text-gray-400 mb-4">Apply for jobs on the go. Download our mobile app.</p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
                onClick={() => openExternal('https://play.google.com/store')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                    <span className="text-xs text-gray-900 font-bold">▶</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
                onClick={() => openExternal('https://apps.apple.com')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                    <span className="text-xs text-gray-900 font-bold">🍎</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for displaying content */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl" aria-describedby="modal-description">
          <DialogHeader>
            <DialogTitle>{modalContent.title}</DialogTitle>
            <DialogDescription id="modal-description" className="whitespace-pre-line text-left">
              {modalContent.content}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}

