import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { TopBar } from './components/TopBar';
import { Dashboard } from './screens/Dashboard';
import { VocabularyList } from './screens/VocabularyList';
import { AddWord } from './screens/AddWord';
import { WordDetail } from './screens/WordDetail';
import { ImportHub } from './screens/ImportHub';
import { ImportStep1 } from './screens/ImportStep1';
import { ImportStep2 } from './screens/ImportStep2';
import { ImportStep3 } from './screens/ImportStep3';
import { ReviewHub } from './screens/ReviewHub';
import { ReviewSession } from './screens/ReviewSession';
import { ReviewResult } from './screens/ReviewResult';
import { CollectionsHub } from './screens/CollectionsHub';
import { CollectionDetail } from './screens/CollectionDetail';
import { Statistics } from './screens/Statistics';
import { Settings } from './screens/Settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageData, setPageData] = useState<any>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    setPageData(data);
  };

  const handleToggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'vocabulary':
        return <VocabularyList onNavigate={handleNavigate} />;
      case 'add-word':
        return <AddWord onNavigate={handleNavigate} />;
      case 'word-detail':
        return <WordDetail onNavigate={handleNavigate} data={pageData} />;
      case 'import':
        return <ImportHub onNavigate={handleNavigate} />;
      case 'import-step1':
        return <ImportStep1 onNavigate={handleNavigate} />;
      case 'import-step2':
        return <ImportStep2 onNavigate={handleNavigate} />;
      case 'import-step3':
        return <ImportStep3 onNavigate={handleNavigate} />;
      case 'review':
        return <ReviewHub onNavigate={handleNavigate} />;
      case 'review-session':
        return <ReviewSession onNavigate={handleNavigate} />;
      case 'review-result':
        return <ReviewResult onNavigate={handleNavigate} />;
      case 'collections':
        return <CollectionsHub onNavigate={handleNavigate} />;
      case 'collection-detail':
        return <CollectionDetail onNavigate={handleNavigate} data={pageData} />;
      case 'statistics':
        return <Statistics onNavigate={handleNavigate} />;
      case 'settings':
        return <Settings onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  const isReviewSession = currentPage === 'review-session';

  return (
    <div className="size-full bg-background">
      {!isReviewSession && (
        <>
          <Navigation
            currentPage={currentPage}
            onNavigate={handleNavigate}
            isCollapsed={isNavCollapsed}
            onToggleCollapse={handleToggleNav}
          />
          <TopBar isNavCollapsed={isNavCollapsed} />
        </>
      )}
      <main className={isReviewSession ? '' : `${isNavCollapsed ? 'ml-16' : 'ml-56'} mt-16 transition-all duration-300`}>
        {renderPage()}
      </main>
    </div>
  );
}