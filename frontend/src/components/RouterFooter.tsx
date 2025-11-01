import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
const companyLogo = '/images/Megajoblogo-removebg-preview.png';

export default function RouterFooter() {
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  const openExternal = (url: string) => {
    window.open(url, '_blank');
  };

  const showModalContent = (title: string, content: string) => {
    setModalContent({ title, content });
    setShowModal(true);
  };

  const handleNewsletterSubmit = () => {
    if (!newsletterEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(newsletterEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Simulate newsletter subscription
    toast.success('Successfully subscribed to newsletter!');
    setNewsletterEmail('');
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Employers', path: '/employers' },
    { name: 'Pricing', path: '/employers' },
    { name: 'FAQs', action: () => showModalContent('Frequently Asked Questions', 'Q: How do I create an account?\nA: Click the Login/Register button and fill out the form.\n\nQ: Is the service free for job seekers?\nA: Yes, all job seeker features are completely free.\n\nQ: How do I post a job?\nA: Employers can post jobs through the employer dashboard after registration.\n\nQ: How do I edit my profile?\nA: Log in to your dashboard to edit your profile information.') },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Blog', path: '/blogs' }
  ];

  const forJobSeekers = [
    { name: 'Browse Jobs', path: '/jobs' },
    { name: 'Career Advice', path: '/blogs' },
    { name: 'Resume Builder', action: () => showModalContent('Resume Builder', 'Create a professional resume using our built-in resume builder. Log in to your job seeker dashboard to access this feature and create compelling resumes that stand out to employers.') },
    { name: 'Interview Tips', path: '/blogs' },
    { name: 'Salary Guide', action: () => showModalContent('Salary Guide', 'Get insights into salary ranges for different positions across Nepal. Our salary guide helps you understand market rates and negotiate better compensation packages.') },
    { name: 'Job Alerts', action: () => showModalContent('Job Alerts', 'Set up personalized job alerts based on your preferences. Get notified when new jobs matching your criteria are posted. Available in your job seeker dashboard.') }
  ];

  const forEmployers = [
    { name: 'Post a Job', path: '/employer/dashboard' },
    { name: 'Browse Resumes', path: '/employer/dashboard' },
     { name: 'Recruiting Solutions', path: '/employers' },
     { name: 'Employer Branding', path: '/employers' },
     { name: 'Hiring Events', action: () => showModalContent('Hiring Events', 'Organize and participate in virtual hiring events to connect with top talent. Contact our team to learn more about hosting hiring events on our platform.') },
     { name: 'Talent Solutions', path: '/employers' }
  ];

  const categories = [
    { name: 'Information Technology', path: '/jobs?category=Information Technology' },
    { name: 'Banking & Finance', path: '/jobs?category=Banking & Finance' },
    { name: 'Sales & Marketing', path: '/jobs?category=Sales & Marketing' },
    { name: 'Engineering', path: '/jobs?category=Engineering' },
    { name: 'Healthcare', path: '/jobs?category=Healthcare' },
    { name: 'Education', path: '/jobs?category=Education' }
  ];

  const renderNavigationItem = (item: any, index: number) => {
    if (item.action) {
      return (
        <li key={index}>
          <Button 
            variant="link" 
            className="text-gray-400 hover:text-white p-0 h-auto font-normal justify-start"
            onClick={item.action}
          >
            {item.name}
          </Button>
        </li>
      );
    }
    
    return (
      <li key={index}>
        <Link 
          to={item.path}
          className="text-gray-400 hover:text-white transition-colors duration-200"
        >
          {item.name}
        </Link>
      </li>
    );
  };

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
                  className="h-14 w-auto object-contain"
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
                {quickLinks.map((link, index) => renderNavigationItem(link, index))}
              </ul>
            </div>

            {/* For Job Seekers */}
            <div>
              <h4 className="text-lg font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2">
                {forJobSeekers.map((link, index) => renderNavigationItem(link, index))}
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h4 className="text-lg font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2">
                {forEmployers.map((link, index) => renderNavigationItem(link, index))}
              </ul>
            </div>

            {/* Job Categories */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Popular Categories</h4>
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <li key={index}>
                    <Link 
                      to={category.path}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Bottom Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © 2024 MegaJob Nepal. All rights reserved.
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white p-2"
                onClick={() => openExternal('https://facebook.com')}
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white p-2"
                onClick={() => openExternal('https://twitter.com')}
              >
                <Twitter className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white p-2"
                onClick={() => openExternal('https://linkedin.com')}
              >
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white p-2"
                onClick={() => openExternal('https://instagram.com')}
              >
                <Instagram className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white p-2"
                onClick={() => openExternal('https://youtube.com')}
              >
                <Youtube className="w-5 h-5" />
              </Button>
            </div>

            {/* Legal Links */}
            <div className="flex space-x-4 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* App Download Section */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-4">Download Our Mobile App</h4>
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="outline" 
                  className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
                  onClick={() => openExternal('https://play.google.com')}
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
                  className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
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
