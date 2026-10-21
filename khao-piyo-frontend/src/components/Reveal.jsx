import React, { useEffect, useRef, useState } from 'react';

// Slides + fades children in once they scroll into view.
const Reveal = ({ children, className = '', delay = 0, from = 'up' }) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = from === 'left' ? '-translate-x-8' : from === 'right' ? 'translate-x-8' : 'translate-y-6';

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? 'translate-x-0 translate-y-0 opacity-100' : `opacity-0 ${hidden}`
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Reveal;
