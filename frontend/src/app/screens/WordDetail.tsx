import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Edit2, Trash2, Tag, FolderOpen, Clock, TrendingUp, Loader2, Volume2 } from 'lucide-react';
import { fetchWordById, updateWord, deleteWord, type VocabularyWord } from '../../lib/api';
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

interface WordDetailProps {
  data?: Partial<VocabularyWord>;
}

export function WordDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  
  const initialWord: VocabularyWord = {
    id: data?.id ?? '',
    word: '...',
    ipa: '',
    translation: '...',
    pos: 'noun',
    language: 'English',
    tags: [],
    nextReview: 'Today',
    mastery: 'Learning',
    definition: '',
    examples: [],
    collocations: [],
    synonyms: [],
    relatedWords: [],
    collection: '',
    source: '',
    addedAt: '',
    reviewCount: 0,
  };

  const [word, setWord] = useState<VocabularyWord>({ ...initialWord, ...data });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(data?.id));
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<VocabularyWord>>({});
  const [isSaving, setIsSaving] = useState(false);

  // AlertDialog state for deletion
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!data?.id) {
      setWord((current) => ({ ...current, ...data }));
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadWord = async () => {
      try {
        const result = await fetchWordById(data.id);
        if (!isMounted) return;
        
        // Ensure defaults for arrays to prevent mapping errors
        const safeResult = {
          ...result,
          tags: Array.isArray(result.tags) ? result.tags : [],
          examples: Array.isArray(result.examples) ? result.examples : [],
          collocations: Array.isArray(result.collocations) ? result.collocations : [],
          synonyms: Array.isArray(result.synonyms) ? result.synonyms : [],
          relatedWords: Array.isArray(result.relatedWords) ? result.relatedWords : [],
        };
        
        setWord(safeResult);
        setLoadError(null);

        // Auto-enter edit mode if navigating from Edit menu
        if (data.isDirectEditing) {
          setEditForm({
            word: safeResult.word,
            ipa: safeResult.ipa || '',
            translation: safeResult.translation,
            pos: safeResult.pos,
            language: safeResult.language,
            definition: safeResult.definition
          });
          setIsEditing(true);
        }
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Failed to load word details');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadWord();

    return () => {
      isMounted = false;
    };
  }, [data]);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!word.id) return;
    setIsDeleting(true);
    setLoadError(null);
    try {
      await deleteWord(word.id);
      setIsDeleteDialogOpen(false);
      navigate('/vocabulary');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to delete word');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = () => {
    setEditForm({
      word: word.word,
      ipa: word.ipa || '',
      translation: word.translation,
      pos: word.pos,
      language: word.language,
      definition: word.definition
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!word.id) return;
    setIsSaving(true);
    setLoadError(null);
    try {
      const updated = await updateWord(word.id, editForm);
      // Backend returns full word including relation IDs, but we might need to map it properly or just fetch again.
      // Easiest is to update the simple fields locally and re-fetch to be safe.
      setWord(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to update word');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate('/vocabulary')}
          className="flex items-center gap-2 text-[13.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Back to Library
        </button>

        {(isLoading || loadError) && (
          <div
            className={`rounded-xl border px-4 py-3 text-[13.5px] font-medium ${
              loadError
                ? 'border-rose-200/50 bg-rose-50 text-rose-700'
                : 'border-border bg-slate-50 text-muted-foreground animate-pulse'
            }`}
          >
            {loadError || 'Loading word details from the Flask service...'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Content Card (Left / Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1 space-y-3">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">Word</label>
                      <input 
                        value={editForm.word || ''}
                        onChange={e => setEditForm({ ...editForm, word: e.target.value })}
                        className="text-[24px] font-bold w-full bg-slate-50 dark:bg-slate-800/50 border border-border/80 focus:border-primary/20 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                        placeholder="Word"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">IPA Phonetic Key</label>
                      <input 
                        value={editForm.ipa || ''}
                        onChange={e => setEditForm({ ...editForm, ipa: e.target.value })}
                        className="text-[14px] font-mono w-full bg-slate-50 dark:bg-slate-800/50 border border-border/80 focus:border-primary/20 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                        placeholder="IPA / Phonetic (e.g. /ˈtrɪɡər/)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[12px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">Part of Speech</label>
                        <input 
                          value={editForm.pos || ''}
                          onChange={e => setEditForm({ ...editForm, pos: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-border/80 focus:border-primary/20 rounded-xl px-3 py-1.5 text-[13.5px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                          placeholder="e.g. Noun"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">Language</label>
                        <input 
                          value={editForm.language || ''}
                          onChange={e => setEditForm({ ...editForm, language: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-border/80 focus:border-primary/20 rounded-xl px-3 py-1.5 text-[13.5px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                          placeholder="Language"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">Translation</label>
                      <input 
                        value={editForm.translation || ''}
                        onChange={e => setEditForm({ ...editForm, translation: e.target.value })}
                        className="text-[16px] font-semibold w-full bg-slate-50 dark:bg-slate-800/50 border border-border/80 focus:border-primary/20 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                        placeholder="Translation"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-[34px] font-bold tracking-tight text-foreground leading-none">{word.word}</h2>
                      <button
                        onClick={() => speakWord(word.word, word.language)}
                        className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                        title="Pronounce"
                      >
                        <Volume2 className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                    </div>
                    {word.ipa && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/5 border border-primary/10 rounded-md font-mono text-[13px] text-primary">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">IPA:</span>
                        <span>/{word.ipa.replace(/^\/|\/$/g, '')}/</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1.5">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[12.5px] font-semibold text-slate-600 dark:text-slate-300 border border-border/40">
                        {word.pos || 'Unknown'}
                      </span>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[12.5px] text-slate-600 dark:text-slate-300 font-semibold border border-border/40">
                        {word.language}
                      </span>
                    </div>
                    <div className="text-[18px] font-bold text-slate-850 dark:text-slate-100 mt-2">{word.translation}</div>
                  </>
                )}
              </div>

              {/* Actions Header buttons */}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-slate-50 font-semibold transition-colors text-[13px] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="px-3.5 h-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-colors text-[13px] disabled:opacity-50 cursor-pointer shadow-md shadow-primary/5 active:scale-95"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleEditClick} 
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Edit Word"
                  >
                    <Edit2 className="w-4.5 h-4.5" strokeWidth={1.5} />
                  </button>
                )}
                {!isEditing && (
                  <button 
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-rose-50 hover:text-rose-600 text-slate-450 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Delete Word"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4.5 h-4.5" strokeWidth={1.5} />}
                  </button>
                )}
              </div>
            </div>

            {/* Structured Word Fields */}
            <div className="space-y-6 pt-4 border-t border-border/80">
              {isEditing ? (
                <div className="space-y-2">
                  <label className="block text-[12px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Definition</label>
                  <textarea 
                    value={editForm.definition || ''}
                    onChange={e => setEditForm({ ...editForm, definition: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl p-3 text-[14px] leading-relaxed focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all min-h-[100px]"
                    placeholder="Enter core dictionary definition..."
                  />
                </div>
              ) : word.definition && (
                <div className="space-y-2">
                  <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Definition</h3>
                  <p className="text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 font-medium">{word.definition}</p>
                </div>
              )}

              {word.examples && word.examples.length > 0 && (
                <div className="space-y-3.5">
                  <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Example Sentences</h3>
                  <div className="space-y-3.5">
                    {word.examples.map((example, index) => (
                      <div key={index} className="pl-4.5 border-l-3 border-teal-500/40 space-y-1">
                        <div className="text-[15px] leading-relaxed font-medium text-slate-900 dark:text-white">{example.sentence}</div>
                        {example.translation && (
                          <div className="text-[13.5px] text-muted-foreground font-medium">{example.translation}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {word.collocations && word.collocations.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Common Collocations</h3>
                  <div className="flex flex-wrap gap-2">
                    {word.collocations.map((item, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[13.5px] font-semibold text-slate-700 dark:text-slate-300 border border-border/40">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {word.synonyms && word.synonyms.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {word.synonyms.map((item, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[13.5px] font-semibold text-slate-700 dark:text-slate-300 border border-border/40">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {word.relatedWords && word.relatedWords.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Related Words</h3>
                    <div className="flex flex-wrap gap-2">
                      {word.relatedWords.map((item, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[13.5px] font-semibold text-slate-700 dark:text-slate-300 border border-border/40">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info Cards (Right / Span 1) */}
        <div className="space-y-6">
          {/* Learning Status Widget */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-[15px] text-foreground">Learning Performance</h3>
            <div className="space-y-4.5 pt-1.5">
              <div>
                <div className="flex items-center justify-between text-[13px] font-semibold text-slate-500 mb-2">
                  <span>Mastery Level</span>
                  <span className="text-primary font-bold">{word.mastery || 'Learning'}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      word.mastery === 'Mastered'
                        ? 'bg-emerald-500 w-full'
                        : word.mastery === 'Familiar'
                        ? 'bg-blue-500 w-2/3'
                        : 'bg-teal-500 w-1/3'
                    }`}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1 border-t border-border/60">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground font-semibold">Next Scheduled Review</div>
                  <div className="text-[13.5px] font-bold text-foreground mt-0.5">{word.nextReview || 'Not scheduled'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground font-semibold">Total Review Count</div>
                  <div className="text-[13.5px] font-bold text-foreground mt-0.5">{word.reviewCount || 0} times</div>
                </div>
              </div>
            </div>
          </div>

          {/* Organization Widget */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-[15px] text-foreground">Organization</h3>
            <div className="space-y-4 pt-1">
              {word.collection && (
                <div>
                  <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    <FolderOpen className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                    Collection
                  </div>
                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[13.5px] font-semibold text-slate-700 dark:text-slate-300 border border-border/40">
                    {word.collection}
                  </div>
                </div>
              )}

              {word.tags && word.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    <Tag className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(word.tags || []).map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-primary/5 text-primary rounded-lg text-[11.5px] font-semibold border border-primary/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Context Origin Widget */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3.5">
            <h3 className="font-bold text-[15px] text-foreground">Origin</h3>
            <div className="pt-1.5 space-y-3 text-[13px] font-semibold text-slate-700 dark:text-slate-350">
              <div>
                <span className="text-muted-foreground block text-[11.5px] mb-0.5">Source Material</span>
                <span className="text-[13.5px] text-foreground">{word.source || 'Manual input'}</span>
              </div>
              {word.addedAt && (
                <div>
                  <span className="text-muted-foreground block text-[11.5px] mb-0.5">Created At</span>
                  <span className="text-[13.5px] text-foreground">{new Date(word.addedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Word</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the word <strong className="font-semibold text-foreground">"{word.word}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setIsDeleteDialogOpen(false)} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white cursor-pointer font-semibold"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
