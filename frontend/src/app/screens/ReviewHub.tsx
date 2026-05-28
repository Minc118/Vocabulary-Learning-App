import { RotateCcw, TrendingUp, Clock, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from "react-router";
import { useState, useEffect } from 'react';
import { fetchReviewQueue, fetchCollections, type VocabularyWord, type Collection } from '../../lib/api';

export function ReviewHub() {
  const navigate = useNavigate();
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModes, setSelectedModes] = useState({
    flashcard: true,
    multipleChoice: true,
    spelling: true
  });
  const [wordCountMode, setWordCountMode] = useState<'preset' | 'custom'>('preset');
  const [collectionId, setCollectionId] = useState<string>('all');
  const [wordCount, setWordCount] = useState<number>(20);
  const [customWordCount, setCustomWordCount] = useState<string>('20');
  const [collections, setCollections] = useState<Collection[]>([]);

  const activeModes = Object.entries(selectedModes).filter(([_, v]) => v).map(([k]) => k);

  useEffect(() => {
    Promise.all([
      fetchReviewQueue(100, collectionId),
      fetchCollections()
    ])
      .then(([words, cols]) => {
        setDueCount(words.length);
        setCollections(cols);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [collectionId]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-[28px] font-medium tracking-tight">Review</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Spaced repetition practice</p>
      </div>

      {/* Today's Review */}
      <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-white/80 text-[13px] uppercase tracking-wide mb-2">Due Today</div>
            <div className="text-[56px] font-medium leading-none mb-2">
              {isLoading ? <Loader2 className="w-12 h-12 animate-spin text-white/50" /> : dueCount}
            </div>
            <div className="text-[16px] text-white/90">Words ready for review</div>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-[13px] mb-1">Estimated time</div>
            <div className="text-[24px] font-medium">
              {dueCount !== null ? Math.ceil(dueCount / 3) : 0} min
            </div>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <div className="text-white/80 text-[13px] uppercase tracking-wide">Review Modes</div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedModes.flashcard} onChange={(e) => setSelectedModes({...selectedModes, flashcard: e.target.checked})} className="rounded bg-white/20 border-white/30 text-white focus:ring-0 w-4 h-4" />
              <span className="text-[14px]">Flashcard</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedModes.multipleChoice} onChange={(e) => setSelectedModes({...selectedModes, multipleChoice: e.target.checked})} className="rounded bg-white/20 border-white/30 text-white focus:ring-0 w-4 h-4" />
              <span className="text-[14px]">Multiple Choice</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedModes.spelling} onChange={(e) => setSelectedModes({...selectedModes, spelling: e.target.checked})} className="rounded bg-white/20 border-white/30 text-white focus:ring-0 w-4 h-4" />
              <span className="text-[14px]">Spelling</span>
            </label>
          </div>
        </div>

        <button
          onClick={() => navigate('/review/session', { state: { activeModes, collectionId, limit: wordCount } })}
          disabled={dueCount === 0 || isLoading || activeModes.length === 0}
          className="w-full h-12 bg-white text-primary rounded-lg hover:bg-white/95 transition-colors font-medium text-[15px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {dueCount === 0 ? "You're all caught up!" : "Start Review Session"}
        </button>
      </div>

      {/* Review Options */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-[15px]">Session Settings</h3>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Collection Filter */}
          <div className="space-y-2">
            <label className="block text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Collection</label>
            <select
              value={collectionId}
              onChange={(e) => {
                setIsLoading(true);
                setCollectionId(e.target.value);
              }}
              className="w-full h-10 bg-background border border-input rounded-lg px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Collections</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Word Limit Selector */}
          <div className="space-y-2">
            <label className="block text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Word Limit</label>
            <div className="flex gap-2">
              <select
                value={wordCountMode === 'custom' ? 'custom' : wordCount.toString()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setWordCountMode('custom');
                    const parsed = parseInt(customWordCount, 10);
                    if (!isNaN(parsed) && parsed >= 1 && parsed <= 200) {
                      setWordCount(parsed);
                    } else {
                      setWordCount(20);
                    }
                  } else {
                    setWordCountMode('preset');
                    const num = parseInt(val, 10);
                    setWordCount(num);
                    setCustomWordCount(val);
                  }
                }}
                className="w-1/2 h-10 bg-background border border-input rounded-lg px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="10">10 Words</option>
                <option value="20">20 Words</option>
                <option value="50">50 Words</option>
                <option value="100">100 Words</option>
                <option value="custom">Custom...</option>
              </select>
              
              {wordCountMode === 'custom' && (
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={customWordCount}
                  onChange={(e) => {
                    setCustomWordCount(e.target.value);
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed) && parsed >= 1 && parsed <= 200) {
                      setWordCount(parsed);
                    } else {
                      setWordCount(20); // Safe fallback default
                    }
                  }}
                  className="w-1/2 h-10 bg-background border border-input rounded-lg px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="1-200"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">This Week</span>
          </div>
          <div className="text-[32px] font-medium mb-1">--</div>
          <div className="text-[13px] text-muted-foreground">Cards reviewed</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Accuracy</span>
          </div>
          <div className="text-[32px] font-medium mb-1">--%</div>
          <div className="text-[13px] text-muted-foreground">Average recall rate</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Study Time</span>
          </div>
          <div className="text-[32px] font-medium mb-1">--</div>
          <div className="text-[13px] text-muted-foreground">Total this week</div>
        </div>
      </div>
    </div>
  );
}
