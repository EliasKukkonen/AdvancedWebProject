import React from 'react';
import { useTranslation } from 'react-i18next';

// A simple language switcher component that allows users to change the app's language

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    // Container with styling to arrange buttons.
    <div style={{ display: 'flex', gap: '8px', margin: '1rem 0', justifyContent: 'center' }}>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('fi')}>Finnish</button>
    </div>
  );
};

export default LanguageSwitcher;