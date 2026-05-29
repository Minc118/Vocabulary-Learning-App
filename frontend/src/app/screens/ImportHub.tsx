import { Upload, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router";

export function ImportHub() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-200">
      {/* Header Panel */}
      <div className="border-b border-border/80 pb-5">
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">Bring your words into Voca</h1>
        <p className="text-muted-foreground text-[14.5px] mt-1.5 font-medium max-w-2xl">
          Paste text articles, upload documents, and transform raw native materials into systematic reviewable flashcards.
        </p>
      </div>

      {/* Stepper Pipeline Overview */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <h2 className="font-bold text-[16px] text-slate-900 dark:text-white mb-6">Pipeline Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 flex items-center justify-center mx-auto shadow-sm">
              <FileText className="w-5.5 h-5.5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-bold text-[14.5px] text-slate-850 dark:text-slate-100">1. Paste / Upload</div>
              <div className="text-[13px] text-muted-foreground mt-1 leading-relaxed font-medium">Add target articles, snippets, or documents</div>
            </div>
          </div>

          <div className="text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/15 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-5.5 h-5.5 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-bold text-[14.5px] text-slate-850 dark:text-slate-100">2. Select Candidates</div>
              <div className="text-[13px] text-muted-foreground mt-1 leading-relaxed font-medium">Filter automatically detected keywords</div>
            </div>
          </div>

          <div className="text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-bold text-[14.5px] text-slate-850 dark:text-slate-100">3. Save & Enrich</div>
              <div className="text-[13px] text-muted-foreground mt-1 leading-relaxed font-medium">AI auto-populates rich translations & IPAs</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/import/step1')}
          className="w-full h-11 mt-8 bg-[#002434] hover:bg-[#0a3346] text-white rounded-xl font-bold transition-all text-[14px] flex items-center justify-center gap-2 shadow-md shadow-black/10 active:scale-99 cursor-pointer"
        >
          <span>Start New Import</span>
          <ArrowRight className="w-4 h-4 text-teal-400" strokeWidth={2.5} />
        </button>
      </div>

      {/* Import Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Paste Text Active */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-[16px] text-slate-900 dark:text-white pt-1">Paste Text & Document Analysis</h3>
            <p className="text-[13.5px] text-muted-foreground leading-relaxed font-medium">
              Copy-paste target articles, upload image captures, or insert PDFs. Voca AI automatically extracts relevant vocabulary.
            </p>
          </div>
          <button 
            onClick={() => navigate('/import/step1')}
            className="mt-6 text-[13.5px] font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
          >
            <span>Configure settings</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Future CSV/Anki Coming soon */}
        <div className="bg-card border border-border border-dashed rounded-2xl p-6 shadow-sm flex flex-col justify-between opacity-80">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-450">
              <Upload className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <h3 className="font-bold text-[16px] text-slate-500">File & List Import</h3>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10.5px] font-bold text-slate-500 rounded border border-border uppercase tracking-wide">
                Soon
              </span>
            </div>
            <p className="text-[13.5px] text-muted-foreground leading-relaxed font-medium">
              Support for importing CSV / TSV vocabulary lists and Anki text export datasets directly into custom collections.
            </p>
          </div>
          <span className="mt-6 text-[13px] font-bold text-slate-400 italic">
            Currently undergoing backend optimization.
          </span>
        </div>
      </div>

      {/* Recent Imports Panel */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4.5 border-b border-border bg-slate-50/50 dark:bg-slate-800/25">
          <h2 className="font-bold text-[15px] text-slate-900 dark:text-white">Recent Imports History</h2>
        </div>
        <div className="divide-y divide-border/60">
          {[
            { title: 'German Business Article', words: 12, date: '2 days ago' },
            { title: 'Technology Blog Post', words: 8, date: '1 week ago' },
            { title: 'Academic Paper Extract', words: 15, date: '2 weeks ago' },
          ].map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
              <div>
                <div className="font-bold text-[14.5px] text-slate-900 dark:text-slate-100">{item.title}</div>
                <div className="text-[12.5px] text-muted-foreground mt-0.5 font-semibold">{item.words} vocabulary terms imported</div>
              </div>
              <div className="text-[12.5px] font-bold text-slate-400">{item.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
