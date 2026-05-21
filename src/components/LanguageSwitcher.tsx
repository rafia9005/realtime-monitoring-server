import { Languages } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { Button } from './ui/button';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-4 left-4 z-50 rounded-full shadow-md w-12 h-12 bg-background/80 backdrop-blur-sm"
      onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
      title={t('languageSwitcher.tooltip')}
    >
      <Languages className="h-6 w-6 opacity-60" />
      <span className="sr-only">Toggle Language</span>
    </Button>
  );
}
