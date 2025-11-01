import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Link2,
  Image,
  Type,
  Palette
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showImageUpload?: boolean;
  showLinkInsert?: boolean;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...",
  className = "",
  showImageUpload = false,
  showLinkInsert = true
}: RichTextEditorProps) {
  const [selectedText, setSelectedText] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleTextChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    executeCommand('fontSize', '3');
    // Apply custom font size using style
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = size + 'px';
        try {
          range.surroundContents(span);
        } catch (e) {
          // Fallback for complex selections
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
        }
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    handleTextChange();
  };

  const handleColorChange = (color: string) => {
    setTextColor(color);
    executeCommand('foreColor', color);
    handleTextChange();
  };

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
    executeCommand('fontName', family);
    handleTextChange();
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #3B82F6; text-decoration: underline;">${linkText}</a>`;
      executeCommand('insertHTML', linkHtml);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
      handleTextChange();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const imageHtml = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
        executeCommand('insertHTML', imageHtml);
        handleTextChange();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-gray-50">
        {/* Font Family */}
        <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
            <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
            <SelectItem value="Tahoma">Tahoma</SelectItem>
            <SelectItem value="Impact">Impact</SelectItem>
            <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
          </SelectContent>
        </Select>

        {/* Font Size */}
        <Select value={fontSize} onValueChange={handleFontSizeChange}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12px</SelectItem>
            <SelectItem value="14">14px</SelectItem>
            <SelectItem value="16">16px</SelectItem>
            <SelectItem value="18">18px</SelectItem>
            <SelectItem value="20">20px</SelectItem>
            <SelectItem value="24">24px</SelectItem>
            <SelectItem value="28">28px</SelectItem>
            <SelectItem value="32">32px</SelectItem>
            <SelectItem value="36">36px</SelectItem>
            <SelectItem value="48">48px</SelectItem>
          </SelectContent>
        </Select>

        {/* Text Color */}
        <div className="flex items-center gap-1">
          <Input
            type="color"
            value={textColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-8 h-8 p-1 border-0"
            title="Text Color"
          />
          <Palette className="h-4 w-4 text-gray-500" />
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Formatting Buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('bold')}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('italic')}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('underline')}
          className="h-8 w-8 p-0"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('justifyLeft')}
          className="h-8 w-8 p-0"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('justifyCenter')}
          className="h-8 w-8 p-0"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('justifyRight')}
          className="h-8 w-8 p-0"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('insertUnorderedList')}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('insertOrderedList')}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        {showLinkInsert && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkDialog(true)}
              className="h-8 w-8 p-0"
              title="Insert Link"
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </>
        )}

        {showImageUpload && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 w-8 p-0"
                title="Insert Image"
              >
                <span>
                  <Image className="h-4 w-4" />
                </span>
              </Button>
            </label>
          </>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        lang="en"
        suppressContentEditableWarning
        onFocus={() => {
          try { document.execCommand('justifyLeft'); } catch {}
          normalizeEditorContent();
        }}
        onInput={() => {
          normalizeEditorContent();
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        className="min-h-[200px] p-4 focus:outline-none text-left"
        style={{ 
          fontSize: '16px',  
          lineHeight: '1.5',
          color: '#374151',
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'plaintext'
        }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Link Text</label>
                <Input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowLinkDialog(false);
                    setLinkUrl('');
                    setLinkText('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={insertLink}>Insert Link</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
