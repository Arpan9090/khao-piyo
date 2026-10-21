import { useState, useEffect } from 'react';
import { Menu, Sun, Moon, UserCircle } from 'lucide-react';

export default function Navbar({ setSidebarOpen }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 md:pl-70">
      <button onClick={() => setSidebarOpen(prev => !prev)} className="p-2 text-gray-600 dark:text-gray-300 rounded-lg md:hidden hover:bg-gray-100 dark:hover:bg-gray-700">
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-4 ml-auto">
        <button
          onClick={() => setDarkMode(prev => !prev)}
          className="p-2 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
        </button>

        <div className="flex items-center gap-2 border-l pl-4 border-gray-200 dark:border-gray-700">
          <UserCircle size={32} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden sm:inline">Admin User</span>
        </div>
      </div>
    </header>
  );
}