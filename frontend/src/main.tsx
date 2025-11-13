import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import WebApp from '@twa-dev/sdk';

// Инициализация Telegram WebApp
WebApp.ready();
WebApp.expand();

createRoot(document.getElementById("root")!).render(<App />);
