import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignOutButton = ({ className = '' }) => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <button
      onClick={logout}
      title={user.email}
      className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 active:scale-95 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 ${className}`}
    >
      <LogOut className="h-4 w-4" /> Sign out
    </button>
  );
};

export default SignOutButton;