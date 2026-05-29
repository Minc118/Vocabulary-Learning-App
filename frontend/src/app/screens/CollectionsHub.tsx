import { Plus, FolderOpen, Book, Loader2 } from 'lucide-react';
import { useNavigate } from "react-router";
import { useEffect, useState } from 'react';
import { fetchCollections, createCollection, type Collection } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function CollectionsHub() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Modal states for creating collections
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCollections();
      setCollections(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleCreate = () => {
    setNewCollectionName('');
    setNewCollectionDesc('');
    setCreateError(null);
    setIsDialogOpen(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) {
      setCreateError('Collection name is required');
      return;
    }
    
    setIsCreating(true);
    setCreateError(null);
    try {
      await createCollection({
        name: newCollectionName.trim(),
        description: newCollectionDesc.trim()
      });
      await loadCollections();
      setIsDialogOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  // Premium, unified design tokens for folder backgrounds and badges
  const getColor = (str: string) => {
    const textColors = [
      'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/30',
      'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30',
      'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30',
      'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/30',
      'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30',
      'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return textColors[Math.abs(hash) % textColors.length];
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-200">
      {/* Header Panel */}
      <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">Collections Hub</h1>
          <p className="text-muted-foreground text-[14.5px] mt-1 font-medium">Organize and structure vocabulary words by customized study topics</p>
        </div>
        <button 
          onClick={handleCreate}
          disabled={isCreating}
          className="h-10 px-5 bg-[#002434] hover:bg-[#0a3346] text-white font-bold rounded-xl transition-all text-[13.5px] flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-black/10 active:scale-95"
        >
          {isCreating ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Plus className="w-4.5 h-4.5 text-teal-400" strokeWidth={2.5} />}
          <span>New Collection</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200/50 bg-rose-50 px-4 py-3 text-[13.5px] font-medium text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" strokeWidth={1.5} />
          <span className="text-[14px] font-medium">Fetching vocabulary collections...</span>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border border-dashed rounded-2xl shadow-sm">
          <FolderOpen className="w-12 h-12 mx-auto text-slate-400 mb-4 animate-pulse" strokeWidth={1.5} />
          <h3 className="text-[17px] font-bold text-foreground mb-1">No collections found</h3>
          <p className="text-[14px] text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
            Create your first vocabulary collection to cluster terms and organize review queues.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => navigate(`/collections/${collection.id}`, { state: collection })}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getColor(collection.id)}`}>
                    <FolderOpen className="w-5.5 h-5.5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="font-bold text-[16px] text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate">
                      {collection.name}
                    </div>
                    {collection.description ? (
                      <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                        {collection.description}
                      </p>
                    ) : (
                      <p className="text-[13px] text-slate-350 italic font-medium">
                        No description provided.
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[12.5px] font-bold text-slate-500 pt-2">
                      <Book className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                      <span>{(collection as any).word_count ?? 0} words</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Quick Create Card */}
            <button 
              onClick={handleCreate}
              className="bg-card border border-border border-dashed rounded-2xl p-6 hover:border-primary/25 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all flex items-center justify-center min-h-[140px] cursor-pointer group"
            >
              <div className="text-center space-y-2">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors mx-auto" strokeWidth={2} />
                <div className="text-[14px] font-bold text-slate-500 group-hover:text-foreground transition-colors">Create Collection</div>
              </div>
            </button>
          </div>

          {/* Recently Updated Sidepanel / Section */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4.5 border-b border-border/80 bg-slate-50/50 dark:bg-slate-800/25">
              <h2 className="font-bold text-[15px] text-slate-900 dark:text-white">Recently Updated</h2>
            </div>
            <div className="divide-y divide-border/60">
              {collections.slice(0, 3).map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => navigate(`/collections/${collection.id}`, { state: collection })}
                  className="w-full px-6 py-4.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getColor(collection.id)}`}>
                      <FolderOpen className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="font-bold text-[14.5px] text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                        {collection.name}
                      </div>
                      <div className="text-[12.5px] text-slate-500 mt-0.5 font-bold flex items-center gap-1.5">
                        <Book className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                        <span>{(collection as any).word_count ?? 0} words</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[12.5px] font-semibold text-slate-400">
                    Created {new Date(collection.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl p-6">
          <form onSubmit={handleSubmitCreate} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="text-[19px] font-bold text-slate-900 dark:text-white">New Collection</DialogTitle>
              <DialogDescription className="text-[13.5px] text-muted-foreground">
                Group vocabulary cards together under a single subject or course track.
              </DialogDescription>
            </DialogHeader>

            {createError && (
              <div className="rounded-xl border border-rose-200/50 bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700 animate-in fade-in-50 duration-200">
                {createError}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[13px] font-bold text-slate-550">Collection Name *</Label>
                <Input
                  id="name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g. GRE Prep, Business Spanish..."
                  disabled={isCreating}
                  required
                  autoFocus
                  className="h-10 px-3.5 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[14px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-[13px] font-bold text-slate-550">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="Describe the learning objectives or contents of this collection..."
                  disabled={isCreating}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl text-[14px] placeholder:text-muted-foreground focus:outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                />
              </div>
            </div>

            <DialogFooter className="flex sm:justify-end gap-3.5 pt-3 border-t border-border/80">
              <DialogClose asChild>
                <button
                  type="button"
                  disabled={isCreating}
                  className="h-10 px-4.5 border border-border rounded-xl text-[13.5px] font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="submit"
                disabled={isCreating}
                className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all text-[13.5px] flex items-center justify-center gap-2 disabled:opacity-50 min-w-[100px] cursor-pointer shadow-md shadow-primary/5"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Collection'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
