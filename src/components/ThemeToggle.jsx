import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Verifica se o usuário já tem preferência salva
    if (localStorage.theme === 'dark') return true;
    if (localStorage.theme === 'light') return false;
    // Senão, segue o tema do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement; // <html>

    if (isDark) {
      root.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      root.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  return (
      <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        {isDark ? '☀️ Claro' : '🌙 Escuro'}
      </button>
  );
}