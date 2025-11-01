import { useAuth as useAuthContext } from '@/components/auth/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};
