'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { HeroCarousel } from '../components/HeroCarousel';
import { apiClient } from '../lib/api-client';
import { toast } from 'sonner';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  MessageSquare, 
  HeadphonesIcon,
  Building,
  Users,
  Globe
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: string) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [siteInfo, setSiteInfo] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiClient.getSectionSettings('site_info');
        if (mounted) setSiteInfo((data as any)?.config ?? data);
      } catch (err) {
        console.warn('Failed to load site_info:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);
  
  const staticContactInfo = [
    {
      icon: MapPin,
      title: 'Head Office',
      details: [
        'MegaJobNepal Pvt. Ltd.',
        'Putalisadak, Kathmandu',
        'Bagmati Province, Nepal',
        'P.O. Box: 12345'
      ]
    },
    {
      icon: Phone,
      title: 'Phone Numbers',
      details: [
        'Main: +977-1-4444567',
        'Support: +977-1-4444568',
        'Sales: +977-1-4444569',
        'HR: +977-1-4444570'
      ]
    },
    {
      icon: Mail,
      title: 'Email Addresses',
      details: [
        'General: info@megajobnepal.com.np',
        'Support: support@megajobnepal.com.np',
        'Sales: sales@megajobnepal.com.np',
        'Careers: hr@megajobnepal.com.np'
      ]
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: [
        'Monday - Friday: 9:00 AM - 6:00 PM',
        'Saturday: 10:00 AM - 4:00 PM',
        'Sunday: Closed',
        'Public Holidays: Closed'
      ]
    }
  ];
  const contactInfo = siteInfo ? [
    {
      icon: MapPin,
      title: siteInfo?.companyName || 'Head Office',
      details: [
        siteInfo?.companyName || 'MegaJobNepal Pvt. Ltd.',
        siteInfo?.addressLine1 || 'Putalisadak, Kathmandu',
        siteInfo?.addressLine2 || 'Bagmati Province, Nepal',
        siteInfo?.poBox || 'P.O. Box: 12345'
      ].filter(Boolean)
    },
    {
      icon: Phone,
      title: 'Phone Numbers',
      details: [
        siteInfo?.mainPhone ? `Main: ${siteInfo.mainPhone}` : 'Main: +977-1-4444567',
        siteInfo?.supportPhone ? `Support: ${siteInfo.supportPhone}` : 'Support: +977-1-4444568',
        siteInfo?.salesPhone ? `Sales: ${siteInfo.salesPhone}` : 'Sales: +977-1-4444569',
        siteInfo?.hrPhone ? `HR: ${siteInfo.hrPhone}` : 'HR: +977-1-4444570'
      ].filter(Boolean)
    },
    {
      icon: Mail,
      title: 'Email Addresses',
      details: [
        siteInfo?.email ? `General: ${siteInfo.email}` : 'General: info@megajobnepal.com.np',
        siteInfo?.supportEmail ? `Support: ${siteInfo.supportEmail}` : 'Support: support@megajobnepal.com.np',
        siteInfo?.salesEmail ? `Sales: ${siteInfo.salesEmail}` : 'Sales: sales@megajobnepal.com.np',
        siteInfo?.careersEmail ? `Careers: ${siteInfo.careersEmail}` : 'Careers: hr@megajobnepal.com.np'
      ].filter(Boolean)
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: [
        siteInfo?.weekdayHours || 'Monday - Friday: 9:00 AM - 6:00 PM',
        siteInfo?.saturdayHours || 'Saturday: 10:00 AM - 4:00 PM',
        siteInfo?.sundayHours || 'Sunday: Closed',
        siteInfo?.holidayHours || 'Public Holidays: Closed'
      ].filter(Boolean)
    }
  ] : staticContactInfo;

  const departments = [
    {
      icon: HeadphonesIcon,
      name: 'Customer Support',
      description: 'Get help with your account, job applications, or technical issues.',
      email: 'support@megajobnepal.com.np',
      phone: '+977-1-4444568',
      responseTime: '24 hours'
    },
    {
      icon: Building,
      name: 'Sales & Partnerships',
      description: 'Inquiries about employer packages, partnerships, and business solutions.',
      email: 'sales@megajobnepal.com.np',
      phone: '+977-1-4444569',
      responseTime: '12 hours'
    },
    {
      icon: Users,
      name: 'Human Resources',
      description: 'Career opportunities at MegaJobNepal and general HR inquiries.',
      email: 'hr@megajobnepal.com.np',
      phone: '+977-1-4444570',
      responseTime: '48 hours'
    },
    {
      icon: Globe,
      name: 'Media & Press',
      description: 'Media inquiries, press releases, and public relations matters.',
      email: 'media@megajobnepal.com.np',
      phone: '+977-1-4444571',
      responseTime: '24 hours'
    }
  ];

  const faqs = [
    {
      question: 'How do I create an account on MegaJobNepal?',
      answer: 'Click on "Login/Register" and choose between Job Seeker or Employer account. Fill in your details and verify your email to get started.'
    },
    {
      question: 'Is there a fee for job seekers to use the platform?',
      answer: 'No, MegaJobNepal is completely free for job seekers. You can search jobs, apply, and manage your profile at no cost.'
    },
    {
      question: 'How long does it take for employers to respond to applications?',
      answer: 'Response times vary by employer, but most respond within 1-2 weeks. You can track your application status in your dashboard.'
    },
    {
      question: 'Can I post jobs in languages other than English?',
      answer: 'Yes, we support job postings in Nepali and English. You can choose your preferred language when posting.'
    },
    {
      question: 'Do you provide recruitment services?',
      answer: 'Yes, we offer premium recruitment services including candidate screening, interviews, and placement assistance. Contact our sales team for details.'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic front-end validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim() || !emailRegex.test(formData.email) || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please complete all required fields with valid information.');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        category: formData.category || 'other',
        message: formData.message.trim(),
      });
      toast.success('Message sent successfully! We will contact you soon.');
      setFormData({ name: '', email: '', subject: '', category: '', message: '' });
    } catch (error: any) {
      const msg = error?.message || 'Failed to send message. Please try again later.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroCarousel />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white section-padding">
        <div className="responsive-container">
          <div className="text-center">
            <h1 className="hero-title mb-3 sm:mb-4">Get in Touch</h1>
            <p className="hero-subtitle max-w-2xl mx-auto px-4">
              We're here to help! Whether you have questions, feedback, or need support, 
              our team is ready to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Contact Info */}
      <section className="section-padding bg-white">
        <div className="responsive-container">
          <div className="responsive-grid gap-4 sm:gap-6 lg:gap-8">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <Card key={index} className="mobile-card text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="content-padding">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full mb-3 sm:mb-4">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">{info.title}</h3>
                    <div className="space-y-1">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-xs sm:text-sm text-gray-600">{detail}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form and Departments */}
      <section className="section-padding bg-gray-50">
        <div className="responsive-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Contact Form */}
            <Card className="mobile-card">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span>Send us a Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        className="mobile-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        className="mobile-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Subject *
                    </label>
                    <Input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Enter message subject"
                      className="mobile-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Category *
                    </label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="h-10 sm:h-11 text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing & Payments</SelectItem>
                        <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                        <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                        <SelectItem value="media">Media & Press</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Message *
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Type your message here..."
                      rows={5}
                      className="text-sm resize-none"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full btn-responsive touch-button" disabled={isSubmitting}>
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Departments */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">Our Departments</h2>
              <div className="space-y-4 sm:space-y-6">
                {departments.map((dept, index) => {
                  const IconComponent = dept.icon;
                  return (
                    <Card key={index} className="mobile-card hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{dept.name}</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">{dept.description}</p>
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm">
                                <span className="font-medium">Email:</span> {dept.email}
                              </p>
                              <p className="text-xs sm:text-sm">
                                <span className="font-medium">Phone:</span> {dept.phone}
                              </p>
                              <div className="flex items-center space-x-2 mt-1 sm:mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  Response: {dept.responseTime}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="responsive-heading mb-3 sm:mb-4">Frequently Asked Questions</h2>
            <p className="responsive-subheading px-4">
              Find answers to the most common questions about MegaJobNepal.
            </p>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="mobile-card hover:shadow-lg transition-shadow duration-300">
                <CardContent className="content-padding">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">{faq.question}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Can't find what you're looking for?</p>
            <Button variant="outline" className="btn-responsive touch-button">
              View All FAQs
            </Button>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section-padding bg-gray-50">
        <div className="responsive-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="responsive-heading mb-3 sm:mb-4">Visit Our Office</h2>
            <p className="responsive-subheading px-4">
              We're located in the heart of Kathmandu. Drop by for a coffee and chat!
            </p>
          </div>
          
          <Card className="overflow-hidden mobile-card">
            <div className="h-64 sm:h-80 lg:h-96">
              {/* Direct Google Maps embed */}
              <iframe 
                src="https://maps.google.com/maps?q=Putalisadak+Kathmandu+Nepal&output=embed"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="MegaJobNepal Office Location"
              />
            </div>
            <div className="p-4 sm:p-6 bg-white border-t">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{siteInfo?.companyName || "MegaJobNepal Head Office"}</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {siteInfo?.addressLine1 || "Putalisadak, Kathmandu"}<br />
                    {siteInfo?.addressLine2 || "Bagmati Province, Nepal"}<br />
                    {siteInfo?.poBox ? `P.O. Box: ${siteInfo.poBox}` : "P.O. Box: 12345"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    className="btn-responsive touch-button w-full sm:w-auto"
                    onClick={() => window.open(siteInfo?.googleMapsLink || 'https://goo.gl/maps/putalisadak-kathmandu', '_blank')}
                  >
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button 
                    variant="outline"
                    className="btn-responsive touch-button w-full sm:w-auto"
                    onClick={async () => {
                      const locationText = `${siteInfo?.companyName || 'MegaJobNepal'} - ${siteInfo?.addressLine1 || 'Putalisadak, Kathmandu'}`;
                      const locationUrl = siteInfo?.googleMapsLink || 'https://goo.gl/maps/putalisadak-kathmandu';
                      
                      if (navigator.share) {
                        navigator.share({
                          title: `${siteInfo?.companyName || 'MegaJobNepal'} Office Location`,
                          text: `Visit our office at ${siteInfo?.addressLine1 || 'Putalisadak, Kathmandu'}`,
                          url: locationUrl
                        });
                      } else {
                        try {
                          if (navigator.clipboard && window.isSecureContext) {
                            await navigator.clipboard.writeText(`${locationText} - ${locationUrl}`);
                          } else {
                            // Fallback for non-secure contexts
                            const textArea = document.createElement('textarea');
                            textArea.value = `${locationText} - ${locationUrl}`;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                          }
                        } catch (error) {
                          console.log('Copy failed:', error);
                          // Show manual copy instruction
                          alert(`Please copy manually: ${locationText} - ${locationUrl}`);
                        }
                      }
                    }}
                  >
                    Share Location
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

    </div>
  );
}

