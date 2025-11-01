import React from 'react';
import { AuthModal } from './auth/AuthModal';

interface EmployerSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess?: (user: any) => void;
}

export function EmployerSignupModal({ isOpen, onClose, onSignupSuccess }: EmployerSignupModalProps) {
  return (
    <AuthModal
      isOpen={isOpen}
      onClose={onClose}
      initialMode="employer-signup"
      targetUserType="employer"
      onLoginSuccess={onSignupSuccess}
    />
  );
}