import { Plus, FolderOpen, Book } from 'lucide-react';

interface CollectionsHubProps {
  onNavigate: (page: string, data?: any) => void;
}

export function CollectionsHub({ onNavigate }: CollectionsHubProps) {
  const collections = [
    { name: 'Business German', count: 87, color: 'bg-blue-500' },
    { name: 'Academic English', count: 124, color: 'bg-purple-500' },
    { name: 'Travel Vocabulary', count: 45, color: 'bg-green-500' },
    { name: 'Technical Terms', count: 63, color: 'bg-orange-500' },
    { name: 'Everyday Phrases', count: 156, color: 'bg-pink-500' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-medium tracking-tight">Collections</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Organize vocabulary by topic</p>
        </div>
        <button className="h-10 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center gap-2">
          <Plus className="w-4 h-4" strokeWidth={2} />
          New Collection
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {collections.map((collection, i) => (
          <button
            key={i}
            onClick={() => onNavigate('collection-detail', collection)}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/20 hover:bg-accent/50 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg ${collection.color} flex items-center justify-center flex-shrink-0`}>
                <FolderOpen className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[15px] mb-1 group-hover:text-primary transition-colors">
                  {collection.name}
                </div>
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Book className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {collection.count} words
                </div>
              </div>
            </div>
          </button>
        ))}

        <button className="bg-card border border-border border-dashed rounded-lg p-6 hover:border-primary/30 hover:bg-accent/30 transition-all flex items-center justify-center min-h-[120px]">
          <div className="text-center">
            <Plus className="w-6 h-6 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
            <div className="text-[14px] text-muted-foreground">Create Collection</div>
          </div>
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-medium text-[15px]">Recently Updated</h2>
        </div>
        <div className="divide-y divide-border">
          {collections.slice(0, 3).map((collection, i) => (
            <button
              key={i}
              onClick={() => onNavigate('collection-detail', collection)}
              className="w-full px-6 py-4 hover:bg-accent transition-colors text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${collection.color} flex items-center justify-center`}>
                  <FolderOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-medium text-[14px] mb-0.5 group-hover:text-primary transition-colors">
                    {collection.name}
                  </div>
                  <div className="text-[13px] text-muted-foreground">{collection.count} words</div>
                </div>
              </div>
              <div className="text-[13px] text-muted-foreground">Updated today</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
