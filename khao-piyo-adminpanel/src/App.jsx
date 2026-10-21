import React from 'react';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import SignOutButton from './components/SignOutButton';
import Dashboard from './pages/Dashboard';
import FoodManage from './pages/FoodManage';
import Orders from './pages/Orders';
import Login from './pages/Login';

const NotAdmin = () => (
  <div className="grid min-h-screen place-items-center bg-gray-50 p-4 text-center dark:bg-gray-900">
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Admins only</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        This account does not have admin access. Sign in with an admin account.
      </p>
      <SignOutButton className="mt-6" />
    </div>
  </div>
);

const AdminShell = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Login />;
  if (!isAdmin) return <NotAdmin />;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/foods" element={<FoodManage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AdminShell />
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
    </AuthProvider>
  );
};

export default App;