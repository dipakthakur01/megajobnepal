import React from 'react';
import { CompactAuthModal } from '../components/auth/CompactAuthModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (user: any) => void; // Legacy prop for compatibility
  onLoginSuccess?: (user: any) => void;
  targetUserType?: 'jobseeker' | 'employer' | 'admin';
}

export function LoginModal({ isOpen, onClose, onLogin, onLoginSuccess, targetUserType }: LoginModalProps) {
  return (
    <CompactAuthModal
      isOpen={isOpen}
      onClose={onClose}
      initialMode="login"
    />
  );
}
