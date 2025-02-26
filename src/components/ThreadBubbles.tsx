import React, { useState, useEffect } from 'react';
import { Thread, CourseType } from './types';
import { Check, Filter, X } from 'lucide-react';

interface ThreadBubblesProps {
  filters: Thread[];
  handleFilterChange: (thread: Thread) => void;
  darkMode: boolean;
  COLORS: Record<string, any>;
}

const ThreadBubbles: React.FC<ThreadBubblesProps> = ({
  filters,
  handleFilterChange,
  darkMode,
  COLORS
}) => {
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [hoveredThread, setHoveredThread] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Create thread objects from COLORS keys
  const displayThreads = Object.keys(COLORS)
    .filter(threadName => threadName !== 'required')
    .map(threadName => {
      const matchingThread = filters.find(t => t.name === threadName);
      return matchingThread || {
        name: threadName as CourseType,
        formalName: threadName.charAt(0).toUpperCase() + threadName.slice(1),
        show: false,
        theme: COLORS[threadName]
      };
    });
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on initial load
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const getThreadStyle = (thread: Thread) => {
    const isSelected = filters.some(t => t.name === thread.name && t.show);
    const isHovered = hoveredThread === thread.name;
    const colorScheme = COLORS[thread.name];
    
    if (isSelected) {
      return {
        background: darkMode ? colorScheme.dark.bg : colorScheme.light.bg,
        color: darkMode ? colorScheme.dark.text : colorScheme.light.text,
        border: `2px solid ${darkMode ? colorScheme.dark.bg : colorScheme.light.bg}`,
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      };
    } else {
      return {
        background: 'transparent',
        color: darkMode ? '#e5e7eb' : '#4b5563',
        border: `2px solid ${darkMode ? colorScheme.dark.bg : colorScheme.light.bg}`,
        opacity: isHovered ? 1 : 0.7,
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      };
    }
  };

  return (
    <div className="thread-bubbles">
      {/* Filter toggle button - always on the right for both mobile and desktop */}
      <button
        onClick={() => setShowFiltersPanel(!showFiltersPanel)}
        className={`fixed top-20 right-4 z-40 p-3 rounded-full shadow-lg touch-target
          ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}
          ${showFiltersPanel ? 'rotate-180' : ''} 
          transition-all duration-300 animate-fadeIn`}
        aria-label="Toggle thread filters"
      >
        {showFiltersPanel ? (
          <X className="w-5 h-5" />
        ) : (
          <Filter className="w-5 h-5" />
        )}
      </button>

      {/* Desktop filter panel */}
      <div 
        className={`fixed top-20 right-16 z-30 p-4 rounded-lg shadow-lg max-w-xs
          ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}
          transition-all duration-300 animate-fadeIn hidden md:block
          ${showFiltersPanel ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Thread Filters</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {displayThreads.map((thread) => (
            <button
              key={thread.name}
              onClick={() => handleFilterChange(thread)}
              onMouseEnter={() => setHoveredThread(thread.name)}
              onMouseLeave={() => setHoveredThread(null)}
              className="flex items-center justify-between p-2 rounded-md filter-item transition-all duration-200"
              style={getThreadStyle(thread)}
            >
              <span className="capitalize">{thread.formalName}</span>
              {filters.some(t => t.name === thread.name && t.show) && (
                <Check className="w-4 h-4 ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile filter panel */}
      <div 
        className={`fixed inset-x-0 bottom-16 z-30 p-4 rounded-t-lg shadow-lg
          ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}
          transition-all duration-300 md:hidden
          ${showFiltersPanel ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-y-full'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Thread Filters</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {displayThreads.map((thread) => (
            <button
              key={thread.name}
              onClick={() => handleFilterChange(thread)}
              onTouchStart={() => setHoveredThread(thread.name)}
              onTouchEnd={() => setHoveredThread(null)}
              className="flex items-center justify-between p-2 rounded-md filter-item transition-all duration-200"
              style={getThreadStyle(thread)}
            >
              <span className="capitalize">{thread.formalName}</span>
              {filters.some(t => t.name === thread.name && t.show) && (
                <Check className="w-4 h-4 ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreadBubbles; 