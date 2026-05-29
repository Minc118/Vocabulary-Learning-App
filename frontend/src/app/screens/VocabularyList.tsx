import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router";
import { Plus, Filter, SlidersHorizontal, MoreVertical, Clock, Tag, Volume2, Edit2, Trash2, Loader2, Search } from 'lucide-react';
import { checkBackendConnection, fetchWords, deleteWord, type VocabularyWord } from '../../lib/api';
import { speakWord } from '../../lib/speech';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/ui/dropdown-menu';
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

export function VocabularyList() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionMessage, setConnectionMessage] = useState('Connecting to Flask vocabulary service...');
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Active filter & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedMastery, setSelectedMastery] = useState('All');

  // Compile unique lists for select dropdowns
  const availableLanguages = Array.from(new Set(words.map(w => w.language).filter(Boolean))).sort();
  const availableTags = Array.from(new Set(words.flatMap(w => w.tags || []).filter(Boolean))).sort();

  // Perform client-side filtering (including search query)
  const filteredWords = words.filter(item => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const wordMatch = item.word?.toLowerCase().includes(q);
      const transMatch = item.translation?.toLowerCase().includes(q);
      const ipaMatch = item.ipa?.toLowerCase().includes(q);
      const posMatch = item.pos?.toLowerCase().includes(q);
      if (!wordMatch && !transMatch && !ipaMatch && !posMatch) {
        return false;
      }
    }
    if (selectedLanguage !== 'All' && item.language !== selectedLanguage) {
      return false;
    }
    if (selectedTag !== 'All' && !(item.tags || []).includes(selectedTag)) {
      return false;
    }
    if (selectedMastery !== 'All') {
      const itemMastery = item.mastery || 'New';
      if (selectedMastery === 'New' && itemMastery !== 'New') {
        return false;
      }
      if (selectedMastery !== 'New' && itemMastery !== selectedMastery) {
        return false;
      }
    }
    return true;
  });

  // States for three-dot menu and delete confirmation
  const [wordToDelete, setWordToDelete] = useState<VocabularyWord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadWordsList = async () => {
    try {
      const items = await fetchWords();
      setWords(items);
      setLoadError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load words from backend';
      setLoadError(message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!wordToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteWord(wordToDelete.id);
      await loadWordsList();
      setWordToDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete word');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadWords = async () => {
      const connectionResult = await checkBackendConnection();

      if (!isMounted) return;

      setConnectionStatus(connectionResult.ok ? 'connected' : 'error');
      setConnectionMessage(connectionResult.message);

      if (!connectionResult.ok) {
        setLoadError(connectionResult.message);
        return;
      }

      try {
        const items = await fetchWords();
        if (!isMounted) return;
        setWords(items);
        setLoadError(null);
      } catch (error) {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : 'Failed to load words from backend';
        setConnectionStatus('error');
        setConnectionMessage(message);
        setLoadError(message);
      }
    };

    loadWords();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">Vocabulary Library</h1>
          <p className="text-muted-foreground text-[14px] mt-1 font-medium">Manage your personal word collection from the Flask REST service</p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                  : connectionStatus === 'error'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/50'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/50'
              }`}
            >
              {connectionStatus === 'connected'
                ? 'Backend Connected'
                : connectionStatus === 'error'
                ? 'Backend Error'
                : 'Checking Backend'}
            </span>
            <span className="text-[12px] text-muted-foreground font-medium">{connectionMessage}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/vocabulary/new')}
          className="h-10 px-5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all text-[14.5px] font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-primary/5 active:scale-[0.98]"
        >
          <Plus className="w-4.5 h-4.5" strokeWidth={2.5} />
          Add Word
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card border border-border p-4.5 rounded-2xl shadow-sm">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search words, meanings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent rounded-lg text-[13px] placeholder:text-muted-foreground focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all duration-200"
            />
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-border/40 hover:border-border rounded-lg px-3 py-1.5 text-[13px] transition-colors">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-muted-foreground font-medium">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer pr-1 font-semibold text-foreground dark:bg-card"
            >
              <option value="All">All</option>
              {availableLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-border/40 hover:border-border rounded-lg px-3 py-1.5 text-[13px] transition-colors">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-muted-foreground font-medium">Tag:</span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer pr-1 font-semibold text-foreground dark:bg-card"
            >
              <option value="All">All</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Mastery Filter */}
          <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-border/40 hover:border-border rounded-lg px-3 py-1.5 text-[13px] transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-muted-foreground font-medium">Mastery:</span>
            <select
              value={selectedMastery}
              onChange={(e) => setSelectedMastery(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer pr-1 font-semibold text-foreground dark:bg-card"
            >
              <option value="All">All</option>
              <option value="New">New</option>
              <option value="Learning">Learning</option>
              <option value="Familiar">Familiar</option>
              <option value="Mastered">Mastered</option>
            </select>
          </div>

          {/* Reset Button */}
          {(selectedLanguage !== 'All' || selectedTag !== 'All' || selectedMastery !== 'All' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedLanguage('All');
                setSelectedTag('All');
                setSelectedMastery('All');
                setSearchQuery('');
              }}
              className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[12.5px] font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
        <div className="text-[13px] text-muted-foreground font-medium shrink-0">
          Showing <span className="font-bold text-slate-850 dark:text-slate-100">{filteredWords.length}</span> of {words.length} words
        </div>
      </div>

      {loadError && (
        <div className="rounded-xl border border-rose-200/50 bg-rose-50 px-4 py-3.5 text-[13.5px] text-rose-700">
          <div className="font-semibold">Unable to load vocabulary data</div>
          <div className="mt-1 text-[12.5px] text-rose-600/90 font-medium">Start the Flask backend and refresh this page. ({loadError})</div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-border/80">
              <tr>
                <th className="text-left px-6 py-3.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Word
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Translation
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Language
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Tags
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Next Review
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Mastery
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {filteredWords.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate('/vocabulary/' + item.id, { state: item })}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[15px] text-foreground group-hover:text-primary transition-colors">{item.word}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(item.word, item.language);
                        }}
                        className="w-5.5 h-5.5 inline-flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors"
                        title="Pronounce"
                      >
                        <Volume2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5 font-medium">
                      <span className="italic font-semibold text-slate-400">{item.pos || 'Unknown'}</span>
                      {item.ipa ? ` • /${item.ipa.replace(/^\/|\/$/g, '')}/` : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-slate-700 dark:text-slate-300 font-medium">{item.translation}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11.5px] font-semibold text-slate-600 dark:text-slate-300">
                      {item.language}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(item.tags || []).map((tag, j) => (
                        <span
                          key={j}
                          className="px-2 py-0.5 bg-primary/5 text-primary rounded text-[11px] font-semibold border border-primary/5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                      <span>{item.nextReview}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                        item.mastery === 'Mastered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                          : item.mastery === 'Familiar'
                          ? 'bg-blue-50 text-blue-700 border-blue-200/50'
                          : 'bg-orange-50 text-orange-700 border-orange-200/50'
                      }`}
                    >
                      {item.mastery}
                    </span>
                  </td>
                  <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/vocabulary/' + item.id, { state: { ...item, isDirectEditing: true } });
                          }}
                          className="cursor-pointer flex items-center gap-2 text-[13px] font-medium"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteError(null);
                            setWordToDelete(item);
                          }}
                          className="cursor-pointer flex items-center gap-2 text-[13px] font-medium text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {!loadError && filteredWords.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[14px] text-muted-foreground font-medium">
                    {words.length === 0 
                      ? "Waiting for data from the Flask service..." 
                      : "No words match your filters or search query."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={wordToDelete !== null} onOpenChange={(open) => !open && setWordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Word</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the word <strong className="font-semibold text-foreground">"{wordToDelete?.word}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {deleteError && (
            <div className="rounded-lg border border-rose-200/50 bg-rose-50 px-3 py-2 text-[12.5px] text-rose-700 animate-in fade-in-50 duration-200 font-medium">
              {deleteError}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setWordToDelete(null)} className="cursor-pointer">
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
