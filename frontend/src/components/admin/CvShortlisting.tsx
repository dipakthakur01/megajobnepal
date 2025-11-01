import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  Star, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  TrendingUp,
  Award,
  Briefcase,
  DollarSign,
  Clock,
  Eye,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface Candidate {
  _id: string;
  job_seeker_id: {
    _id: string;
    full_name: string;
    email: string;
    phone?: string;
    address?: string;
    skills?: string[];
    experience?: string;
  };
  job_id: string;
  cover_letter?: string;
  resume_url?: string;
  portfolio_url?: string;
  expected_salary?: number;
  availability?: string;
  status: string;
  created_at: string;
  ai_score?: number;
  ai_analysis?: {
    skills_match: number;
    experience_match: number;
    salary_match: number;
    availability_match: number;
    cover_letter_score: number;
    recommendations: string[];
  };
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range?: string;
  required_skills?: string[];
  experience_required?: string;
  status: string;
}

interface CvShortlistingProps {
  jobs: Job[];
  applications: any[];
}

export function CvShortlisting({ jobs, applications }: CvShortlistingProps) {
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ai_score');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // Fetch candidates for selected job
  const fetchCandidates = async (jobId: string) => {
    if (!jobId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/applications/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        setFilteredCandidates(data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run AI analysis on candidates
  const runAiAnalysis = async () => {
    if (!selectedJob) return;
    
    setAnalyzing(true);
    try {
      const response = await fetch(`/api/admin/ai-analysis/job/${selectedJob}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates);
        setFilteredCandidates(data.candidates);
      }
    } catch (error) {
      console.error('Error running AI analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Export candidates
  const exportCandidates = async (format: 'pdf' | 'word' | 'excel', type: 'single' | 'bulk') => {
    try {
      let url = '';
      let body = {};
      
      if (type === 'single' && selectedCandidates.length === 1) {
        url = `/api/admin/export/candidate/${selectedCandidates[0]}/${format}`;
      } else if (type === 'bulk') {
        url = `/api/admin/export/job/${selectedJob}/${format}`;
        body = { candidateIds: selectedCandidates.length > 0 ? selectedCandidates : undefined };
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `candidates_${selectedJob}_${Date.now()}.${format === 'word' ? 'docx' : format}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error('Error exporting candidates:', error);
    }
  };

  // Filter and sort candidates
  useEffect(() => {
    let filtered = [...candidates];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(candidate => 
        candidate.job_seeker_id.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.job_seeker_id.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.job_seeker_id.skills && candidate.job_seeker_id.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }
    
    // Score filter
    if (scoreFilter !== 'all') {
      const scoreThreshold = parseInt(scoreFilter);
      filtered = filtered.filter(candidate => 
        candidate.ai_score && candidate.ai_score >= scoreThreshold
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'ai_score':
          return (b.ai_score || 0) - (a.ai_score || 0);
        case 'name':
          return a.job_seeker_id.full_name.localeCompare(b.job_seeker_id.full_name);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredCandidates(filtered);
  }, [candidates, searchTerm, statusFilter, scoreFilter, sortBy]);

  useEffect(() => {
    if (selectedJob) {
      fetchCandidates(selectedJob);
    }
  }, [selectedJob]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI-Powered CV Shortlisting</h1>
          <p className="text-gray-600">Automatically analyze and rank candidates using AI</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <TrendingUp className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Job Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Select Job Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a job position to analyze candidates" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.filter(job => job.status === 'active').map((job) => (
                    <SelectItem key={job._id} value={job._id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{job.title} - {job.company}</span>
                        <Badge variant="outline" className="ml-2">
                          {applications.filter(app => app.job_id === job._id).length} applicants
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={runAiAnalysis} 
              disabled={!selectedJob || analyzing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedJob && (
        <>
          {/* Filters and Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search candidates by name, email, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="80">80+ Score</SelectItem>
                    <SelectItem value="60">60+ Score</SelectItem>
                    <SelectItem value="40">40+ Score</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai_score">AI Score</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Application Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Export Controls */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {selectedCandidates.length > 0 ? (
                    `${selectedCandidates.length} candidate(s) selected`
                  ) : (
                    `${filteredCandidates.length} candidate(s) found`
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportCandidates('pdf', 'bulk')}
                    disabled={filteredCandidates.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportCandidates('word', 'bulk')}
                    disabled={filteredCandidates.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Word
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportCandidates('excel', 'bulk')}
                    disabled={filteredCandidates.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidates List */}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading candidates...
              </CardContent>
            </Card>
          ) : filteredCandidates.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                  <p className="text-gray-600">Try adjusting your filters or run AI analysis first.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(candidate._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCandidates([...selectedCandidates, candidate._id]);
                            } else {
                              setSelectedCandidates(selectedCandidates.filter(id => id !== candidate._id));
                            }
                          }}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {candidate.job_seeker_id.full_name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {candidate.ai_score && (
                                <Badge className={`${getScoreColor(candidate.ai_score)} border-0`}>
                                  <Star className="h-3 w-3 mr-1" />
                                  {candidate.ai_score}% Match
                                </Badge>
                              )}
                              <Badge className={getStatusColor(candidate.status)}>
                                {candidate.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-2" />
                                {candidate.job_seeker_id.email}
                              </div>
                              {candidate.job_seeker_id.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {candidate.job_seeker_id.phone}
                                </div>
                              )}
                              {candidate.job_seeker_id.address && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {candidate.job_seeker_id.address}
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              {candidate.expected_salary && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Expected: ${candidate.expected_salary.toLocaleString()}
                                </div>
                              )}
                              {candidate.availability && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="h-4 w-4 mr-2" />
                                  Available: {candidate.availability}
                                </div>
                              )}
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                Applied: {new Date(candidate.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          {/* Skills */}
                          {candidate.job_seeker_id.skills && candidate.job_seeker_id.skills.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills:</h4>
                              <div className="flex flex-wrap gap-1">
                                {candidate.job_seeker_id.skills.slice(0, 8).map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {candidate.job_seeker_id.skills.length > 8 && (
                                  <Badge variant="outline" className="text-xs">
                                    {candidate.job_seeker_id.skills.length - 8} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* AI Analysis */}
                          {candidate.ai_analysis && (
                            <div className="bg-blue-50 rounded-lg p-4 mb-4">
                              <h4 className="text-sm font-medium text-blue-900 mb-2">AI Analysis:</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                                <div className="text-xs">
                                  <span className="text-blue-700">Skills:</span> {candidate.ai_analysis.skills_match}%
                                </div>
                                <div className="text-xs">
                                  <span className="text-blue-700">Experience:</span> {candidate.ai_analysis.experience_match}%
                                </div>
                                <div className="text-xs">
                                  <span className="text-blue-700">Salary:</span> {candidate.ai_analysis.salary_match}%
                                </div>
                                <div className="text-xs">
                                  <span className="text-blue-700">Cover Letter:</span> {candidate.ai_analysis.cover_letter_score}%
                                </div>
                              </div>
                              {candidate.ai_analysis.recommendations && candidate.ai_analysis.recommendations.length > 0 && (
                                <div className="text-xs text-blue-800">
                                  <strong>Recommendations:</strong> {candidate.ai_analysis.recommendations.join(', ')}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            {candidate.resume_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4 mr-1" />
                                  View Resume
                                </a>
                              </Button>
                            )}
                            {candidate.portfolio_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Portfolio
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportCandidates('pdf', 'single')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Export CV
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}