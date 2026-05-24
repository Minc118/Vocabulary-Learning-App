export function getLangCode(language?: string): string {
  if (!language) return 'en-US';
  const lang = language.toLowerCase().trim();
  
  if (lang.includes('german') || lang.includes('deutsch') || lang === 'de') {
    return 'de-DE';
  }
  if (lang.includes('english') || lang.includes('englisch') || lang === 'en') {
    return 'en-US';
  }
  if (lang.includes('chinese') || lang.includes('中文') || lang === 'zh') {
    return 'zh-CN';
  }
  if (lang.includes('french') || lang.includes('französisch') || lang === 'fr') {
    return 'fr-FR';
  }
  if (lang.includes('spanish') || lang.includes('spanisch') || lang === 'es') {
    return 'es-ES';
  }
  return 'en-US'; // Fallback
}

export function speakWord(word: string, language?: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  try {
    // Cancel currently playing speech before starting new speech
    window.speechSynthesis.cancel();

    if (!word || !word.trim()) return;

    const utterance = new SpeechSynthesisUtterance(word.trim());
    utterance.lang = getLangCode(language);
    
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Error in speakWord:', e);
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis;
}
