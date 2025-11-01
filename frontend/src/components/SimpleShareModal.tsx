import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Copy, Share2, Facebook, Twitter, Linkedin, MessageCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

export const SimpleShareModal = React.memo(function SimpleShareModal({ 
  isOpen, 
  onClose, 
  jobId, 
  jobTitle 
}: SimpleShareModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const jobUrl = `${window.location.origin}/jobs/${jobId}`;

  const handleCopyLink = useCallback(async (): Promise<void> => {
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
      toast.error('Unable to copy link. Please copy manually from the text field');
    }
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  }, [jobUrl]);

  const fallbackCopyToClipboard = useCallback((text: string): void => {
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
        toast.info('Please copy the link manually from the text field below');
      }
    } catch (error) {
      console.error('Fallback copy failed:', error);
      
      // Final fallback - select the input field text
      try {
        const inputElement = document.querySelector('input[readonly]');
        if (inputElement) {
          inputElement.focus();
          inputElement.setSelectionRange(0, inputElement.value.length);
          inputElement.select();
          toast.info('Please use Ctrl+C (or Cmd+C) to copy the selected link');
        } else {
          // Last resort - show in alert
          const message = `Copy this job link:\n\n${text}`;
          alert(message);
        }
      } catch (finalError) {
        console.error('All copy methods failed:', finalError);
        const message = `Copy this job link:\n\n${text}`;
        alert(message);
      }
    }
  }, []);

  const handleSocialShare = (platform) => {
    const shareText = `Check out this job: ${jobTitle}`;
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${jobUrl}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      toast.success(`Opening ${platform}...`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="simple-share-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Job
          </DialogTitle>
          <DialogDescription id="simple-share-description">
            Share this job opportunity with others
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">{jobTitle}</p>
            <div className="flex items-center gap-2">
              <Input
                value={jobUrl}
                readOnly
                className="flex-1"
              />
              <Button 
                onClick={handleCopyLink} 
                size="sm"
                variant={copied ? "default" : "outline"}
                className={copied ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Share on:</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSocialShare('facebook')}
                className="text-blue-600"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSocialShare('twitter')}
                className="text-sky-500"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSocialShare('linkedin')}
                className="text-blue-700"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSocialShare('whatsapp')}
                className="text-green-600"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
