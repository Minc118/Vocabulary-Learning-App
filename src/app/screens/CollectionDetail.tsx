import { ArrowLeft, Edit2, Trash2, Plus, MoreVertical, Clock } from 'lucide-react';

interface CollectionDetailProps {
  onNavigate: (page: string) => void;
  data?: any;
}

export function CollectionDetail({ onNavigate, data }: CollectionDetailProps) {
  const collection = data || { name: 'Business German', count: 87, color: 'bg-blue-500' };

  const words = [
    { word: 'Verantwortung', translation: 'responsibility', mastery: 'Learning', nextReview: 'Today' },
    { word: 'Genauigkeit', translation: 'accuracy', mastery: 'Mastered', nextReview: 'In 5 days' },
    { word: 'Zusammenarbeit', translation: 'collaboration', mastery: 'Familiar', nextReview: 'Tomorrow' },
    { word: 'nachhaltig', translation: 'sustainable', mastery: 'Learning', nextReview: 'Today' },
    { word: 'Geschäftsführung', translation: 'management', mastery: 'Familiar', nextReview: 'In 2 days' },
  ];

  return (
    <div className="p-8 space-y-6">
      <button
        onClick={() => onNavigate('collections')}
        className="flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back to Collections
      </button>

      <div className="bg-card border border-border rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-lg ${collection.color} flex items-center justify-center flex-shrink-0`}>
              <div className="text-[24px] text-white">📚</div>
            </div>
            <div>
              <h1 className="text-[28px] font-medium tracking-tight mb-2">{collection.name}</h1>
              <p className="text-muted-foreground text-[14px]">{collection.count} words in this collection</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors">
              <Edit2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors">
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-[13px] text-muted-foreground mb-1">Total Words</div>
            <div className="text-[24px] font-medium">{collection.count}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-[13px] text-muted-foreground mb-1">Mastered</div>
            <div className="text-[24px] font-medium">28</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-[13px] text-muted-foreground mb-1">Learning</div>
            <div className="text-[24px] font-medium">43</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-[13px] text-muted-foreground mb-1">New</div>
            <div className="text-[24px] font-medium">16</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-medium text-[17px]">Words in Collection</h2>
        <button className="h-9 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Add Words
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                Word
              </th>
              <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                Translation
              </th>
              <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                Mastery
              </th>
              <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                Next Review
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {words.map((item, i) => (
              <tr key={i} className="hover:bg-accent/50 transition-colors">
                <td className="px-6 py-4 font-medium text-[14px]">{item.word}</td>
                <td className="px-6 py-4 text-[14px]">{item.translation}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                      item.mastery === 'Mastered'
                        ? 'bg-green-100 text-green-700'
                        : item.mastery === 'Familiar'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {item.mastery}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[13px]">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                    {item.nextReview}
                  </div>
                </td>
                <td className="px-3 py-4">
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent">
                    <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
