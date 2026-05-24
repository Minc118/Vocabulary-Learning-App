import { ArrowLeft, ArrowRight, FileText, Loader2, UploadCloud, Settings2 } from 'lucide-react';
import { useNavigate, useLocation } from "react-router";
import { useState, useRef } from 'react';
import { analyzeText, extractTextFromFile } from '../../lib/api';

export function ImportStep1() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('English');
  const [text, setText] = useState('');
  
  // New Dynamic configuration state
  const [level, setLevel] = useState('Intermediate');
  const [goal, setGoal] = useState('General');
  const [count, setCount] = useState(10);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const candidates = await analyzeText(text, language, level, goal, count);
      navigate('/import/step2', { 
        state: { 
          title, 
          language, 
          text, 
          candidates 
        } 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze text');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          const extractedText = await extractTextFromFile(base64String, file.type);
          setText(prev => prev ? prev + '\n\n' + extractedText : extractedText);
          if (!title) setTitle(file.name.split('.')[0]);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to extract text from file');
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
      setIsExtracting(false);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/import')}
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

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
            {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-6 space-y-5">
          <div>
            <label className="block text-[13px] mb-2">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., German Business Article"
              className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label className="block text-[13px] mb-2">Language</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              <option>German</option>
              <option>English</option>
              <option>French</option>
              <option>Spanish</option>
              <option>Japanese</option>
            </select>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-4 text-[14px] font-medium">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              AI Extraction Configuration
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[12px] text-muted-foreground mb-1.5">My Level</label>
                <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full h-9 px-3 bg-card border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option>Beginner (A1-A2)</option>
                  <option>Intermediate (B1-B2)</option>
                  <option>Advanced (C1-C2)</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] text-muted-foreground mb-1.5">Goal</label>
                <select 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full h-9 px-3 bg-card border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option>General</option>
                  <option>Business</option>
                  <option>Travel</option>
                  <option>Academic</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] text-muted-foreground mb-1.5">Max Candidates</label>
                <input 
                  type="number"
                  min="5" max="50"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-card border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[13px]">Text Content</label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="flex items-center gap-1.5 text-[13px] text-primary hover:text-primary/80 disabled:opacity-50"
              >
                {isExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                {isExtracting ? 'Extracting...' : 'Upload Image / PDF'}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
                accept="image/*,application/pdf" 
                className="hidden" 
              />
            </div>
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
            onClick={() => navigate('/import')}
            className="h-10 px-5 border border-border rounded-lg hover:bg-accent transition-colors text-[14px]"
            disabled={isAnalyzing}
          >
            Cancel
          </button>
          <button
            onClick={handleAnalyze}
            disabled={wordCount === 0 || isAnalyzing}
            className="h-10 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze Text'}
            {!isAnalyzing && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
          </button>
        </div>
      </div>
    </div>
  );
}
