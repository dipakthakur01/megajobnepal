import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle, 
  Mail, 
  Link, 
  Share2,
  ExternalLink,
  Check
} from 'lucide-react';
import { Job } from '../lib/mockData';
import { toast } from 'sonner';

export const ShareJobModal = React.memo(function ShareJobModal({ isOpen, onClose, job }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);
  
  // Memoize URLs and content to prevent recalculation
  const jobUrl = useMemo(() => `${window.location.origin}/jobs/${job.id}`, [job.id]);
  
  const shareContent = useMemo(() => {
    const companyName = job.company || 'Company';
    const jobType = job.type || 'Position';
    const location = job.location || 'Remote';
    const salary = job.salary || 'Competitive';
    
    return {
      title: `${job.title} at ${companyName}`,
      description: `Check out this ${jobType} position in ${location}. Salary: ${salary}`,
      text: `${job.title} at ${companyName} - Check out this ${jobType} position in ${location}. Salary: ${salary}`
    };
  }, [job]);

  const handleCopyLink = useCallback(async () => {
    try {
      // Check if clipboard API is available and we're in a secure context
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(jobUrl);
          setCopied(true);
          toast.success('Job link copied to clipboard!');
        } catch (clipboardError) {
          console.log('Clipboard API failed, using fallback:', clipboardError);
          fallbackCopyToClipboard(jobUrl);
        }
      } else {
        // Use fallback method for non-secure contexts or older browsers
        fallbackCopyToClipboard(jobUrl);
      }
    } catch (error) {
      console.error('Copy operation failed:', error);
      // Show error message instead of throwing
      toast.error('Unable to copy link. Please copy manually: ' + jobUrl);
    }
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  }, [jobUrl]);

  const fallbackCopyToClipboard = useCallback((text: string) => {
    try {
      // Create a temporary textarea element for better mobile support
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = text;
      
      // Make it invisible but accessible
      tempTextArea.style.position = 'fixed';
      tempTextArea.style.left = '-999999px';
      tempTextArea.style.top = '-999999px';
      tempTextArea.style.opacity = '0';
      tempTextArea.style.pointerEvents = 'none';
      tempTextArea.setAttribute('readonly', '');
      tempTextArea.setAttribute('tabindex', '-1');
      
      document.body.appendChild(tempTextArea);
      
      // Focus and select the text
      tempTextArea.focus();
      tempTextArea.setSelectionRange(0, tempTextArea.value.length);
      tempTextArea.select();
      
      // Try to copy with execCommand (deprecated but more compatible)
      let successful = false;
      try {
        successful = document.execCommand('copy');
      } catch (execError) {
        console.log('execCommand failed:', execError);
        successful = false;
      }
      
      document.body.removeChild(tempTextArea);
      
      if (successful) {
        setCopied(true);
        toast.success('Job link copied to clipboard!');
      } else {
        // Show manual copy instruction instead of throwing error
        toast.info('Please select and copy the link below manually');
      }
    } catch (error) {
      console.error('Fallback copy failed:', error);
      // Show user-friendly message instead of throwing error
      toast.info('Please copy the link manually from the text field below');
    }
  }, []);

  const handleSocialShare = useCallback((platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}&quote=${encodeURIComponent(shareContent.text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(shareContent.text)}&hashtags=MegaJobNepal,JobOpportunity`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}&title=${encodeURIComponent(shareContent.title)}&summary=${encodeURIComponent(shareContent.description)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareContent.text + ' ' + jobUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(shareContent.title)}&body=${encodeURIComponent(shareContent.description + '\n\n' + jobUrl)}`;
        break;
    }
    
    if (shareUrl) {
      // Use setTimeout to ensure the modal doesn't interfere with popup
      setTimeout(() => {
        const popup = window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        if (!popup) {
          // Fallback if popup was blocked
          window.location.href = shareUrl;
        }
      }, 100);
    }
  }, [jobUrl, shareContent]);

  // Web Share API for mobile devices
  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareContent.title,
          text: shareContent.description,
          url: jobUrl
        });
        toast.success('Job shared successfully!');
      } catch (error) {
        // User cancelled sharing or error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Native sharing failed:', error);
          // Fallback to copy link
          handleCopyLink();
        }
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  }, [shareContent, jobUrl, handleCopyLink]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto" aria-describedby="share-job-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Job
          </DialogTitle>
          <DialogDescription id="share-job-description">
            Share this job opportunity with your network or copy the link to save for later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Job Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
              <p className="text-sm text-gray-600">
                {job.company}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {job.location || 'Remote'}
              </p>
            </CardContent>
          </Card>

          {/* Copy Link */}
          <div className="space-y-2">
            <Label htmlFor="job-url">Job Link</Label>
            <div className="flex gap-2">
              <Input
                id="job-url"
                value={jobUrl}
                readOnly
                className="flex-1"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="px-3"
                disabled={copied}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Link copied to clipboard!
              </p>
            )}
          </div>

          {/* Native Share Button (Mobile) */}
          {canShare && (
            <Button
              onClick={handleNativeShare}
              className="w-full"
              variant="default"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share via Device
            </Button>
          )}

          {/* Social Share Options */}
          <div className="space-y-3">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleSocialShare('facebook')}
                variant="outline"
                size="sm"
                className="justify-start"
              >
                <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                Facebook
              </Button>
              
              <Button
                onClick={() => handleSocialShare('twitter')}
                variant="outline"
                size="sm"
                className="justify-start"
              >
                <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                Twitter
              </Button>
              
              <Button
                onClick={() => handleSocialShare('linkedin')}
                variant="outline"
                size="sm"
                className="justify-start"
              >
                <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
                LinkedIn
              </Button>
              
              <Button
                onClick={() => handleSocialShare('whatsapp')}
                variant="outline"
                size="sm"
                className="justify-start"
              >
                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                WhatsApp
              </Button>
            </div>
            
            <Button
              onClick={() => handleSocialShare('email')}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <Mail className="w-4 h-4 mr-2 text-gray-600" />
              Share via Email
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button
              onClick={() => window.open(jobUrl, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Job
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
