import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Инициализация Telegram WebApp через глобальный объект window
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

// Инициализация Telegram WebApp
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

createRoot(document.getElementById("root")!).render(<App />);
