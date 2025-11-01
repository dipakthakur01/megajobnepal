import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { FileText, Lightbulb } from 'lucide-react';

interface SummaryFormProps {
  data: string;
  onChange: (data: string) => void;
}

const summaryExamples = [
  "Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable web applications and leading cross-functional teams to achieve project goals.",
  "Results-driven marketing professional with 3+ years of experience in digital marketing, content strategy, and brand management. Skilled in SEO, social media marketing, and data analytics with a passion for driving customer engagement and business growth.",
  "Detail-oriented data analyst with expertise in Python, SQL, and machine learning. Experienced in transforming complex datasets into actionable insights that drive business decisions and improve operational efficiency.",
  "Creative UI/UX designer with 4+ years of experience creating user-centered designs for web and mobile applications. Proficient in Figma, Adobe Creative Suite, and prototyping tools with a strong focus on accessibility and user experience."
];

const SummaryForm: React.FC<SummaryFormProps> = ({ data, onChange }) => {
  const handleExampleClick = (example: string) => {
    onChange(example);
  };

  const wordCount = data.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = data.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Professional Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="summary">
            Professional Summary *
            <span className="text-sm text-gray-500 ml-2">
              ({wordCount} words, {charCount} characters)
            </span>
          </Label>
          <Textarea
            id="summary"
            placeholder="Write a compelling professional summary that highlights your key skills, experience, and career objectives. This should be 2-4 sentences that capture your professional identity and value proposition."
            value={data}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            className="resize-none"
            required
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Recommended: 50-150 words</span>
            <span className={wordCount > 150 ? 'text-red-500' : wordCount < 50 ? 'text-yellow-500' : 'text-green-500'}>
              {wordCount < 50 ? 'Too short' : wordCount > 150 ? 'Too long' : 'Good length'}
            </span>
          </div>
        </div>

        {/* Writing Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Writing Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Start with your professional title and years of experience</li>
                <li>• Highlight your most relevant skills and achievements</li>
                <li>• Mention specific technologies, tools, or methodologies you excel in</li>
                <li>• Include quantifiable results when possible (e.g., "increased sales by 25%")</li>
                <li>• End with your career goals or what you bring to potential employers</li>
                <li>• Use action words and avoid first-person pronouns (I, me, my)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Example Summaries */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Example Summaries</h3>
          <div className="grid gap-4">
            {summaryExamples.map((example, index) => (
              <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <p className="text-sm text-gray-700 mb-2">{example}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(example)}
                  className="text-xs"
                >
                  Use This Example
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Character Limit Warning */}
        {charCount > 800 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your summary is quite long ({charCount} characters). 
              Consider shortening it to ensure it fits well on your resume and maintains the reader's attention.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryForm;