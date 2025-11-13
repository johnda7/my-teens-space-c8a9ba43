import { useEffect, useState } from 'react';

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  colorScheme: 'light' | 'dark';
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isInTelegram, setIsInTelegram] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
      setIsInTelegram(true);

      // Apply Telegram theme
      if (tg.themeParams) {
        const root = document.documentElement;
        if (tg.themeParams.bg_color) {
          root.style.setProperty('--telegram-bg', tg.themeParams.bg_color);
        }
        if (tg.themeParams.text_color) {
          root.style.setProperty('--telegram-text', tg.themeParams.text_color);
        }
        if (tg.themeParams.button_color) {
          root.style.setProperty('--telegram-button', tg.themeParams.button_color);
        }
      }
    }
  }, []);

  const haptic = {
    light: () => webApp?.HapticFeedback.impactOccurred('light'),
    medium: () => webApp?.HapticFeedback.impactOccurred('medium'),
    heavy: () => webApp?.HapticFeedback.impactOccurred('heavy'),
    success: () => webApp?.HapticFeedback.notificationOccurred('success'),
    error: () => webApp?.HapticFeedback.notificationOccurred('error'),
    warning: () => webApp?.HapticFeedback.notificationOccurred('warning'),
    selection: () => webApp?.HapticFeedback.selectionChanged(),
  };

  return {
    webApp,
    isInTelegram,
    user: webApp?.initDataUnsafe.user,
    themeParams: webApp?.themeParams,
    colorScheme: webApp?.colorScheme,
    haptic,
  };
};
