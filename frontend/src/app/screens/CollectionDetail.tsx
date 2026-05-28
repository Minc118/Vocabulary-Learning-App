import { ArrowLeft, Edit2, Trash2, Plus, MoreVertical, Clock, Loader2, FolderOpen, Volume2 } from 'lucide-react';
import { useNavigate, useLocation, useParams } from "react-router";
import { useEffect, useState } from 'react';
import { fetchWordsByCollection, deleteCollection, type VocabularyWord } from '../../lib/api';
import { speakWord } from '../../lib/speech';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../components/ui/alert-dialog';

export function CollectionDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: collectionId } = useParams<{ id: string }>();
  const data = location.state;

  const collection = data || { name: '...', description: '' };

  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state for deletion
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!collectionId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCollection(collectionId);
      setIsDeleteDialogOpen(false);
      navigate('/collections');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete collection');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!collectionId) {
      setError('No collection ID provided');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadWords = async () => {
      try {
        const items = await fetchWordsByCollection(collectionId);
        if (!isMounted) return;
        setWords(items);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load words');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadWords();

    return () => {
      isMounted = false;
    };
  }, [collectionId]);

  const masteredCount = words.filter(w => w.mastery === 'Mastered').length;
  const learningCount = words.filter(w => w.mastery === 'Learning').length;
  const familiarCount = words.filter(w => w.mastery === 'Familiar').length;

  return (
    <div className="p-8 space-y-6">
      <button
        onClick={() => navigate('/collections')}
        className="flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back to Collections
      </button>

      <div className="bg-card border border-border rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <FolderOpen className="w-8 h-8 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-[28px] font-medium tracking-tight mb-2">{collection.name}</h1>
              <p className="text-muted-foreground text-[14px]">
                {isLoading ? 'Loading...' : `${words.length} words in this collection`}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors">
              <Edit2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button 
              onClick={handleDeleteClick}
              disabled={isDeleting || isLoading}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-[13px] text-muted-foreground mb-1">Total Words</div>
            <div className="text-[24px] font-medium">{isLoading ? '—' : words.length}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-[13px] text-muted-foreground mb-1">Mastered</div>
            <div className="text-[24px] font-medium">{isLoading ? '—' : masteredCount}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-[13px] text-muted-foreground mb-1">Familiar</div>
            <div className="text-[24px] font-medium">{isLoading ? '—' : familiarCount}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-[13px] text-muted-foreground mb-1">Learning</div>
            <div className="text-[24px] font-medium">{isLoading ? '—' : learningCount}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-medium text-[17px]">Words in Collection</h2>
        <button
          onClick={() => navigate('/vocabulary/new')}
          className="h-9 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Add Words
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          {error}
        </div>
      )}

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
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </td>
              </tr>
            ) : words.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-[14px] text-muted-foreground">
                  No words in this collection yet.
                </td>
              </tr>
            ) : (
              words.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate('/vocabulary/' + item.id, { state: item })}
                  className="hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-[14px]">{item.word}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(item.word, item.language);
                        }}
                        className="w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Pronounce"
                      >
                        <Volume2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="text-[12px] text-muted-foreground">{item.pos}</div>
                  </td>
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
                      {item.nextReview || 'Not scheduled'}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent"
                    >
                      <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              {words.length > 0 ? (
                <>
                  The collection <strong className="font-semibold text-foreground">"{collection.name}"</strong> contains <strong className="font-semibold text-foreground">{words.length} words</strong>. 
                  <br />
                  <span className="text-destructive font-medium mt-2 block">
                    Please move or remove the words from this collection before deleting it.
                  </span>
                </>
              ) : (
                <>
                  Are you sure you want to delete the collection <strong className="font-semibold text-foreground">"{collection.name}"</strong>? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {deleteError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12px] text-destructive animate-in fade-in-50 duration-200">
              {deleteError}
            </div>
          )}

          <AlertDialogFooter>
            {words.length > 0 ? (
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium cursor-pointer"
              >
                Okay
              </button>
            ) : (
              <>
                <AlertDialogCancel disabled={isDeleting} onClick={() => setIsDeleteDialogOpen(false)} className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteConfirm();
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : 'Delete'}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
