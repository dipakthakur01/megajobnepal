import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { LogIn } from 'lucide-react';

interface AuthTriggerProps {
  className?: string;
  variant?: 'header' | 'inline';
}

export const AuthTrigger: React.FC<AuthTriggerProps> = ({ 
  className = '', 
  variant = 'header' 
}) => {
  const navigate = useNavigate();

  const handleAuthClick = () => {
    navigate('/login');
  };

  if (variant === 'header') {
    return (
      <div className={`flex items-center ${className}`}>
        <Button
          onClick={handleAuthClick}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign In / Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex ${className}`}>
      <Button
        onClick={handleAuthClick}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Sign In / Sign Up
      </Button>
    </div>
  );
};