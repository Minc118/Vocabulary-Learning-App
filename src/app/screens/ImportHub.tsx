import { Upload, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from "react-router";



export function ImportHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-[28px] font-medium tracking-tight">Import</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Extract vocabulary from text</p>
      </div>

      {/* Process Overview */}
      <div className="bg-card border border-border rounded-lg p-8">
        <h2 className="font-medium text-[17px] mb-6">Import Process</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div className="font-medium text-[14px] mb-1">Paste Text</div>
            <div className="text-[13px] text-muted-foreground">Add article or text content</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div className="font-medium text-[14px] mb-1">Select Words</div>
            <div className="text-[13px] text-muted-foreground">Choose vocabulary to save</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div className="font-medium text-[14px] mb-1">Save & Enrich</div>
            <div className="text-[13px] text-muted-foreground">AI generates definitions</div>
          </div>
        </div>

        <button
          onClick={() => navigate('/import/step1')}
          className="w-full h-11 mt-8 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center justify-center gap-2"
        >
          Start New Import
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Recent Imports */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-medium text-[15px]">Recent Imports</h2>
        </div>
        <div className="divide-y divide-border">
          {[
            { title: 'German Business Article', words: 12, date: '2 days ago' },
            { title: 'Technology Blog Post', words: 8, date: '1 week ago' },
            { title: 'Academic Paper Extract', words: 15, date: '2 weeks ago' },
          ].map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-accent transition-colors">
              <div>
                <div className="font-medium text-[14px] mb-0.5">{item.title}</div>
                <div className="text-[13px] text-muted-foreground">{item.words} words imported</div>
              </div>
              <div className="text-[13px] text-muted-foreground">{item.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
