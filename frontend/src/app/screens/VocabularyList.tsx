import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router";
import { Plus, Filter, SlidersHorizontal, MoreVertical, Clock, Tag, Volume2, Edit2, Trash2, Loader2 } from 'lucide-react';
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
  const data = location.state;
  // 这三个状态分别表示：
  // 1. 后端连接状态
  // 2. 后端返回的业务数据
  // 3. 页面是否处于错误状态
  //
  // 这是前端接 API 时最典型的一组状态：
  // loading / success / error
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionMessage, setConnectionMessage] = useState('Connecting to Flask vocabulary service...');
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

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
    // isMounted 是一个很常见的小保护。
    // 如果组件已经卸载了，但异步请求才刚返回，就不要再 setState，
    // 否则在更复杂的项目里容易出现状态更新警告。
    let isMounted = true;

    const loadWords = async () => {
      // 第一步先检查后端服务本身是否可用。
      // 这样即使 /api/words 失败，你也能先知道是不是后端根本没启动。
      const connectionResult = await checkBackendConnection();

      if (!isMounted) return;

      setConnectionStatus(connectionResult.ok ? 'connected' : 'error');
      setConnectionMessage(connectionResult.message);

      if (!connectionResult.ok) {
        setLoadError(connectionResult.message);
        return;
      }

      try {
        // 第二步再拿真正的业务数据。
        const items = await fetchWords();
        if (!isMounted) return;
        setWords(items);
        setLoadError(null);
      } catch (error) {
        // 如果健康检查没问题，但业务接口请求失败，就在这里显示具体错误。
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
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-medium tracking-tight">Vocabulary</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Manage your personal word collection from the Flask REST service</p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                connectionStatus === 'connected'
                  ? 'bg-green-100 text-green-700'
                  : connectionStatus === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {connectionStatus === 'connected'
                ? 'Backend Connected'
                : connectionStatus === 'error'
                ? 'Backend Error'
                : 'Checking Backend'}
            </span>
            <span className="text-[12px] text-muted-foreground">{connectionMessage}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/vocabulary/new')}
          className="h-10 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Word
        </button>
      </div>

      {/* Filters */}
      {/* 这些筛选按钮目前还是 UI 占位。
          也就是说：作业演示里它们主要展示界面结构，
          还没有真正去对后端发筛选请求。 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3">
          <button className="h-9 px-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-[13px] flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
            Language: All
          </button>
          <button className="h-9 px-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-[13px] flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
            Tags: All
          </button>
          <button className="h-9 px-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-[13px] flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
            Mastery: All
          </button>
        </div>
        <div className="text-[13px] text-muted-foreground">{words.length} words</div>
      </div>

      {loadError && (
        // 这是页面级错误提示。
        // 好处是用户不用打开浏览器控制台，也知道问题出在哪里。
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          Unable to load vocabulary data. Start the Flask backend and refresh this page.
          <div className="mt-1 text-[12px] text-destructive/80">{loadError}</div>
        </div>
      )}

      {/* Table */}
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
                Language
              </th>
              <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                Tags
              </th>
              <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                Next Review
              </th>
              <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                Mastery
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {words.map((item) => (
              <tr
                key={item.id}
                // 点击一行后，前端把该词对象作为页面参数带去详情页。
                // 当前项目没有用 react-router，所以这里还是项目原本的“手动切页”模式。
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
                      className="w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors translate-y-[1.5px]"
                      title="Pronounce"
                    >
                      <Volume2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="text-[12px] text-muted-foreground">{item.pos}</div>
                </td>
                <td className="px-6 py-4 text-[14px]">{item.translation}</td>
                <td className="px-6 py-4 text-[14px]">{item.language}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1.5">
                    {(item.tags || []).map((tag, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[11px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[13px]">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                    {item.nextReview}
                  </div>
                </td>
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
                <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/vocabulary/' + item.id, { state: { ...item, isDirectEditing: true } });
                        }}
                        className="cursor-pointer flex items-center gap-2"
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
                        className="cursor-pointer flex items-center gap-2 text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {!loadError && words.length === 0 && (
              // 空态提示：常见于“请求尚未返回”或“后端返回空列表”。
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-[14px] text-muted-foreground">
                  Waiting for data from the Flask service...
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12px] text-destructive animate-in fade-in-50 duration-200">
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
                e.preventDefault(); // Keep modal open to show backend error if deletion fails
                handleDeleteConfirm();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
