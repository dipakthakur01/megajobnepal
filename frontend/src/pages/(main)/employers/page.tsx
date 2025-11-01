'use client';

import { EmployersPage } from '@/components/EmployersPageNew';
import { useNavigate } from 'react-router-dom';

export default function Employers() {
  const navigate = useNavigate();

  const handleNavigation = (page: string, param?: string) => {
    switch (page) {
      case 'company-detail':
        navigate(`/company/${encodeURIComponent(param || '')}`);
        break;
      default:
        navigate(`/${page}`);
        break;
    }
  };

  return <EmployersPage onNavigate={handleNavigation} />;
}
