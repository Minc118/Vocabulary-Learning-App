import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { useState } from 'react';

interface ImportStep1Props {
  onNavigate: (page: string) => void;
}

export function ImportStep1({ onNavigate }: ImportStep1Props) {
  const [text, setText] = useState('');
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => onNavigate('import')}
          className="flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back to Import
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[14px] font-medium">
              1
            </div>
            <h1 className="text-[28px] font-medium tracking-tight">Paste Text</h1>
          </div>
          <p className="text-muted-foreground text-[14px] ml-11">
            Add the article or text content you want to extract vocabulary from
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-5">
          <div>
            <label className="block text-[13px] mb-2">Title (optional)</label>
            <input
              type="text"
              placeholder="e.g., German Business Article"
              className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label className="block text-[13px] mb-2">Language</label>
            <select className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20">
              <option>German</option>
              <option>English</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] mb-2">Text Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here..."
              rows={16}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none font-mono leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <FileText className="w-4 h-4" strokeWidth={1.5} />
            {wordCount > 0 ? `${wordCount} words` : 'No text added yet'}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => onNavigate('import')}
            className="h-10 px-5 border border-border rounded-lg hover:bg-accent transition-colors text-[14px]"
          >
            Cancel
          </button>
          <button
            onClick={() => onNavigate('import-step2')}
            disabled={wordCount === 0}
            className="h-10 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze Text
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
