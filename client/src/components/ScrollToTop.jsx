import { useState, useEffect } from 'react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 md:bottom-14 md:right-8 z-40 
                     p-2 sm:p-2.5 md:p-3 bg-blue-600 hover:bg-blue-700 text-white 
                     rounded-full shadow-lg transition-all duration-300 ease-in-out 
                     transform hover:scale-110 focus:outline-none focus:ring-4 
                     focus:ring-blue-300 dark:focus:ring-blue-800 cursor-pointer"
          aria-label="Scroll to top"
        >
          <svg
            className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
