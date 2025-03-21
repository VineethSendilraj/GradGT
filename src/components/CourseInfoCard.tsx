import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CourseEnrollmentData } from '@/lib/api';
import { CourseType } from './types';

interface Course {
  id: string;
  name: string;
  short_name: string;
  x: number;
  y: number;
  threads: string[];
}

// Define a color scheme type
type ColorScheme = {
  [K in string]: {
    light: {
      bg: string;
      text: string;
      textSecondary: string;
    };
    dark: {
      bg: string;
      text: string;
      textSecondary: string;
    };
  };
};

interface CourseInfoCardProps {
  course: Course;
  enrollmentData: CourseEnrollmentData | null;
  isLoading: boolean;
  darkMode: boolean;
  isMobile: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  COLORS?: ColorScheme; // Make the COLORS prop optional
}

const CourseInfoCard: React.FC<CourseInfoCardProps> = ({
  course,
  enrollmentData,
  isLoading,
  darkMode,
  isMobile,
  onClose,
  position,
  COLORS
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Get thread color from COLORS prop or use fallback
  const getThreadColor = (threadName: string): string => {
    if (COLORS && threadName in COLORS) {
      return darkMode ? COLORS[threadName].dark.bg : COLORS[threadName].light.bg;
    }
    // Fallback colors if COLORS not provided or thread not found
    const FALLBACK_COLORS: Record<string, string> = {
      'required': '#bb7f00',
      'intel': '#017dbe',
      'info': '#91a70d',
      'people': '#268f3b',
      'media': '#b6520d',
      'theory': '#0154a6',
      'mod-sim': '#652c91',
      'sys-arch': '#dc017c',
      'devices': '#007070',
      'cyber': '#54575a'
    };
    return FALLBACK_COLORS[threadName] || '#6b7280';
  };

  // Adjust position to keep card fully visible on screen
  useEffect(() => {
    if (!cardRef.current) return;
    
    const cardRect = cardRef.current.getBoundingClientRect();
    const cardWidth = cardRect.width;
    const cardHeight = cardRect.height;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust card position if it overflows the viewport
    if (position.left + cardWidth > viewportWidth) {
      cardRef.current.style.left = `${viewportWidth - cardWidth - 10}px`;
    }
    
    if (position.top + cardHeight > viewportHeight) {
      cardRef.current.style.top = `${viewportHeight - cardHeight - 10}px`;
    }
    
    if (position.left < 10) {
      cardRef.current.style.left = "10px";
    }
    
    if (position.top < 10) {
      cardRef.current.style.top = "10px";
    }
  }, [position]);

  return (
    <div
      ref={cardRef}
      className={`fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 transition-all duration-200 ease-in-out
        ${isMobile ? 'w-[85vw] max-w-[280px] left-1/2 -translate-x-1/2' : 'w-[280px]'}`}
      style={{
        top: position.top,
        left: isMobile ? '50%' : position.left,
        transform: isMobile ? 'translateX(-50%)' : undefined,
        maxHeight: '90vh',
        overflow: 'auto'
      }}
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-1 pt-2 px-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className={`text-base font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {course.id}
              </CardTitle>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {course.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 -mt-1 -mr-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
              aria-label="Close popup"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3 px-3">
          {/* Thread badges section */}
          {course.threads.length > 0 && (
            <div className="mb-3">
              <h3 className={`text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Threads:
              </h3>
              <div className="flex flex-wrap gap-1">
                {course.threads.map((thread, index) => (
                  <div 
                    key={`thread-${index}`}
                    className="px-1.5 py-0.5 rounded-full text-white text-xs font-medium flex items-center"
                    style={{ backgroundColor: getThreadColor(thread) }}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white opacity-70 mr-1"></span>
                    {thread}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <h3 className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Student Enrollment
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Term</p>
                    <p className={`text-base font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {enrollmentData?.currentEnrollment || 0}
                    </p>
                  </div>
                  <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Previous Term</p>
                    <p className={`text-base font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {enrollmentData?.pastEnrollment || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Historical Data
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Year Ago</p>
                    <p className={`text-base font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {enrollmentData?.yearAgoEnrollment || 0}
                    </p>
                  </div>
                  <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>3 Terms Ago</p>
                    <p className={`text-base font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {enrollmentData?.threeTermsAgoEnrollment || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseInfoCard; 