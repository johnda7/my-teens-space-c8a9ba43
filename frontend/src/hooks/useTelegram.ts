import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export const useTelegram = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Проверяем доступность Telegram WebApp
    if (WebApp.initDataUnsafe?.user) {
      setUser(WebApp.initDataUnsafe.user as TelegramUser);
      setIsReady(true);
    } else {
      // Для разработки вне Telegram
      console.warn('Telegram WebApp не доступен. Используйте тестовый режим.');
      setIsReady(true);
    }
  }, []);

  // Методы для работы с Telegram UI
  const showMainButton = (text: string, onClick: () => void) => {
    WebApp.MainButton.setText(text);
    WebApp.MainButton.onClick(onClick);
    WebApp.MainButton.show();
  };

  const hideMainButton = () => {
    WebApp.MainButton.hide();
  };

  const showBackButton = (onClick: () => void) => {
    WebApp.BackButton.onClick(onClick);
    WebApp.BackButton.show();
  };

  const hideBackButton = () => {
    WebApp.BackButton.hide();
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (WebApp.HapticFeedback) {
      switch (type) {
        case 'light':
          WebApp.HapticFeedback.impactOccurred('light');
          break;
        case 'medium':
          WebApp.HapticFeedback.impactOccurred('medium');
          break;
        case 'heavy':
          WebApp.HapticFeedback.impactOccurred('heavy');
          break;
        case 'rigid':
          WebApp.HapticFeedback.impactOccurred('rigid');
          break;
        case 'soft':
          WebApp.HapticFeedback.impactOccurred('soft');
          break;
      }
    }
  };

  const notificationFeedback = (type: 'error' | 'success' | 'warning') => {
    if (WebApp.HapticFeedback) {
      WebApp.HapticFeedback.notificationOccurred(type);
    }
  };

  const close = () => {
    WebApp.close();
  };

  const openLink = (url: string) => {
    WebApp.openLink(url);
  };

  const openTelegramLink = (url: string) => {
    WebApp.openTelegramLink(url);
  };

  return {
    user,
    isReady,
    initData: WebApp.initData,
    initDataUnsafe: WebApp.initDataUnsafe,
    themeParams: WebApp.themeParams,
    colorScheme: WebApp.colorScheme,
    showMainButton,
    hideMainButton,
    showBackButton,
  };
};

