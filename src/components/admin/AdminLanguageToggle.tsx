
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export type AdminLanguage = 'ko' | 'en';

interface AdminLanguageToggleProps {
  value?: AdminLanguage;
  onChange?: (lang: AdminLanguage) => void;
}

export default function AdminLanguageToggle({ value, onChange }: AdminLanguageToggleProps) {
  const [language, setLanguage] = useState<AdminLanguage>(value || 'ko');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_language') as AdminLanguage;
      if (saved) setLanguage(saved);
    }
  }, []);

  const handleChange = (lang: AdminLanguage) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_language', lang);
    }
    onChange?.(lang);
  };

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant={language === 'ko' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleChange('ko')}
        className="h-8 px-3 text-xs"
      >
        🇰🇷 KR
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleChange('en')}
        className="h-8 px-3 text-xs"
      >
        🇺🇸 EN
      </Button>
    </div>
  );
}

export function useAdminLanguage() {
  const [language, setLanguage] = useState<AdminLanguage>('ko');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_language') as AdminLanguage;
      if (saved) setLanguage(saved);
    }
  }, []);

  return { language, setLanguage };
}
