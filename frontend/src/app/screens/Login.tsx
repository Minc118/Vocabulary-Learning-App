import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router';
import { Loader2, BookOpen, Brain, Zap, Github, Sparkles } from 'lucide-react';

export function Login() {
  const { session, loading } = useAuth();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const showDebug = params.get('debugAuth') === '1';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleLogin = async () => {
    console.log("login clicked");
    console.log("supabase client present:", supabase !== null);
    setRedirectAttempted(true);

    if (!supabase) {
      console.warn("Cannot start redirect: Supabase client is null. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env variables.");
      return;
    }

    try {
      console.log("starting oauth redirect");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      console.log("oauth call returned error:", error !== null && error !== undefined);
      if (error) {
        console.error("OAuth error detail:", error.message);
      }
    } catch (err) {
      console.error("Uncaught OAuth redirect error:", err instanceof Error ? err.message : err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-zinc-200">
      {/* Navigation */}
      <nav className="w-full flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-zinc-50">
        <div className="flex items-center gap-3">
          <Sparkles className="w-[18px] h-[18px] text-zinc-800 flex-shrink-0" strokeWidth={1.5} />
          <span className="font-semibold text-[14px] tracking-wide text-zinc-900">Voca</span>
        </div>
        <div className="flex gap-4">
          <button onClick={handleGoogleLogin} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
            Log In / Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-24 text-center max-w-4xl mx-auto w-full">
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.1] mb-6 text-zinc-900">
          The quiet space for <br className="hidden md:block" />
          <span className="text-zinc-400">deep reading.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mb-12 font-light leading-relaxed">
          Voca transforms the words you encounter into a structured, personalized vocabulary system. Minimalist design. Spaced repetition. Seamless context.
        </p>

        {/* Product Visual Mockup (Vocabulary Card) */}
        <div className="w-full max-w-lg mt-16 p-8 bg-zinc-50 border border-zinc-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-left transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">lemma</span>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 mt-1">ephemeral</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 border border-zinc-200 px-2 py-0.5 rounded">
              adjective
            </span>
          </div>
          
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">translation</span>
              <p className="text-sm text-zinc-800 mt-1 font-medium">短暂的，转瞬即逝的</p>
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">definition</span>
              <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                Lasting for a very short time; transient or fleeting in nature.
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">contextual example</span>
              <p className="text-sm italic text-zinc-600 mt-1 leading-relaxed border-l-2 border-zinc-200 pl-3">
                "Fame in the digital age is often <span className="underline decoration-zinc-400 underline-offset-4 font-semibold text-zinc-800">ephemeral</span>, fading as quickly as it rises."
              </p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-zinc-100">
              <span className="text-[11px] px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded font-medium">#B2_Reading</span>
              <span className="text-[11px] px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded font-medium">#Philosophy</span>
            </div>
          </div>
        </div>
      </main>

      {/* Methodology & Features */}
      <section className="w-full bg-zinc-50 border-t border-zinc-100 py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-4">Methodological Approach</h2>
            <p className="text-zinc-500 font-light text-sm leading-relaxed">
              Voca is not a gamified toy. It is a tool designed to mirror the natural language acquisition process: discover in context, structural enrichment, and active retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm shrink-0">
                <BookOpen className="w-4 h-4 text-zinc-800" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-950 mb-1 tracking-tight">01 / Contextual Import</h3>
                <p className="text-zinc-500 font-light text-sm leading-relaxed">
                  Paste any article or excerpt you read. Voca processes the text, highligting vocabulary candidates while keeping the original context sentences. Learning words out of context is futile; we ensure you remember the exact paragraph they came from.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm shrink-0">
                <Brain className="w-4 h-4 text-zinc-800" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-950 mb-1 tracking-tight">02 / AI Enrichment</h3>
                <p className="text-zinc-500 font-light text-sm leading-relaxed">
                  Leveraging integrated AI models, the app instantly parses selected terms. It auto-generates phonetic spellings, parts of speech, synonyms, accurate definitions, and original contextual examples. No tedious typing required.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm shrink-0">
                <Zap className="w-4 h-4 text-zinc-800" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-950 mb-1 tracking-tight">03 / Active Recall</h3>
                <p className="text-zinc-500 font-light text-sm leading-relaxed">
                  Retain what you gather. Standard flashcard review sessions, multiple choice exercises, and spelling tests are dynamically scheduled using advanced spaced repetition logic to lock words into your long-term memory perfectly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Quote Callout */}
      <section className="w-full bg-white border-t border-zinc-100 py-24 px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">the voca paradigm</span>
          <p className="text-2xl md:text-3xl font-light text-zinc-900 leading-relaxed italic selection:bg-zinc-200">
            "Vocabulary is not a list to memorize. It is a network of reading moments, contexts, and reflections, visited at the perfect psychological interval."
          </p>
          <div className="w-8 h-px bg-zinc-200 mx-auto mt-6"></div>
        </div>
      </section>

      {/* Bottom CTA Block */}
      <section className="w-full bg-zinc-50 border-t border-b border-zinc-100 py-20 px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">Start your deep reading journal.</h2>
          <p className="text-sm text-zinc-500 font-light max-w-sm mx-auto leading-relaxed">
            Connect your Google Account to begin capturing vocabulary, building collections, and reviewing in a quiet workspace.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleGoogleLogin}
              className="w-full max-w-xs h-12 bg-white text-zinc-800 border border-zinc-200 font-medium rounded-lg hover:bg-zinc-50 hover:border-zinc-300 active:bg-zinc-100 transition-all flex items-center justify-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-sm"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      {showDebug && (
        <div className="max-w-2xl mx-auto my-8 p-6 bg-zinc-50 border border-zinc-200 rounded-xl text-left font-mono text-xs space-y-3">
          <h3 className="font-bold text-sm text-zinc-800 border-b pb-2">Auth Diagnostic Panel (?debugAuth=1)</h3>
          <div>Current Pathname: {window.location.pathname}</div>
          <div>Auth State: {loading ? 'loading' : session ? 'authenticated' : 'unauthenticated'}</div>
          <div>Session Exists: {session ? 'true' : 'false'}</div>
          <div>Supabase Client: {supabase ? 'initialized' : 'null'}</div>
          <div>Supabase URL Env (VITE_SUPABASE_URL): {import.meta.env.VITE_SUPABASE_URL ? 'present' : 'missing'}</div>
          <div>Supabase Anon Key Env (VITE_SUPABASE_ANON_KEY): {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'present' : 'missing'}</div>
          <div>API Base URL Env (VITE_API_BASE_URL): {import.meta.env.VITE_API_BASE_URL ? 'present (using custom)' : 'missing (using default)'}</div>
          <div>Login Redirect Attempted: {redirectAttempted ? 'true' : 'false'}</div>
        </div>
      )}

      <footer className="w-full py-12 px-8 flex items-center justify-between text-xs text-zinc-400 max-w-7xl mx-auto">
        <div>&copy; 2026 Voca Systems. All rights reserved.</div>
        <div className="flex items-center gap-1 hover:text-zinc-600 transition-colors cursor-pointer">
          <Github className="w-4 h-4" />
          <span>Open Source</span>
        </div>
      </footer>
    </div>
  );
}
