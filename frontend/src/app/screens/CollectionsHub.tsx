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

  // Helper to assign a pseudo-random color based on string
  const getColor = (str: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-medium tracking-tight">Collections</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Organize vocabulary by topic</p>
        </div>
        <button 
          onClick={handleCreate}
          disabled={isCreating}
          className="h-10 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center gap-2 disabled:opacity-50"
        >
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" strokeWidth={2} />}
          New Collection
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading collections...
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border border-dashed rounded-lg">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
          <h3 className="text-[16px] font-medium mb-1">No collections yet</h3>
          <p className="text-[14px] text-muted-foreground">Create your first collection to organize your vocabulary.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => navigate(`/collections/${collection.id}`, { state: collection })}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/20 hover:bg-accent/50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${getColor(collection.id)} flex items-center justify-center flex-shrink-0`}>
                    <FolderOpen className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[15px] mb-1 group-hover:text-primary transition-colors truncate">
                      {collection.name}
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                      <Book className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {(collection as any).word_count ?? 0} words
                    </div>
                  </div>
                </div>
              </button>
            ))}

            <button 
              onClick={handleCreate}
              className="bg-card border border-border border-dashed rounded-lg p-6 hover:border-primary/30 hover:bg-accent/30 transition-all flex items-center justify-center min-h-[120px]"
            >
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
              {collections.slice(0, 3).map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => navigate(`/collections/${collection.id}`, { state: collection })}
                  className="w-full px-6 py-4 hover:bg-accent transition-colors text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${getColor(collection.id)} flex items-center justify-center`}>
                      <FolderOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="font-medium text-[14px] mb-0.5 group-hover:text-primary transition-colors">
                        {collection.name}
                      </div>
                      <div className="text-[13px] text-muted-foreground">Collection</div>
                    </div>
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {new Date(collection.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <DialogHeader>
              <DialogTitle>New Collection</DialogTitle>
              <DialogDescription>
                Create a new collection to organize your vocabulary words.
              </DialogDescription>
            </DialogHeader>

            {createError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12px] text-destructive animate-in fade-in-50 duration-200">
                {createError}
              </div>
            )}

            <div className="space-y-3.5">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Collection Name</Label>
                <Input
                  id="name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g. TOEFL High Frequency, German B2..."
                  disabled={isCreating}
                  required
                  autoFocus
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="Describe the purpose of this collection..."
                  disabled={isCreating}
                  className="resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <button
                  type="button"
                  disabled={isCreating}
                  className="px-4 py-2 border border-border rounded-lg text-[14px] hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 min-w-[100px] cursor-pointer"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
