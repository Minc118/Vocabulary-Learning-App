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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-200">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-border/80 pb-5">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">Review Hub</h1>
          <p className="text-muted-foreground text-[14.5px] mt-1 font-medium">Strengthen memory retention with active recall spaced repetition sessions</p>
        </div>
      </div>

      {/* Hero card - Due Today */}
      <div className="bg-gradient-to-br from-[#002434] via-[#053247] to-[#011a26] rounded-2xl p-8 text-white shadow-xl shadow-black/5 relative overflow-hidden">
        {/* Abstract background highlight glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 relative z-10">
          <div className="space-y-1">
            <div className="text-teal-400 text-[12px] font-bold uppercase tracking-wider">Queue Status</div>
            <div className="text-[52px] font-bold leading-none tracking-tight flex items-baseline gap-1 mt-1">
              {isLoading ? (
                <Loader2 className="w-10 h-10 animate-spin text-white/40" />
              ) : (
                dueCount
              )}
              <span className="text-[15px] font-medium text-slate-350 ml-1.5">words ready</span>
            </div>
            <p className="text-[14px] text-slate-200 font-medium pt-1">
              Bring your words, learn smarter. Consolidate your memory curve today.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[150px] backdrop-blur-md">
            <div className="text-white/60 text-[11.5px] font-bold uppercase tracking-wider">Estimated study time</div>
            <div className="text-[24px] font-bold text-white mt-1 flex items-baseline gap-1">
              {dueCount !== null ? Math.ceil(dueCount * 0.5) : 0}
              <span className="text-[13px] font-medium text-white/70">mins</span>
            </div>
          </div>
        </div>

        {/* Review Mode checkboxes formatted premiumly */}
        <div className="mb-8 space-y-3 relative z-10">
          <div className="text-teal-400 text-[11.5px] font-bold uppercase tracking-wider">Configure study formats</div>
          <div className="flex flex-wrap gap-4 pt-1.5">
            <label className="flex items-center gap-2.5 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-[14px] transition-all font-semibold select-none">
              <input 
                type="checkbox" 
                checked={selectedModes.flashcard} 
                onChange={(e) => setSelectedModes({...selectedModes, flashcard: e.target.checked})} 
                className="rounded bg-white/10 border-white/20 text-teal-500 focus:ring-0 focus:ring-offset-0 w-4.5 h-4.5 cursor-pointer" 
              />
              <span>Flashcard</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-[14px] transition-all font-semibold select-none">
              <input 
                type="checkbox" 
                checked={selectedModes.multipleChoice} 
                onChange={(e) => setSelectedModes({...selectedModes, multipleChoice: e.target.checked})} 
                className="rounded bg-white/10 border-white/20 text-teal-500 focus:ring-0 focus:ring-offset-0 w-4.5 h-4.5 cursor-pointer" 
              />
              <span>Multiple Choice</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-[14px] transition-all font-semibold select-none">
              <input 
                type="checkbox" 
                checked={selectedModes.spelling} 
                onChange={(e) => setSelectedModes({...selectedModes, spelling: e.target.checked})} 
                className="rounded bg-white/10 border-white/20 text-teal-500 focus:ring-0 focus:ring-offset-0 w-4.5 h-4.5 cursor-pointer" 
              />
              <span>Spelling</span>
            </label>
          </div>
        </div>

        <button
          onClick={() => navigate('/review/session', { state: { activeModes, collectionId, limit: wordCount } })}
          disabled={dueCount === 0 || isLoading || activeModes.length === 0}
          className="w-full h-12 bg-white hover:bg-slate-50 text-[#002434] rounded-xl transition-all font-bold text-[14.5px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg active:scale-99 relative z-10 flex items-center justify-center"
        >
          {dueCount === 0 ? "All caught up for today!" : "Start Recall Session"}
        </button>
      </div>

      {/* Review Options Grid */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-[15px] text-foreground">Session Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Collection Filter */}
          <div className="space-y-2">
            <label className="block text-[12px] text-muted-foreground font-bold uppercase tracking-wider">Source Material</label>
            <select
              value={collectionId}
              onChange={(e) => {
                setIsLoading(true);
                setCollectionId(e.target.value);
              }}
              className="w-full h-10 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl px-3.5 text-[14px] focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer font-semibold text-slate-700 dark:text-slate-305"
            >
              <option value="all">All Library Words</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Word Limit Selector */}
          <div className="space-y-2">
            <label className="block text-[12px] text-muted-foreground font-bold uppercase tracking-wider">Recall Threshold Limit</label>
            <div className="flex gap-3">
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
                className="flex-1 h-10 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl px-3.5 text-[14px] focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer font-semibold text-slate-700 dark:text-slate-350"
              >
                <option value="10">10 Words</option>
                <option value="20">20 Words</option>
                <option value="50">50 Words</option>
                <option value="100">100 Words</option>
                <option value="custom">Custom count...</option>
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
                      setWordCount(20); // safe fallback
                    }
                  }}
                  className="w-1/3 h-10 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl px-3.5 text-[14px] focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-semibold"
                  placeholder="1-200"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-450 mb-3">
            <Calendar className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
            <span className="text-[12px] font-bold uppercase tracking-wider">Weekly Volume</span>
          </div>
          <div className="text-[32px] font-bold text-foreground mb-1">--</div>
          <div className="text-[13px] text-muted-foreground font-medium">Terms reviewed this week</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-450 mb-3">
            <TrendingUp className="w-4 h-4 text-teal-500" strokeWidth={1.5} />
            <span className="text-[12px] font-bold uppercase tracking-wider">Recall Accuracy</span>
          </div>
          <div className="text-[32px] font-bold text-foreground mb-1">--%</div>
          <div className="text-[13px] text-muted-foreground font-medium">Average target memory accuracy</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-450 mb-3">
            <Clock className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
            <span className="text-[12px] font-bold uppercase tracking-wider">Learning Time</span>
          </div>
          <div className="text-[32px] font-bold text-foreground mb-1">--</div>
          <div className="text-[13px] text-muted-foreground font-medium">Total minutes studied this week</div>
        </div>
      </div>
    </div>
  );
}
