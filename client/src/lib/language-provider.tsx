import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Language = "ar" | "en";

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
}

interface LanguageProviderState {
  language: Language;
  setLanguage: (language: Language) => void;
  isRTL: boolean;
}

const initialState: LanguageProviderState = {
  language: "ar",
  setLanguage: () => null,
  isRTL: true,
};

const LanguageProviderContext = createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = "ar",
  storageKey = "softlix-language",
  ...props
}: LanguageProviderProps) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage
  );

  const isRTL = language === "ar";

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("dir", isRTL ? "rtl" : "ltr");
    root.setAttribute("lang", language);
    i18n.changeLanguage(language);
  }, [language, isRTL, i18n]);

  const setLanguage = (newLanguage: Language) => {
    localStorage.setItem(storageKey, newLanguage);
    setLanguageState(newLanguage);
  };

  const value = {
    language,
    setLanguage,
    isRTL,
  };

  return (
    <LanguageProviderContext.Provider {...props} value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);

  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider");

  return context;
};
