
import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string }[] = [
    { code: 'pt', name: t('lang.pt') },
    { code: 'fr', name: t('lang.fr') },
    { code: 'en', name: t('lang.en') }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm">
        <Globe className="h-5 w-5 text-brand-blue" />
        <span className="text-sm font-medium">{languages.find(lang => lang.code === language)?.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${language === lang.code ? 'bg-gray-100 font-medium' : ''}`}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
