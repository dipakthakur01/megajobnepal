import React, { useMemo, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent } from './ui/tabs';
import { Progress } from './ui/progress';
import { Home, Briefcase, Users, FileText, Building2, BarChart3, Settings, Search, Bell, Mail, CreditCard, HelpCircle, Plus, Menu, Upload, LogOut } from 'lucide-react';
import { Job, Application, User as UserType, useApp } from '../pages/providers/AppProvider';
import { employerService } from '../services/employerService';
import companyParameterService from '../services/companyParameterService';
import { apiClient as api } from '../services/api';
 import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { browserDBService } from '../services/browser-db';

const DEFAULT_COMPANY_SIZES = [
  { name: '1-10', range: '1-10' },
  { name: '11-50', range: '11-50' },
  { name: '51-200', range: '51-200' },
  { name: '200+', range: '200+' },
];

interface Props {
  user: UserType;
  jobs: Job[];
  applications: Application[];
  onApplicationUpdate: (a: Application[]) => void;
  onLogout: () => void;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
}

export function EmployerDashboard({ user, jobs, applications, onApplicationUpdate, onLogout, onSidebarCollapsedChange }: Props) {
  const [tab, setTab] = useState<string>(() => {
    try {
      const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
      const stored = localStorage.getItem(`employer_dashboard_tab_${uid}`);
      return stored || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });
  const [company, setCompany] = useState({ name: user?.company || user?.name || 'Company', industry: '', size: '', location: '', website: '', description: '', contact_email: (user as any)?.email || '', contact_phone: (user as any)?.phone_number || '' });
  const [plan, setPlan] = useState({ name: 'Free', credits: 0, expires: '—' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
      const stored = localStorage.getItem(`employer_sidebar_collapsed_${uid}`);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const { companies, setCompanies } = useApp();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    try {
      const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
      return localStorage.getItem(`employer_logo_url_${uid}`);
    } catch {
      return null;
    }
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoCacheBust, setLogoCacheBust] = useState<number | null>(null);
  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setLogoPreviewUrl(null);
  }, [logoFile]);
  // --- New state for flexible logo preview shape ---
  const [logoShape, setLogoShape] = useState<'square' | 'circle' | 'wide'>(() => {
    try {
      const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
      const s = localStorage.getItem(`employer_logo_shape_${uid}`);
      if (s === 'circle' || s === 'wide' || s === 'square') return s as any;
    } catch {}
    return 'square';
  });
  // --- New state for backend wiring ---
  const [employerJobs, setEmployerJobs] = useState<any[]>([]);
  const [employerApplications, setEmployerApplications] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [candidateResults, setCandidateResults] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [companyTypes, setCompanyTypes] = useState<any[]>([]);
  const [jobCategories, setJobCategories] = useState<any[]>([]);
  // removed duplicate state: candidateResults

  // Job form and company ID state
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobRequirements, setJobRequirements] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<string>('full-time');
  const [experienceLevel, setExperienceLevel] = useState<string>('entry');
  const [categoryId, setCategoryId] = useState<string>('');
  // Structured salary inputs
  const [salaryType, setSalaryType] = useState<string>('exact');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [salary, setSalary] = useState<string>('');
  const [payType, setPayType] = useState<string>('Monthly');
  const [publishingJob, setPublishingJob] = useState(false);
  const [jobErrors, setJobErrors] = useState<Record<string, string>>({});
  const [deadline, setDeadline] = useState<string>('');
  const [logoError, setLogoError] = useState(false);

  // Restore dashboard prefs from localStorage on mount
  useEffect(() => {
    try {
      // Clear legacy unscoped keys to prevent cross-account leakage
      localStorage.removeItem('employer_logo_url');
      localStorage.removeItem('employer_dashboard_tab');
      localStorage.removeItem('employer_sidebar_collapsed');
      localStorage.removeItem('employer_logo_shape');

      const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
      const storedLogo = localStorage.getItem(`employer_logo_url_${uid}`);
      const storedTab = localStorage.getItem(`employer_dashboard_tab_${uid}`);
      const storedCollapsed = localStorage.getItem(`employer_sidebar_collapsed_${uid}`);
      const storedShape = localStorage.getItem(`employer_logo_shape_${uid}`);
      if (storedLogo && storedLogo !== logoUrl) setLogoUrl(storedLogo);
      if (storedTab && storedTab !== tab) setTab(storedTab);
      if (storedCollapsed !== null) {
        const collapsedVal = storedCollapsed === 'true';
        if (collapsedVal !== sidebarCollapsed) setSidebarCollapsed(collapsedVal);
      }
      if (storedShape === 'circle' || storedShape === 'wide' || storedShape === 'square') {
        if (storedShape !== logoShape) setLogoShape(storedShape as any);
      }
    } catch {}
  }, [user]);

  // Persist prefs to localStorage (scoped per employer)
  useEffect(() => {
    try {
      const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
      localStorage.setItem(`employer_dashboard_tab_${uid}`, tab);
    } catch {}
  }, [tab, user]);
  useEffect(() => {
    try {
      const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
      localStorage.setItem(`employer_sidebar_collapsed_${uid}`, String(sidebarCollapsed));
    } catch {}
  }, [sidebarCollapsed, user]);
  // Inform parent layout so header padding tracks sidebar width
  useEffect(() => {
    onSidebarCollapsedChange?.(sidebarCollapsed);
  }, [sidebarCollapsed, onSidebarCollapsedChange]);
  useEffect(() => {
    try {
      const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
      if (logoUrl) localStorage.setItem(`employer_logo_url_${uid}`, logoUrl);
    } catch {}
  }, [logoUrl, user]);
  useEffect(() => {
    try {
      const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
      localStorage.setItem(`employer_logo_shape_${uid}`, logoShape);
    } catch {}
  }, [logoShape, user]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await employerService.getCurrentEmployer();
        const url = (res as any)?.company?.logo_url || (res as any)?.logoUrl || (res as any)?.company?.logo || (res as any)?.logo_url || null;
        const cid = (res as any)?._id || (res as any)?.id || (res as any)?.company?._id || (res as any)?.company?.id || null;
        if (cid) setCompanyId(String(cid));
        if (url) setLogoUrl(url);
        setCompany(prev => ({
          ...prev,
          name: (res as any)?.company?.name || (res as any)?.name || prev.name,
          industry: (res as any)?.company?.industry || (res as any)?.industry || prev.industry,
          size: (res as any)?.company?.company_size || (res as any)?.company?.size || (res as any)?.company_size || (res as any)?.size || prev.size,
          location: (res as any)?.company?.location || (res as any)?.location || prev.location,
          website: (res as any)?.company?.website || (res as any)?.website || prev.website,
          description: (res as any)?.company?.description || (res as any)?.description || prev.description,
          contact_email: (res as any)?.company?.contact_email || (res as any)?.contact_email || prev.contact_email,
          contact_phone: (res as any)?.company?.contact_phone || (res as any)?.contact_phone || prev.contact_phone,
        }));
      } catch (e) {
        // silent failure is fine for initial load
      }
    };
    init();
  }, []);

  // Fetch dropdown parameters from admin-managed lists
  useEffect(() => {
    const loadParams = async () => {
      try {
        const inds = await companyParameterService.list('industry');
        // For company size, use fixed ranges (backend manages company_type separately)
        setIndustries(Array.isArray(inds?.items) ? inds.items : Array.isArray(inds) ? inds : []);
        setCompanyTypes(DEFAULT_COMPANY_SIZES);
      } catch {
        // ignore errors; UI will show fallback options
        setCompanyTypes(DEFAULT_COMPANY_SIZES);
      }
    };
    loadParams();
  }, []);

  // Fetch job categories from backend or local fallbacks
  useEffect(() => {
    const loadCategories = async () => {
      let items: any[] = [];
      try {
        const res: any = await companyParameterService.list('job_category');
        items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      } catch {
        // ignore
      }
      if (!items?.length) {
        try {
          const local = await browserDBService.getJobCategories();
          items = Array.isArray(local) ? local : [];
        } catch {}
      }
      if (!items?.length) {
        items = [
          { id: 'information_technology', name: 'Information Technology' },
          { id: 'marketing_sales', name: 'Marketing & Sales' },
          { id: 'finance_accounting', name: 'Finance & Accounting' },
          { id: 'hr_admin', name: 'HR & Admin' },
          { id: 'design', name: 'Design' },
          { id: 'others', name: 'Others' },
        ];
      }
      setJobCategories(items);
    };
    loadCategories();
  }, []);

  // Fetch backend data when tabs change
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (tab === 'jobs') {
          // Fetch only the authenticated employer's jobs
          const res: any = await api.request('/jobs/my-jobs');
          const items = Array.isArray(res?.jobs) ? res.jobs : Array.isArray(res) ? res : [];
          setEmployerJobs(items);
        } else if (tab === 'applicants') {
          // Use authenticated applications endpoint
          const res: any = await api.getApplications();
          const items = Array.isArray((res as any)?.applications) ? (res as any).applications : Array.isArray(res) ? res : [];
          setEmployerApplications(items);
        } else if (tab === 'dashboard') {
          // Populate dashboard stats with employer-scoped data
          try {
            const jobsRes: any = await api.request('/jobs/my-jobs');
            const jobsItems = Array.isArray(jobsRes?.jobs) ? jobsRes.jobs : Array.isArray(jobsRes) ? jobsRes : [];
            setEmployerJobs(jobsItems);
          } catch {}
          try {
            const appsRes: any = await api.getApplications();
            const appsItems = Array.isArray(appsRes?.applications) ? appsRes.applications : Array.isArray(appsRes) ? appsRes : [];
            setEmployerApplications(appsItems);
          } catch {}
        } else if (tab === 'messages') {
          // Ensure candidates list is available when composing messages
          setIsCandidateLoading(true);
          try {
            const appsRes: any = await api.getApplications();
            const appsItems = Array.isArray(appsRes?.applications) ? appsRes.applications : Array.isArray(appsRes) ? appsRes : [];
            setEmployerApplications(appsItems);
          } catch {
            // keep UI responsive even if backend endpoints aren't ready
          } finally {
            setIsCandidateLoading(false);
          }
        } else if (tab === 'analytics') {
          const res = await employerService.getAnalytics();
          setAnalyticsData(res || null);
        } else if (tab === 'subscription') {
          // Load real subscription info
          try {
            const sub: any = await employerService.getSubscriptionInfo();
            const info = (sub as any)?.subscription || sub || {};
            setPlan({
              name: String(info?.plan?.name || info?.plan || 'Free'),
              credits: Number(info?.credits || info?.remaining_credits || 0),
              expires: String(info?.expires_at || info?.expiry || '—')
            });
          } catch {}
        } else if (tab === 'talent') {
          const res = await employerService.searchCandidates({});
          const items = Array.isArray((res as any)?.candidates) ? (res as any).candidates : Array.isArray(res) ? res : [];
          setCandidateResults(items);
        }
      } catch (e) {
        // keep UI responsive even if backend endpoints aren't ready
      }
    };
    fetchData();
  }, [tab]);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'jobs', label: 'Job Management', icon: Briefcase },
    { id: 'applicants', label: 'Applicants', icon: Users },
    { id: 'talent', label: 'Resume Search', icon: Search },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'subscription', label: 'Plans', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  const stats = useMemo(() => ({
    // Only count employer-scoped datasets; if none, show 0 to avoid leakage
    activeJobs: employerJobs.filter(j => (j as any)?.status !== 'closed').length,
    totalApps: employerApplications.length,
    shortlisted: employerApplications.filter(a => (a as any)?.status === 'shortlisted').length,
    hired: employerApplications.filter(a => (a as any)?.status === 'hired').length
  }), [employerJobs, employerApplications]);

  // Messaging state
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  // Conversations state (simple client-side history for sent messages)
  const [messagesHistory, setMessagesHistory] = useState<any[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(false);
  const [isCandidateLoading, setIsCandidateLoading] = useState<boolean>(false);
  const [unreadByCandidate, setUnreadByCandidate] = useState<Record<string, number>>({});
  const totalUnread = useMemo(() => Object.values(unreadByCandidate).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0), [unreadByCandidate]);
  const uniqueCandidates = useMemo(() => {
    const map = new Map<string, any>();
    for (const ap of employerApplications) {
      const candidate = (ap as any)?.job_seeker || (ap as any)?.candidate || null;
      const id = String(candidate?._id || candidate?.id || (ap as any)?.job_seeker_id || '');
      const name = candidate?.full_name || candidate?.name || (ap as any)?.name || 'Unknown';
      if (id) {
        if (!map.has(id)) map.set(id, { id, name });
      }
    }
    return Array.from(map.values());
  }, [employerApplications]);

  // Load conversations from localStorage when entering Messages tab
  useEffect(() => {
    if (tab === 'messages') {
      setIsMessagesLoading(true);
      try {
        const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
        const stored = localStorage.getItem(`employer_messages_${uid}`);
        const parsed = stored ? JSON.parse(stored) : [];
        setMessagesHistory(Array.isArray(parsed) ? parsed : []);
        // Load unread counts
        const unreadStored = localStorage.getItem(`employer_unread_${uid}`);
        const unreadParsed = unreadStored ? JSON.parse(unreadStored) : {};
        setUnreadByCandidate(unreadParsed && typeof unreadParsed === 'object' ? unreadParsed : {});
      } catch {
        setMessagesHistory([]);
        setUnreadByCandidate({});
      } finally {
        setIsMessagesLoading(false);
      }
    }
  }, [tab]);

  // Load unread counts on mount to show sidebar badge
  useEffect(() => {
    try {
      const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
      const unreadStored = localStorage.getItem(`employer_unread_${uid}`);
      const unreadParsed = unreadStored ? JSON.parse(unreadStored) : {};
      setUnreadByCandidate(unreadParsed && typeof unreadParsed === 'object' ? unreadParsed : {});
    } catch {}
  }, []);

  const NavItem = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button onClick={() => setTab(id)} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${tab===id? 'bg-primary text-white':'hover:bg-muted'} w-full`}>
      <span className="flex items-center gap-2"><Icon className="w-4 h-4"/>{label}</span>
      {id === 'messages' && totalUnread > 0 && (
        <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{totalUnread}</span>
      )}
    </button>
  );

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    setUploadingLogo(true);
    try {
      const res = await employerService.uploadCompanyLogo(logoFile);
      const finalUrl = (res as any)?.url || (res as any)?.logo_url || (res as any)?.logoUrl || null;
      if (finalUrl) {
        setLogoUrl(finalUrl);
        setLogoPreviewUrl(null);
        setLogoError(false);
        setLogoCacheBust(Date.now());
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveCompany = async () => {
    try {
      const payload = {
        name: company.name,
        industry: company.industry,
        company_size: company.size,
        location: company.location,
        website: company.website,
        description: company.description,
        contact_email: company.contact_email,
        contact_phone: company.contact_phone,
      };
      await employerService.updateEmployerProfile(payload);
      const employerIdStr = (user as any)?.id?.toString?.() || String((user as any)?.id || '');
      setCompanies(prev => {
        let found = false;
        const next = (prev || []).map((c: any) => {
          if ((c?.employer_id && String(c.employer_id) === employerIdStr) || (c?.name && c.name === company.name)) {
            found = true;
            return { ...c, ...payload, logo_url: logoUrl || c.logo_url };
          }
          return c;
        });
        if (!found) {
          return [...next, { ...payload, employer_id: employerIdStr, logo_url: logoUrl }];
        }
        return next;
      });
      try { localStorage.setItem('employer_company_profile', JSON.stringify({ ...payload, logo_url: logoUrl })); } catch {}
      toast.success('Company profile saved');
    } catch (error: any) {
      toast.error(error?.message || 'Save failed');
    }
  };

  const handlePublishJob = async () => {
    const errors: Record<string, string> = {};
    if (!jobTitle.trim()) errors.title = 'Title is required';
    if (!jobDescription.trim()) errors.description = 'Description is required';
    if (!jobRequirements.trim()) errors.requirements = 'Requirements are required';
    if (!jobLocation.trim()) errors.location = 'Location is required';
    if (!categoryId) errors.category_id = 'Category is required';
    if (!companyId) errors.company_id = 'Company not found';
    if (!deadline) errors.deadline = 'Deadline is required';
    setJobErrors(errors);
    if (Object.keys(errors).length) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setPublishingJob(true);
    try {
      const payload: any = {
        title: jobTitle.trim(),
        description: jobDescription.trim(),
        requirements: jobRequirements.trim(),
        // wire structured salary fields + derive salary_range for compatibility
        salary_type: salaryType,
        salary: salaryType === 'exact' ? (salary || '').trim() : undefined,
        salary_min: salaryType === 'range' ? (salaryMin || '').trim() : undefined,
        salary_max: salaryType === 'range' ? (salaryMax || '').trim() : undefined,
        salary_currency: 'NPR',
        salary_range: (() => {
          const currency = 'NPR';
          if (salaryType === 'negotiable') return 'Negotiable';
          if (salaryType === 'competitive') return 'Competitive';
          if (salaryType === 'range' && salaryMin && salaryMax) {
            const mi = parseInt(String(salaryMin));
            const ma = parseInt(String(salaryMax));
            if (!isNaN(mi) && !isNaN(ma)) return `${currency} ${mi.toLocaleString()} - ${ma.toLocaleString()} ${payType}`;
          }
          if (salaryType === 'exact' && salary) {
            const amt = parseInt(String(salary));
            if (!isNaN(amt)) return `${currency} ${amt.toLocaleString()} ${payType}`;
          }
          return '';
        })(),
        location: jobLocation.trim(),
        category_id: categoryId,
        company_id: companyId,
        employment_type: employmentType,
        experience_level: experienceLevel,
        deadline: deadline,
      };
      const res = await api.createJob(payload);
      const newJob = (res as any)?.job || res;
      setEmployerJobs(prev => [newJob, ...(prev || [])]);
      toast.success('Job published');
      setJobTitle('');
      setJobDescription('');
      setJobRequirements('');
      setJobLocation('');
      setSalaryType('exact');
      setSalary('');
      setSalaryMin('');
      setSalaryMax('');
      setPayType('Monthly');
      setEmploymentType('full-time');
      setExperienceLevel('entry');
      setCategoryId('');
      setDeadline('');
      setJobErrors({});
    } catch (error: any) {
      const message = error?.message || 'Failed to publish job';
      setJobErrors(prev => ({ ...prev, server: message }));
      toast.error(message);
    } finally {
      setPublishingJob(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-sm fixed top-0 bottom-0 h-auto overflow-y-auto z-10`}>
          <div className={`${sidebarCollapsed ? 'px-2 py-2' : 'p-4'} border-b border-gray-200`}>
            <div className={`flex items-center justify-between`}>
              {!sidebarCollapsed && (
                <div className="flex items-center justify-center">
                  <img
                    src="/CompanyLogo.png"
                    alt="Company Logo"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              )}
              {/* Hide logo entirely when sidebar is collapsed */}
              <Button
                variant={sidebarCollapsed ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={sidebarCollapsed ? 'p-2' : ''}
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <nav className="mt-4 pb-20">
            {sidebarItems.map(item => {
              const Icon = item.icon as any;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left ${active ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-0 right-0 px-4">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Logout</span>}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-6 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Welcome, {user?.name || 'Employer'}</h2>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setTab('jobs')} className="gap-2"><Plus className="w-4 h-4"/>Post New Job</Button>
              <Button size="sm" variant="outline" onClick={() => setTab('applicants')}>View Applicants</Button>
              <Button size="sm" variant="outline" onClick={() => setTab('subscription')}>Upgrade Plan</Button>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[{label:'Active Jobs',v:stats.activeJobs},{label:'Total Applications',v:stats.totalApps},{label:'Shortlisted',v:stats.shortlisted},{label:'Hired',v:stats.hired}].map(c=> (
                  <Card key={c.label}><CardContent className="p-4"><div className="text-sm text-muted-foreground">{c.label}</div><div className="text-2xl font-bold">{c.v}</div></CardContent></Card>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card><CardHeader><CardTitle>Applications over time</CardTitle></CardHeader><CardContent><div className="h-32 bg-muted rounded"/></CardContent></Card>
                <Card><CardHeader><CardTitle>Job views performance</CardTitle></CardHeader><CardContent><div className="h-32 bg-muted rounded"/></CardContent></Card>
              </div>
            </TabsContent>

            <TabsContent value="company" forceMount>
              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    {/* Flexible profile preview: square | circle | wide rectangle */}
                    <div
                      className={`${logoShape === 'circle' ? 'h-24 w-24 rounded-full' : logoShape === 'wide' ? 'h-20 w-40 rounded-md' : 'h-24 w-24 rounded-md'} border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center`}
                    >
                      {logoUrl ? (
                        <img
                          key={logoPreviewUrl || logoUrl || 'placeholder'}
                          src={logoPreviewUrl || normalizeLogoUrl(logoUrl)}
                          alt={company.name || 'Company'}
                          className="max-h-full max-w-full object-contain"
                          onError={() => setLogoError(true)}
                        />
                      ) : (
                        <span className="text-2xl font-semibold text-gray-600">{(company.name || 'C').slice(0, 1)}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Button size="sm" variant={logoShape === 'square' ? 'default' : 'outline'} onClick={() => setLogoShape('square')}>Square</Button>
                        <Button size="sm" variant={logoShape === 'circle' ? 'default' : 'outline'} onClick={() => setLogoShape('circle')}>Circle</Button>
                        <Button size="sm" variant={logoShape === 'wide' ? 'default' : 'outline'} onClick={() => setLogoShape('wide')}>Rectangle</Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        onClick={handleUploadLogo}
                        disabled={uploadingLogo}
                      >
                        <Upload className="w-4 h-4 mr-2" /> {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </Button>
                      {logoError && (
                        <div className="text-xs text-red-600">
                          Image failed to load. <a href={normalizeLogoUrl(logoUrl || '')} target="_blank" rel="noreferrer" className="underline">Open URL</a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><Label>Name</Label><Input value={company.name} onChange={e=>setCompany({...company,name:e.target.value})}/></div>
                    <div>
                      <Label>Industry</Label>
                      <Select value={company.industry} onValueChange={(v)=>setCompany({...company,industry:v})}>
                        <SelectTrigger><SelectValue placeholder="Select industry"/></SelectTrigger>
                        <SelectContent>
                          {industries.length ? industries.map((it:any)=>(
                            <SelectItem key={it._id || it.name} value={it.name}>{it.name}</SelectItem>
                          )) : (
                            <>
                              <SelectItem value="IT">IT</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="Education">Education</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Company Size</Label>
                      <Select value={company.size} onValueChange={(v)=>setCompany({...company,size:v})}>
                        <SelectTrigger><SelectValue placeholder="Select size"/></SelectTrigger>
                        <SelectContent>
                          {companyTypes.length ? companyTypes.map((it:any)=>(
                            <SelectItem key={it._id || it.name} value={it.range || it.name}>{it.range || it.name}</SelectItem>
                          )) : (
                            <>
                              <SelectItem value="1-10">1-10</SelectItem>
                              <SelectItem value="11-50">11-50</SelectItem>
                              <SelectItem value="51-200">51-200</SelectItem>
                              <SelectItem value="200+">200+</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Location</Label><Input value={company.location} onChange={e=>setCompany({...company,location:e.target.value})}/></div>
                    <div><Label>Website</Label><Input value={company.website} onChange={e=>setCompany({...company,website:e.target.value})}/></div>
                    <div><Label>Contact Email</Label><Input value={company.contact_email} onChange={e=>setCompany({...company,contact_email:e.target.value})}/></div>
                    <div><Label>Contact Phone</Label><Input value={company.contact_phone} onChange={e=>setCompany({...company,contact_phone:e.target.value})}/></div>
                  </div>
                  <div><Label>Description</Label><Textarea value={company.description} onChange={e=>setCompany({...company,description:e.target.value})}/></div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveCompany}>Save</Button>
                    <Button variant="outline" onClick={() => setTab('dashboard')}>Preview</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1"><CardHeader><CardTitle>Post New Job</CardTitle></CardHeader><CardContent className="space-y-2">
                  {jobErrors.server && (
                    <div className="text-red-600 text-xs p-2 bg-red-50 border border-red-200 rounded">{jobErrors.server}</div>
                  )}
                  <div>
                    <Label>Title</Label>
                    <Input value={jobTitle} onChange={(e)=>setJobTitle(e.target.value)} placeholder="e.g. React Developer"/>
                    {jobErrors.title && <div className="text-red-600 text-xs mt-1">{jobErrors.title}</div>}
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={jobDescription} onChange={(e)=>setJobDescription(e.target.value)} placeholder="Describe the role, responsibilities, benefits..."/>
                    {jobErrors.description && <div className="text-red-600 text-xs mt-1">{jobErrors.description}</div>}
                  </div>
                  <div>
                    <Label>Requirements</Label>
                    <Textarea value={jobRequirements} onChange={(e)=>setJobRequirements(e.target.value)} placeholder="List the required skills and qualifications..."/>
                    {jobErrors.requirements && <div className="text-red-600 text-xs mt-1">{jobErrors.requirements}</div>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Location</Label>
                      <Input value={jobLocation} onChange={(e)=>setJobLocation(e.target.value)} placeholder="e.g. Kathmandu"/>
                      {jobErrors.location && <div className="text-red-600 text-xs mt-1">{jobErrors.location}</div>}
                    </div>
                    <div>
                      <Label>Employment Type</Label>
                      <Select value={employmentType} onValueChange={(v)=>setEmploymentType(v)}>
                        <SelectTrigger><SelectValue placeholder="Type"/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Experience Level</Label>
                      <Select value={experienceLevel} onValueChange={(v)=>setExperienceLevel(v)}>
                        <SelectTrigger><SelectValue placeholder="Experience"/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry</SelectItem>
                          <SelectItem value="mid">Mid</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={categoryId} onValueChange={(v)=>setCategoryId(v)}>
                        <SelectTrigger><SelectValue placeholder="Select category"/></SelectTrigger>
                        <SelectContent>
                          {jobCategories.length ? jobCategories.map((c: any) => (
                            <SelectItem key={c._id || c.id || c.value || c.name} value={String(c.id || c._id || c.value || c.name)}>
                              {c.name || c.label || c.value}
                            </SelectItem>
                          )) : (
                            <>
                              <SelectItem value="information_technology">Information Technology</SelectItem>
                              <SelectItem value="marketing_sales">Marketing & Sales</SelectItem>
                              <SelectItem value="finance_accounting">Finance & Accounting</SelectItem>
                              <SelectItem value="hr_admin">HR & Admin</SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="others">Others</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      {jobErrors.category_id && <div className="text-red-600 text-xs mt-1">{jobErrors.category_id}</div>}
                    </div>
                  </div>
                  <div>
                    <Label>Application Deadline</Label>
                    <Input type="date" value={deadline} onChange={(e)=>setDeadline(e.target.value)} />
                    {jobErrors.deadline && <div className="text-red-600 text-xs mt-1">{jobErrors.deadline}</div>}
                  </div>
                  <div>
                    <Label>Offered Salary</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Pay Type</Label>
                        <Select value={payType} onValueChange={(v)=>setPayType(v)}>
                          <SelectTrigger><SelectValue placeholder="Select Pay Type"/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Salary Range</Label>
                        <Select onValueChange={(v)=>{
                          if (v === 'Negotiable') {
                            setSalaryType('negotiable');
                            setSalary('');
                            setSalaryMin('');
                            setSalaryMax('');
                          } else {
                            const [minStr, maxStr] = v.split('-');
                            const min = (minStr||'').replace(/[^0-9]/g,'');
                            const max = (maxStr||'').replace(/[^0-9]/g,'');
                            setSalaryType('range');
                            setSalary('');
                            setSalaryMin(min);
                            setSalaryMax(max);
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder={salaryType === 'negotiable' ? 'Negotiable' : (salaryMin && salaryMax ? `${salaryMin}-${salaryMax}` : 'Select Salary Range')}/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Negotiable">Negotiable</SelectItem>
                            <SelectItem value="10000-20000">10,000-20,000</SelectItem>
                            <SelectItem value="20000-30000">20,000-30,000</SelectItem>
                            <SelectItem value="30000-40000">30,000-40,000</SelectItem>
                            <SelectItem value="40000-50000">40,000-50,000</SelectItem>
                            <SelectItem value="50000-60000">50,000-60,000</SelectItem>
                            <SelectItem value="60000-70000">60,000-70,000</SelectItem>
                            <SelectItem value="70000-80000">70,000-80,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label>Salary Amount (NPR)</Label>
                      <Input type="number" value={salary} onChange={(e)=>{setSalary(e.target.value); setSalaryType('exact'); setSalaryMin(''); setSalaryMax('');}} placeholder="e.g. 60000"/>
                      <div className="text-xs text-muted-foreground mt-1">Enter a fixed amount or use the range/negotiable dropdowns.</div>
                    </div>
                    {(salaryType === 'negotiable' || salaryType === 'competitive') && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="text-xs text-blue-700">
                          {salaryType === 'negotiable' ? 'Salary will be marked as "Negotiable".' : 'Salary will be marked as "Competitive".'}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button className="w-full" onClick={handlePublishJob} disabled={publishingJob || !companyId}>{publishingJob ? 'Publishing...' : 'Publish'}</Button>
                  {!companyId && <div className="text-xs text-muted-foreground mt-1">Attach company profile to post jobs.</div>}
                </CardContent></Card>
                <Card className="lg:col-span-2"><CardHeader><CardTitle>Manage Jobs</CardTitle></CardHeader><CardContent>
                  <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left"><th className="p-2">Job Title</th><th className="p-2">Status</th><th className="p-2">Applications</th><th className="p-2">Posted</th><th className="p-2">Actions</th></tr></thead><tbody>
                    {employerJobs.slice(0,6).map((j:any)=> (
                      <tr key={j.id || j._id} className="border-t"><td className="p-2">{j.title||j.name}</td><td className="p-2">{j.status||'open'}</td><td className="p-2">{(j.applications?.length) ?? employerApplications.filter(a=> (a as any).jobId===j.id || (a as any).job_id===j.id || (a as any).job_id===j._id).length}</td><td className="p-2">{(j as any).postedDate||j.created_at||'—'}</td><td className="p-2"><Button size="sm" variant="outline">Edit</Button></td></tr>
                    ))}
                    {employerJobs.length === 0 && (
                      <tr className="border-t"><td className="p-2" colSpan={5}>No jobs posted yet.</td></tr>
                    )}
                  </tbody></table></div>
                  <div className="mt-4">
                    <div className="text-sm mb-2">Job Performance</div>
                    {employerJobs.length ? (
                      <div className="space-y-2">
                        {employerJobs.slice(0,3).map((j:any,i)=> (
                          <div key={i}>
                            <div className="text-xs">{j.title||`Job ${i+1}`}</div>
                            <Progress value={Math.min(100, Number((j as any)?.views || 0))} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No performance data yet</div>
                    )}
                  </div>
                </CardContent></Card>
              </div>
            </TabsContent>

            <TabsContent value="applicants">
              <Card><CardHeader><CardTitle>All Applications</CardTitle></CardHeader><CardContent>
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left"><th className="p-2">Job</th><th className="p-2">Candidate</th><th className="p-2">Applied</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead><tbody>
                  {employerApplications.slice(0,10).map((ap:any)=> (
                    <tr key={ap.id || ap._id} className="border-t">
                      <td className="p-2">{ap.job?.title||ap.jobTitle||'—'}</td>
                      <td className="p-2">{ap.candidate?.name||ap.name||'—'}</td>
                      <td className="p-2">{ap.applied_at || ap.date || '—'}</td>
                      <td className="p-2">{ap.status||'pending'}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          {['shortlisted','rejected','interview','hired'].map((next)=> (
                            <Button
                              key={next}
                              size="sm"
                              variant={next==='shortlisted'? 'default':'outline'}
                              onClick={async ()=>{
                                try {
                                  const id = ap.id || ap._id;
                                  await employerService.updateApplicationStatus(String(id), next);
                                  setEmployerApplications(prev => prev.map((a:any)=> (a.id===id||a._id===id) ? { ...a, status: next } : a));
                                } catch (e:any) {
                                  toast.error(e?.message || 'Failed to update');
                                }
                              }}
                            >{next[0].toUpperCase()+next.slice(1)}</Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {employerApplications.length === 0 && (
                    <tr className="border-t"><td className="p-2" colSpan={5}>No applications yet.</td></tr>
                  )}
                </tbody></table></div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="talent">
              <Card><CardHeader><CardTitle>Resume Search</CardTitle></CardHeader><CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2"><Input placeholder="Skills"/><Input placeholder="Location"/><Select><SelectTrigger><SelectValue placeholder="Experience"/></SelectTrigger><SelectContent><SelectItem value="junior">Junior</SelectItem><SelectItem value="mid">Mid</SelectItem><SelectItem value="senior">Senior</SelectItem></SelectContent></Select></div>
                {candidateResults.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{candidateResults.map((item:any,i:number)=> (
                    <Card key={i}><CardContent className="p-4"><div className="font-medium">{item?.name || `Candidate ${i+1}`}</div><div className="text-sm text-muted-foreground">Skills: {Array.isArray(item?.skills) ? item.skills.join(', ') : '—'}</div><div className="flex gap-2 mt-2"><Button size="sm">Save</Button><Button size="sm" variant="outline">Contact</Button></div></CardContent></Card>
                  ))}</div>
                ) : (
                  <div className="text-sm text-muted-foreground">No candidates found</div>
                )}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="messages">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>Compose Message</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Select Candidate</Label>
                      <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                        <SelectTrigger><SelectValue placeholder="Choose a candidate"/></SelectTrigger>
                        <SelectContent>
                          {uniqueCandidates.length ? uniqueCandidates
                            .filter((c: any) => c && c.id)
                            .map((c:any) => (
                              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                            )) : (
                              <SelectItem value="none" disabled>No candidates available</SelectItem>
                            )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Message</Label>
                      <Textarea value={messageText} onChange={(e)=>setMessageText(e.target.value)} placeholder="Write your message"/>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        disabled={!selectedCandidateId || !messageText.trim()}
                        onClick={async () => {
                          const text = messageText.trim();
                          try {
                            await employerService.sendMessageToCandidate(selectedCandidateId, text);
                            // Append to local conversation history
                            const candidate = uniqueCandidates.find((c: any) => String(c.id) === String(selectedCandidateId));
                            const newMsg = {
                              id: String(Date.now()),
                              candidateId: selectedCandidateId,
                              candidateName: candidate?.name || 'Unknown',
                              text,
                              timestamp: new Date().toISOString(),
                            };
                            setMessagesHistory((prev) => {
                              const next = [newMsg, ...prev];
                              try {
                                const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
                                localStorage.setItem(`employer_messages_${uid}`, JSON.stringify(next));
                              } catch {}
                              return next;
                            });
                            toast.success('Message sent');
                            setMessageText('');
                          } catch (e: any) {
                            toast.error(e?.message || 'Messaging API not available yet');
                          }
                        }}
                      >Send</Button>
                      <Button variant="outline" onClick={()=>{ setSelectedCandidateId(''); setMessageText(''); }}>Clear</Button>
                    </div>
                    {!uniqueCandidates.length && (
                      <div className="text-xs text-muted-foreground">Load applicants to message candidates.</div>
                    )}
                    {isCandidateLoading && (
                      <div className="text-xs text-muted-foreground">Loading candidates…</div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Conversations</CardTitle></CardHeader>
                  <CardContent>
                    {isMessagesLoading ? (
                      <div className="text-sm text-muted-foreground">Loading conversations…</div>
                    ) : messagesHistory.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No messages yet. Your sent messages will appear here.</div>
                    ) : (
                      <div className="space-y-2">
                        {messagesHistory.map((m:any)=> (
                          <div
                            key={m.id}
                            className="p-3 border rounded hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setSelectedCandidateId(m.candidateId);
                              // Mark conversation as read
                              setUnreadByCandidate(prev => {
                                const next = { ...prev, [m.candidateId]: 0 };
                                try {
                                  const uid = (user as any)?.id || (user as any)?._id || 'anonymous';
                                  localStorage.setItem(`employer_unread_${uid}`, JSON.stringify(next));
                                } catch {}
                                return next;
                              });
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium flex items-center gap-2">
                                {m.candidateName}
                                {Number(unreadByCandidate[m.candidateId] || 0) > 0 && (
                                  <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">{unreadByCandidate[m.candidateId]}</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{new Date(m.timestamp).toLocaleString()}</div>
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-2">{m.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subscription">
              <Card><CardHeader><CardTitle>Current Plan</CardTitle></CardHeader><CardContent className="space-y-2"><div className="text-sm">Plan: {plan.name}</div><div className="text-sm">Credits: {plan.credits}</div><div className="text-sm">Expires: {plan.expires}</div><div className="flex gap-2"><Button>Upgrade</Button><Button variant="outline">Renew</Button></div></CardContent></Card>
              <Card className="mt-4"><CardHeader><CardTitle>Payment History</CardTitle></CardHeader><CardContent><div className="space-y-2">{[1,2].map(i=> (<div key={i} className="p-3 border rounded">Invoice #{i} • $99 • Paid</div>))}</div></CardContent></Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card><CardHeader><CardTitle>Job Performance</CardTitle></CardHeader><CardContent><div className="h-32 bg-muted rounded"/></CardContent></Card>
                <Card><CardHeader><CardTitle>Application Trends</CardTitle></CardHeader><CardContent><div className="h-32 bg-muted rounded"/></CardContent></Card>
              </div>
              <div className="mt-4"><Button variant="outline">Export CSV</Button> <Button className="ml-2" variant="outline">Export PDF</Button></div>
            </TabsContent>

            <TabsContent value="settings">
              <Card><CardHeader><CardTitle>Account Settings</CardTitle></CardHeader><CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2"><Input placeholder="Email"/><Input placeholder="Phone"/><Input placeholder="New Password" type="password"/></div>
                <div className="flex gap-2"><Button>Save</Button><Button variant="outline">Enable 2FA</Button><Button variant="outline" className="text-red-600">Deactivate</Button></div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="help">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card><CardHeader><CardTitle>Contact Support</CardTitle></CardHeader><CardContent className="space-y-2"><Input placeholder="Subject"/><Textarea placeholder="Describe your issue"/><Button>Send</Button></CardContent></Card>
                <Card><CardHeader><CardTitle>FAQ & Tutorials</CardTitle></CardHeader><CardContent><div className="space-y-2">{['How to post jobs?','How to shortlist?','Plan features'].map(t=> (<div key={t} className="p-3 border rounded">{t}</div>))}</div></CardContent></Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Helper: normalize logo URLs to absolute, backend-origin paths
const normalizeLogoUrl = (url?: string | null): string => {
  if (!url) return '';
  const u = String(url);
  if (/^https?:\/\//i.test(u)) return u;

  // Resolve origin: prefer absolute API URL; else same-origin
  const envApi = (import.meta as any)?.env?.VITE_API_URL;
  let origin = '';
  if (typeof envApi === 'string' && /^https?:\/\//i.test(envApi)) {
    try { origin = new URL(envApi).origin; } catch { origin = envApi; }
  } else if (typeof (api as any)?.baseURL === 'string' && /^https?:\/\//i.test((api as any).baseURL)) {
    try { origin = new URL((api as any).baseURL).origin; } catch { origin = (api as any).baseURL; }
  } else if (typeof window !== 'undefined' && window.location?.origin) {
    // Default to same-origin so Vite proxy handles '/uploads' in dev
    origin = window.location.origin;
  }

  const path = u.startsWith('/') ? u : `/${u}`;
  // If the path is already '/uploads', return same-origin path to leverage proxy
  if (path.startsWith('/uploads')) {
    return path; // Vite proxies '/uploads' to backend
  }
  return origin ? `${origin}${path}` : path;
};