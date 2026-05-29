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
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      <button
        onClick={() => navigate('/collections')}
        className="flex items-center gap-2 text-[13.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back to Collections
      </button>

      {/* Header Panel */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#002434] flex items-center justify-center flex-shrink-0 shadow-md shadow-black/10">
              <FolderOpen className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white leading-none">{collection.name}</h1>
              {collection.description && (
                <p className="text-[14px] text-muted-foreground leading-relaxed pt-1.5 font-medium">{collection.description}</p>
              )}
              <p className="text-slate-450 text-[13px] font-semibold pt-1">
                {isLoading ? 'Scanning collection...' : `${words.length} terms in total`}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/vocabulary/new', { state: { collectionName: collection.name } })}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-slate-50 text-slate-550 hover:text-slate-800 transition-colors cursor-pointer"
              title="Add Words"
            >
              <Plus className="w-4.5 h-4.5" strokeWidth={2} />
            </button>
            <button 
              onClick={handleDeleteClick}
              disabled={isDeleting || isLoading}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-rose-50 hover:text-rose-600 text-slate-450 transition-colors disabled:opacity-50 cursor-pointer"
              title="Delete Collection"
            >
              <Trash2 className="w-4.5 h-4.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/80">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4.5 border border-border/40">
            <div className="text-[12px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Total Words</div>
            <div className="text-[26px] font-bold text-foreground leading-none">{isLoading ? '—' : words.length}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4.5 border border-border/40">
            <div className="text-[12px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Mastered</div>
            <div className="text-[26px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">{isLoading ? '—' : masteredCount}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4.5 border border-border/40">
            <div className="text-[12px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Familiar</div>
            <div className="text-[26px] font-bold text-blue-600 dark:text-blue-400 leading-none">{isLoading ? '—' : familiarCount}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4.5 border border-border/40">
            <div className="text-[12px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider mb-1">Learning</div>
            <div className="text-[26px] font-bold text-orange-600 dark:text-orange-400 leading-none">{isLoading ? '—' : learningCount}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <h2 className="font-bold text-[18px] text-foreground">Words in Collection</h2>
        <button
          onClick={() => navigate('/vocabulary/new', { state: { collectionName: collection.name } })}
          className="h-9 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-[#0a3346] transition-all text-[13px] flex items-center gap-2 cursor-pointer shadow-md shadow-primary/5 active:scale-95"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Add Words</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200/50 bg-rose-50 px-4 py-3 text-[13.5px] font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* Library Table Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 dark:bg-slate-800/35 border-b border-border">
              <tr>
                <th className="text-left px-6 py-3.5 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Word
                </th>
                <th className="text-left px-6 py-3.5 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Translation
                </th>
                <th className="text-left px-6 py-3.5 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Mastery
                </th>
                <th className="text-left px-6 py-3.5 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Next Review
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" strokeWidth={1.5} />
                    <p className="text-[13.5px] text-muted-foreground mt-2 font-medium">Scanning terms...</p>
                  </td>
                </tr>
              ) : words.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-[14px] text-muted-foreground font-medium bg-slate-50/20">
                    No words stored in this collection yet.
                  </td>
                </tr>
              ) : (
                words.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate('/vocabulary/' + item.id, { state: item })}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[15px] text-slate-900 dark:text-slate-100">{item.word}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(item.word, item.language);
                          }}
                          className="w-6.5 h-6.5 inline-flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="Pronounce"
                        >
                          <Volume2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                      {item.pos && (
                        <div className="text-[12px] text-slate-450 font-semibold mt-0.5">{item.pos}</div>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-[14px] font-semibold text-slate-800 dark:text-slate-200">
                      {item.translation}
                    </td>
                    <td className="px-6 py-4.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                          item.mastery === 'Mastered'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/10'
                            : item.mastery === 'Familiar'
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/10'
                            : 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/10'
                        }`}
                      >
                        {item.mastery}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-550">
                        <Clock className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                        <span>{item.nextReview || 'Not scheduled'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4.5">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-700 cursor-pointer"
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
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[19px] font-bold text-slate-900 dark:text-white">Delete Collection</AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] text-muted-foreground leading-relaxed">
              {words.length > 0 ? (
                <>
                  The collection <strong className="font-semibold text-slate-900 dark:text-white">"{collection.name}"</strong> currently contains <strong className="font-semibold text-slate-900 dark:text-white">{words.length} vocabulary words</strong>. 
                  <span className="text-rose-600 dark:text-rose-400 font-semibold mt-3.5 block bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl px-4 py-3 text-[13px]">
                    To safeguard your study metrics, you must move or remove the associated words from this collection before deleting it.
                  </span>
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete <strong className="font-semibold text-slate-900 dark:text-white">"{collection.name}"</strong>? This will delete the empty collection envelope and cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {deleteError && (
            <div className="rounded-xl border border-rose-200/50 bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700">
              {deleteError}
            </div>
          )}

          <AlertDialogFooter className="border-t border-border/80 pt-3.5 mt-2">
            {words.length > 0 ? (
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-xl text-[13.5px] cursor-pointer shadow-md shadow-primary/5"
              >
                Okay
              </button>
            ) : (
              <>
                <AlertDialogCancel disabled={isDeleting} onClick={() => setIsDeleteDialogOpen(false)} className="h-10 px-4.5 border border-border rounded-xl text-[13.5px] font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteConfirm();
                  }}
                  className="h-10 px-5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-[13.5px] cursor-pointer shadow-md shadow-rose-600/5"
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
