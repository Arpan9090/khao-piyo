import React from 'react';
import { useStore } from '../context/StoreContext.jsx';

const Toast = () => {
  const { notice } = useStore();
  if (!notice) return null;

  return (
    <div
      role="status"
      className="animate-slide-down fixed bottom-5 left-1/2 z-60 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-bg shadow-2xl"
    >
      {notice}
    </div>
  );
};

export default Toast;