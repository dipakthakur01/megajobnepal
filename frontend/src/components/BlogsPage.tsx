"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { 
  Calendar, 
  User, 
  Clock, 
  Search, 
  TrendingUp, 
  Briefcase, 
  Users, 
  BookOpen,
  ArrowRight,
  Tag,
  X,
  Share2
} from 'lucide-react';
import { dbService } from '@/lib/db-service';

export function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const [persistedPosts, setPersistedPosts] = useState<any[]>([]);

  useEffect(() => {
    try {
      const persisted = dbService.getBlogs?.();
      if (Array.isArray(persisted)) {
        setPersistedPosts(persisted);
      }
    } catch {/* noop */}
  }, []);

  const blogPosts = (persistedPosts && persistedPosts.length > 0) ? persistedPosts : /*
    {
      id: 1,
      title: 'The Ultimate Guide to Landing Your Dream Job in Nepal 2024',
      excerpt: 'Discover proven strategies, insider tips, and essential skills needed to secure your ideal position in Nepal\'s competitive job market.',
      content: `
        <h2>Introduction</h2>
        <p>Landing your dream job in Nepal's competitive market requires more than just qualifications. In 2024, the job landscape has evolved significantly, with new opportunities emerging alongside traditional sectors. This comprehensive guide will walk you through proven strategies that successful job seekers use to stand out from the competition.</p>
        
        <h2>Understanding Nepal's Job Market</h2>
        <p>Nepal's job market is experiencing rapid transformation. Key sectors showing growth include:</p>
        <ul>
          <li><strong>Technology and IT:</strong> With increasing digitization, tech roles are in high demand</li>
          <li><strong>Tourism and Hospitality:</strong> Post-pandemic recovery has created numerous opportunities</li>
          <li><strong>Financial Services:</strong> Banking and fintech sectors are expanding rapidly</li>
          <li><strong>Healthcare:</strong> Ongoing modernization creates demand for skilled professionals</li>
        </ul>
        
        <h2>Essential Strategies for Job Success</h2>
        
        <h3>1. Build a Strong Professional Profile</h3>
        <p>Your professional profile is your first impression. Focus on:</p>
        <ul>
          <li>Creating a compelling LinkedIn profile with local keywords</li>
          <li>Tailoring your resume for each application</li>
          <li>Highlighting achievements with quantifiable results</li>
          <li>Showcasing both technical and soft skills</li>
        </ul>
        
        <h3>2. Develop In-Demand Skills</h3>
        <p>Stay ahead by acquiring skills that employers value:</p>
        <ul>
          <li>Digital literacy and basic coding knowledge</li>
          <li>Data analysis and interpretation</li>
          <li>Project management certification</li>
          <li>Multilingual communication abilities</li>
          <li>Cultural competency for international companies</li>
        </ul>
        
        <h3>3. Network Strategically</h3>
        <p>Building connections is crucial in Nepal's relationship-based business culture:</p>
        <ul>
          <li>Attend industry events and job fairs</li>
          <li>Join professional associations</li>
          <li>Engage with alumni networks</li>
          <li>Participate in online communities and forums</li>
        </ul>
        
        <h2>Interview Preparation Tips</h2>
        <p>Successful interviews require preparation and cultural awareness:</p>
        <ul>
          <li>Research the company's values and recent achievements</li>
          <li>Prepare examples that demonstrate your problem-solving abilities</li>
          <li>Practice common interview questions in both English and Nepali</li>
          <li>Understand the company's work culture and dress code</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Landing your dream job in Nepal requires persistence, preparation, and adaptability. By following these strategies and staying updated with market trends, you'll significantly improve your chances of success. Remember, every rejection is a learning opportunity that brings you closer to your goal.</p>
        
        <p><em>Start implementing these strategies today, and take the first step toward securing your ideal position in Nepal's dynamic job market.</em></p>
      `,
      category: 'Career Tips',
      author: 'Priya Sharma',
      publishDate: '2024-03-15',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=300&fit=crop',
      featured: true,
      tags: ['job search', 'career', 'nepal', 'tips']
    },
    {
      id: 2,
      title: 'Remote Work Trends in Nepal: Opportunities and Challenges',
      excerpt: 'Explore how remote work is transforming the Nepali workforce and what it means for both employers and job seekers.',
      content: `
        <h2>The Remote Work Revolution in Nepal</h2>
        <p>The COVID-19 pandemic accelerated a transformation that was already underway in Nepal's job market. Remote work, once considered a luxury for a select few, has become a mainstream employment option that's reshaping how Nepali professionals approach their careers.</p>
        
        <h2>Current State of Remote Work</h2>
        <p>According to recent surveys, over 40% of Nepali companies now offer some form of remote work arrangement. This shift has been particularly pronounced in:</p>
        <ul>
          <li><strong>Information Technology:</strong> 85% of IT companies offer full or hybrid remote options</li>
          <li><strong>Digital Marketing:</strong> Growing freelance and agency opportunities</li>
          <li><strong>Content Creation:</strong> Writing, design, and multimedia production</li>
          <li><strong>Customer Service:</strong> International companies hiring Nepali talent</li>
          <li><strong>Education:</strong> Online tutoring and course development</li>
        </ul>
        
        <h2>Opportunities for Job Seekers</h2>
        
        <h3>Access to Global Markets</h3>
        <p>Remote work has opened doors to international opportunities previously unavailable to Nepali professionals:</p>
        <ul>
          <li>Competitive international salaries in local currency</li>
          <li>Exposure to global best practices and technologies</li>
          <li>Building international professional networks</li>
          <li>Skill development through diverse project exposure</li>
        </ul>
        
        <h3>Work-Life Balance Benefits</h3>
        <p>Remote work offers unique advantages in the Nepali context:</p>
        <ul>
          <li>Elimination of Kathmandu's traffic-related stress</li>
          <li>Opportunity to work from anywhere in Nepal</li>
          <li>More time for family and personal development</li>
          <li>Reduced commuting costs and time</li>
        </ul>
        
        <h2>Challenges and Considerations</h2>
        
        <h3>Infrastructure Limitations</h3>
        <p>Despite improvements, certain challenges remain:</p>
        <ul>
          <li><strong>Internet Connectivity:</strong> Reliable high-speed internet isn't available everywhere</li>
          <li><strong>Power Supply:</strong> Load shedding can disrupt work schedules</li>
          <li><strong>Technology Access:</strong> Not everyone has access to necessary equipment</li>
        </ul>
        
        <h3>Cultural and Social Factors</h3>
        <ul>
          <li>Traditional workplace expectations vs. remote work flexibility</li>
          <li>Building professional relationships without face-to-face interaction</li>
          <li>Managing family expectations around home-based work</li>
          <li>Isolation and mental health considerations</li>
        </ul>
        
        <h2>Tips for Remote Work Success</h2>
        
        <h3>For Job Seekers</h3>
        <ul>
          <li>Develop strong digital communication skills</li>
          <li>Create a dedicated workspace at home</li>
          <li>Build a portfolio showcasing remote project experience</li>
          <li>Learn time management and self-discipline techniques</li>
          <li>Stay updated with digital collaboration tools</li>
        </ul>
        
        <h3>For Employers</h3>
        <ul>
          <li>Invest in digital infrastructure and training</li>
          <li>Develop clear remote work policies</li>
          <li>Focus on results rather than hours worked</li>
          <li>Create virtual team-building opportunities</li>
          <li>Provide mental health and wellness support</li>
        </ul>
        
        <h2>Future Outlook</h2>
        <p>The future of remote work in Nepal looks promising. Government initiatives to improve digital infrastructure, combined with increasing acceptance of flexible work arrangements, suggest that remote work will continue to grow.</p>
        
        <p>Companies that embrace this trend early will have access to a wider talent pool, while professionals who develop remote work skills will find themselves with more career opportunities than ever before.</p>
        
        <p><em>The remote work revolution in Nepal is just beginning. Those who adapt quickly and develop the necessary skills will be best positioned to take advantage of this transformative trend.</em></p>
      `,
      category: 'Industry Insights',
      author: 'Rajan Thapa',
      publishDate: '2024-03-12',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=300&fit=crop',
      featured: true,
      tags: ['remote work', 'trends', 'technology']
    },
    {
      id: 3,
      title: 'Top 10 In-Demand Skills for 2024: Stay Competitive',
      excerpt: 'Learn about the most sought-after skills that employers are looking for and how to develop them effectively.',
      content: `
        <h2>Introduction</h2>
        <p>In today's rapidly evolving job market, staying competitive requires continuous skill development. Based on employer surveys and job market analysis, here are the top 10 skills that will give you a significant advantage in 2024.</p>
        
        <h2>1. Digital Literacy and Data Analysis</h2>
        <p>Understanding data has become essential across all industries:</p>
        <ul>
          <li>Basic Excel and Google Sheets proficiency</li>
          <li>Understanding of data visualization tools</li>
          <li>Ability to interpret charts and metrics</li>
          <li>Knowledge of AI tools like ChatGPT for productivity</li>
        </ul>
        <p><strong>How to develop:</strong> Take online courses on Coursera or Khan Academy, practice with real datasets.</p>
        
        <h2>2. Project Management</h2>
        <p>Organizations need professionals who can deliver results on time and within budget:</p>
        <ul>
          <li>Planning and execution skills</li>
          <li>Risk management and problem-solving</li>
          <li>Team coordination and communication</li>
          <li>Agile and Scrum methodologies</li>
        </ul>
        <p><strong>How to develop:</strong> Get PMP or Agile certification, volunteer for project leadership roles.</p>
        
        <h2>3. Digital Marketing and Social Media</h2>
        <p>Every business needs an online presence:</p>
        <ul>
          <li>Content creation and strategy</li>
          <li>SEO and SEM knowledge</li>
          <li>Social media platform expertise</li>
          <li>Analytics and performance measurement</li>
        </ul>
        <p><strong>How to develop:</strong> Practice with personal projects, take Google Digital Marketing courses.</p>
        
        <h2>4. Customer Service Excellence</h2>
        <p>Great customer experience drives business success:</p>
        <ul>
          <li>Active listening and empathy</li>
          <li>Problem-solving mindset</li>
          <li>Multi-channel communication skills</li>
          <li>CRM software proficiency</li>
        </ul>
        <p><strong>How to develop:</strong> Practice in volunteer work, study customer service best practices.</p>
        
        <h2>5. Financial Literacy</h2>
        <p>Understanding money management is valuable in any role:</p>
        <ul>
          <li>Budget planning and analysis</li>
          <li>ROI calculation and cost-benefit analysis</li>
          <li>Basic accounting principles</li>
          <li>Investment and savings knowledge</li>
        </ul>
        <p><strong>How to develop:</strong> Take finance courses, manage personal or small business budgets.</p>
        
        <h2>6. Adaptability and Learning Agility</h2>
        <p>The ability to learn and adapt quickly is crucial:</p>
        <ul>
          <li>Embracing change and uncertainty</li>
          <li>Continuous learning mindset</li>
          <li>Flexibility in work methods</li>
          <li>Resilience in facing challenges</li>
        </ul>
        <p><strong>How to develop:</strong> Take on diverse projects, regularly learn new tools or skills.</p>
        
        <h2>7. Cross-Cultural Communication</h2>
        <p>Working with diverse teams and international clients:</p>
        <ul>
          <li>Multilingual capabilities</li>
          <li>Cultural sensitivity and awareness</li>
          <li>Remote collaboration skills</li>
          <li>Clear and concise communication</li>
        </ul>
        <p><strong>How to develop:</strong> Work with international teams, practice language skills.</p>
        
        <h2>8. Technical Problem-Solving</h2>
        <p>Every industry needs people who can fix technical issues:</p>
        <ul>
          <li>Logical thinking and troubleshooting</li>
          <li>Basic coding or scripting knowledge</li>
          <li>Software proficiency across platforms</li>
          <li>Hardware troubleshooting basics</li>
        </ul>
        <p><strong>How to develop:</strong> Take online programming courses, volunteer for tech support roles.</p>
        
        <h2>9. Sales and Negotiation</h2>
        <p>Everyone sells something, whether ideas, products, or services:</p>
        <ul>
          <li>Understanding customer needs</li>
          <li>Persuasive communication</li>
          <li>Negotiation techniques</li>
          <li>Relationship building</li>
        </ul>
        <p><strong>How to develop:</strong> Practice in daily interactions, study sales methodologies.</p>
        
        <h2>10. Environmental and Sustainability Awareness</h2>
        <p>Businesses increasingly focus on sustainable practices:</p>
        <ul>
          <li>Understanding of environmental impact</li>
          <li>Knowledge of sustainable business practices</li>
          <li>Green technology awareness</li>
          <li>Corporate social responsibility concepts</li>
        </ul>
        <p><strong>How to develop:</strong> Study sustainability reports, participate in environmental initiatives.</p>
        
        <h2>Action Plan for Skill Development</h2>
        <ol>
          <li><strong>Assess your current skills:</strong> Identify gaps in your skillset</li>
          <li><strong>Prioritize based on your industry:</strong> Focus on skills most relevant to your field</li>
          <li><strong>Create a learning schedule:</strong> Dedicate time weekly to skill development</li>
          <li><strong>Practice with real projects:</strong> Apply skills in actual work scenarios</li>
          <li><strong>Seek feedback:</strong> Get input from colleagues and mentors</li>
          <li><strong>Stay updated:</strong> Industries evolve, so keep learning</li>
        </ol>
        
        <h2>Conclusion</h2>
        <p>The job market rewards those who continuously develop relevant skills. Start with 2-3 skills that align with your career goals, and gradually expand your capabilities. Remember, the key is not just learning these skills, but demonstrating them through practical application.</p>
        
        <p><em>Invest in yourself today, and stay ahead of the competition in 2024 and beyond.</em></p>
      `,
      category: 'Skills Development',
      author: 'Sita Poudel',
      publishDate: '2024-03-10',
      readTime: '10 min read',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=300&fit=crop',
      featured: false,
      tags: ['skills', 'development', 'career growth']
    },
    {
      id: 4,
      title: 'How to Write a Winning Resume for Nepali Job Market',
      excerpt: 'Master the art of resume writing with templates, examples, and expert advice tailored for Nepal\'s job market.',
      content: `
        <h2>Creating a Resume That Gets Results</h2>
        <p>Your resume is often the first impression you make on potential employers. In Nepal's competitive job market, a well-crafted resume can make the difference between getting an interview and being overlooked.</p>
        
        <h2>Essential Resume Sections</h2>
        <ul>
          <li><strong>Contact Information:</strong> Include phone, email, and LinkedIn profile</li>
          <li><strong>Professional Summary:</strong> 2-3 sentences highlighting your key strengths</li>
          <li><strong>Work Experience:</strong> Focus on achievements, not just responsibilities</li>
          <li><strong>Education:</strong> Include relevant certifications and ongoing learning</li>
          <li><strong>Skills:</strong> Both technical and soft skills relevant to the role</li>
        </ul>
        
        <h2>Nepal-Specific Tips</h2>
        <ul>
          <li>Include language proficiencies (Nepali, English, Hindi, etc.)</li>
          <li>Mention any international exposure or remote work experience</li>
          <li>Highlight community involvement and volunteer work</li>
          <li>Use action verbs and quantify achievements where possible</li>
        </ul>
        
        <h2>Common Mistakes to Avoid</h2>
        <ul>
          <li>Generic one-size-fits-all resumes</li>
          <li>Focusing on duties instead of accomplishments</li>
          <li>Including irrelevant personal information</li>
          <li>Poor formatting and unclear structure</li>
        </ul>
        
        <p><em>Remember: Your resume should tell a compelling story of your professional journey and potential value to employers.</em></p>
      `,
      category: 'Career Tips',
      author: 'Bikash Adhikari',
      publishDate: '2024-03-08',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=300&fit=crop',
      featured: false,
      tags: ['resume', 'cv', 'job application']
    },
    {
      id: 5,
      title: 'Salary Negotiation Tips: Know Your Worth in Nepal',
      excerpt: 'Learn effective strategies to negotiate better compensation and understand salary trends across different industries in Nepal.',
      content: `
        <h2>Understanding Your Market Value</h2>
        <p>Salary negotiation starts with research. Understanding what similar roles pay in Nepal's market gives you confidence and credibility during negotiations.</p>
        
        <h2>Research Strategies</h2>
        <ul>
          <li>Use salary comparison websites and industry reports</li>
          <li>Network with professionals in similar roles</li>
          <li>Consider total compensation, not just base salary</li>
          <li>Factor in company size, industry, and location</li>
        </ul>
        
        <h2>Negotiation Tactics</h2>
        <ul>
          <li>Wait for the right timing - usually after a job offer</li>
          <li>Present your case with specific examples and achievements</li>
          <li>Be prepared to negotiate other benefits if salary is fixed</li>
          <li>Maintain professionalism throughout the process</li>
        </ul>
        
        <h2>Beyond Salary</h2>
        <p>Consider negotiating flexible work arrangements, professional development opportunities, additional leave, or performance bonuses.</p>
        
        <p><em>Remember: Negotiation is a conversation, not a confrontation. Approach it as a collaborative effort to find mutual value.</em></p>
      `,
      category: 'Career Growth',
      author: 'Kamala Rai',
      publishDate: '2024-03-05',
      readTime: '9 min read',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=300&fit=crop',
      featured: false,
      tags: ['salary', 'negotiation', 'compensation']
    },
    {
      id: 6,
      title: 'The Rise of Tech Jobs in Nepal: Complete Industry Overview',
      excerpt: 'Comprehensive analysis of Nepal\'s growing tech sector, major players, and emerging opportunities for professionals.',
      content: `
        <h2>Nepal's Tech Revolution</h2>
        <p>Nepal's technology sector has experienced remarkable growth, driven by increased internet penetration, digital payment adoption, and a young, tech-savvy population.</p>
        
        <h2>Key Growth Areas</h2>
        <ul>
          <li><strong>Fintech:</strong> Digital payments and banking solutions</li>
          <li><strong>E-commerce:</strong> Online marketplaces and delivery platforms</li>
          <li><strong>Software Development:</strong> Custom solutions and SaaS products</li>
          <li><strong>Digital Marketing:</strong> Growing demand for online presence</li>
        </ul>
        
        <h2>Major Players</h2>
        <p>Companies like eSewa, Khalti, Daraz, and numerous software development firms are leading the transformation and creating thousands of jobs.</p>
        
        <h2>Career Opportunities</h2>
        <ul>
          <li>Software developers and engineers</li>
          <li>Data analysts and scientists</li>
          <li>UI/UX designers</li>
          <li>Digital marketing specialists</li>
          <li>Project managers and product owners</li>
        </ul>
        
        <p><em>The tech sector offers some of the best career growth and compensation opportunities in Nepal's job market.</em></p>
      `,
      category: 'Industry Insights',
      author: 'Anish Karki',
      publishDate: '2024-03-02',
      readTime: '12 min read',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=300&fit=crop',
      featured: false,
      tags: ['technology', 'IT jobs', 'industry analysis']
    },
    {
      id: 7,
      title: 'Interview Preparation Guide: From Practice to Success',
      excerpt: 'Everything you need to know about preparing for interviews, from common questions to body language tips.',
      content: `
        <h2>Master Your Interview Game</h2>
        <p>Interviews can be nerve-wracking, but proper preparation builds confidence and significantly improves your chances of success.</p>
        
        <h2>Pre-Interview Research</h2>
        <ul>
          <li>Study the company's mission, values, and recent news</li>
          <li>Understand the role requirements and expectations</li>
          <li>Research the interviewer's background if possible</li>
          <li>Prepare specific examples that demonstrate your skills</li>
        </ul>
        
        <h2>Common Questions to Prepare</h2>
        <ul>
          <li>"Tell me about yourself" - Your professional elevator pitch</li>
          <li>"Why do you want this role?" - Show enthusiasm and research</li>
          <li>"What are your strengths/weaknesses?" - Be honest but strategic</li>
          <li>"Where do you see yourself in 5 years?" - Show ambition and planning</li>
        </ul>
        
        <h2>Non-Verbal Communication</h2>
        <ul>
          <li>Maintain appropriate eye contact</li>
          <li>Use confident body language</li>
          <li>Dress appropriately for the company culture</li>
          <li>Arrive 10-15 minutes early</li>
        </ul>
        
        <h2>Follow-Up Strategy</h2>
        <p>Send a thank-you email within 24 hours, reiterating your interest and highlighting key discussion points.</p>
        
        <p><em>Remember: Interviews are two-way conversations. You're also evaluating if the company is right for you.</em></p>
      `,
      category: 'Career Tips',
      author: 'Sunita Maharjan',
      publishDate: '2024-02-28',
      readTime: '11 min read',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=300&fit=crop',
      featured: false,
      tags: ['interview', 'preparation', 'job tips']
    },
    {
      id: 8,
      title: 'Building Your Professional Network in Nepal',
      excerpt: 'Strategies for expanding your professional connections and leveraging networking for career advancement.',
      content: `
        <h2>The Power of Professional Networking</h2>
        <p>In Nepal's relationship-based business culture, your professional network can be your greatest career asset. Building genuine connections opens doors to opportunities, mentorship, and collaboration.</p>
        
        <h2>Where to Network</h2>
        <ul>
          <li><strong>Industry Events:</strong> Conferences, seminars, and trade shows</li>
          <li><strong>Professional Associations:</strong> Join relevant industry groups</li>
          <li><strong>Alumni Networks:</strong> Leverage your educational connections</li>
          <li><strong>Online Platforms:</strong> LinkedIn, industry forums, and social media</li>
          <li><strong>Workplace:</strong> Build relationships with colleagues across departments</li>
        </ul>
        
        <h2>Networking Strategies</h2>
        <ul>
          <li>Focus on giving value, not just receiving</li>
          <li>Follow up promptly after meeting new contacts</li>
          <li>Maintain regular contact with your network</li>
          <li>Share knowledge and insights with others</li>
          <li>Be authentic and genuine in your interactions</li>
        </ul>
        
        <h2>Digital Networking Tips</h2>
        <ul>
          <li>Optimize your LinkedIn profile with keywords</li>
          <li>Share valuable content regularly</li>
          <li>Engage meaningfully with others' posts</li>
          <li>Join relevant online groups and discussions</li>
        </ul>
        
        <h2>Cultural Considerations in Nepal</h2>
        <ul>
          <li>Respect hierarchical relationships</li>
          <li>Use appropriate greetings and titles</li>
          <li>Build trust through consistent, honest interactions</li>
          <li>Consider family and community connections</li>
        </ul>
        
        <p><em>Networking is about building mutually beneficial relationships, not just collecting business cards.</em></p>
      `,
      category: 'Career Growth',
      author: 'Deepak Shrestha',
      publishDate: '2024-02-25',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=300&fit=crop',
      featured: false,
      tags: ['networking', 'professional growth', 'career']
    }
  */ [];

  const categories = React.useMemo(() => ([
    { value: 'all', label: 'All Categories', count: blogPosts.length },
    { value: 'Career Tips', label: 'Career Tips', count: blogPosts.filter(post => post.category === 'Career Tips').length },
    { value: 'Industry Insights', label: 'Industry Insights', count: blogPosts.filter(post => post.category === 'Industry Insights').length },
    { value: 'Skills Development', label: 'Skills Development', count: blogPosts.filter(post => post.category === 'Skills Development').length },
    { value: 'Career Growth', label: 'Career Growth', count: blogPosts.filter(post => post.category === 'Career Growth').length }
  ]), [blogPosts]);

  const featuredPosts = React.useMemo(() => blogPosts.filter(post => post.featured), [blogPosts]);
  const recentPosts = React.useMemo(() => blogPosts.slice(0, 5), [blogPosts]);

  const filteredPosts = React.useMemo(() => blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [blogPosts, searchTerm, selectedCategory]);

  const handleReadMore = (article: any) => {
    setSelectedArticle(article);
    setIsArticleModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsArticleModalOpen(false);
    setSelectedArticle(null);
  };

  const handleShareArticle = (article: any) => {
    if (!article) {
      return;
    }
    
    const articleUrl = `${window.location.origin}/blogs#article-${article.id}`;
    
    // Use only reliable fallback method to avoid clipboard API permission issues
    fallbackCopyArticle(articleUrl);
  };

  const fallbackCopyArticle = (text: string) => {
    try {
      // Use input element for better compatibility
      const tempInput = document.createElement('input');
      tempInput.type = 'text';
      tempInput.value = text;
      
      // Position off-screen but accessible
      tempInput.style.position = 'absolute';
      tempInput.style.left = '-9999px';
      tempInput.style.top = '0';
      tempInput.style.opacity = '0';
      tempInput.style.pointerEvents = 'none';
      tempInput.setAttribute('readonly', '');
      
      document.body.appendChild(tempInput);
      
      // Select and copy
      tempInput.focus();
      tempInput.setSelectionRange(0, tempInput.value.length);
      tempInput.select();
      
      let successful = false;
      try {
        successful = document.execCommand('copy');
      } catch (execError) {
        console.warn('execCommand failed:', execError);
        successful = false;
      }
      
      document.body.removeChild(tempInput);
      
      if (successful) {
        // Dynamic import to avoid issues
        import('sonner').then(({ toast }) => {
          toast.success('Article link copied to clipboard!');
        }).catch(() => {
          console.log('Article link copied to clipboard!');
        });
      } else {
        showArticleUrlDialog(text);
      }
    } catch (err) {
      console.error('Copy operation failed:', err);
      showArticleUrlDialog(text);
    }
  };

  const showArticleUrlDialog = (url: string) => {
    const message = `Copy this article link:\n\n${url}`;
    if (window.prompt) {
      window.prompt(message, url);
    } else {
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Career Insights & Tips</h1>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Expert advice, industry insights, and career guidance to help you succeed 
              in Nepal's dynamic job market.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 mb-8">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Card 
                key={post.id} 
                className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
                onClick={() => handleReadMore(post)}
              >
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-blue-600 text-white">
                    Featured
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{post.author}</span>
                      <span className="text-gray-400">•</span>
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{post.publishDate}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadMore(post);
                      }}
                    >
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Articles */}
            <div className="lg:col-span-3">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 bg-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {searchTerm && (
                  <p className="text-sm text-gray-600">
                    Found {filteredPosts.length} article(s) for "{searchTerm}"
                  </p>
                )}
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
                    onClick={() => handleReadMore(post)}
                  >
                    <div className="relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-3">
                        <Badge variant="secondary">{post.category}</Badge>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <div key={index} className="flex items-center space-x-1 text-xs text-gray-500">
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{post.author}</span>
                        </div>
                        <span className="text-gray-500">{post.publishDate}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No articles found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-gray-900">Recent Posts</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className="flex space-x-3 group cursor-pointer"
                      onClick={() => handleReadMore(post)}
                    >
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{post.publishDate}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-gray-900">Categories</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.filter(cat => cat.value !== 'all').map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`flex items-center justify-between w-full text-left p-2 rounded transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <span className="text-sm">{category.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card className="bg-blue-50">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-gray-900 mb-2">Stay Updated</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get weekly career tips and job market insights delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <Input placeholder="Enter your email" type="email" />
                    <Button className="w-full" size="sm">
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Article Modal */}
      <Dialog open={isArticleModalOpen} onOpenChange={setIsArticleModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" aria-describedby="article-description">
          {selectedArticle && (
            <>
              <DialogHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    className="w-20 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
                      {selectedArticle.title}
                    </DialogTitle>
                    <DialogDescription id="article-description" className="sr-only">
                      {selectedArticle.excerpt}
                    </DialogDescription>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary">{selectedArticle.category}</Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{selectedArticle.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{selectedArticle.author}</span>
                      <span className="text-gray-400">•</span>
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{selectedArticle.publishDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareArticle(selectedArticle)}
                      className="hover:bg-blue-50"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="prose prose-gray max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                    className="article-content"
                  />
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Tags:</span>
                  {selectedArticle.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
