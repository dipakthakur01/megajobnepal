import React from 'react';
import { CompactAuthModal } from './auth/CompactAuthModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (user: any) => void;
  onLoginSuccess?: (user: any) => void;
  targetUserType?: string;
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
