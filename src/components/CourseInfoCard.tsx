import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CourseEnrollmentData } from '@/lib/api';

interface Course {
  id: string;
  name: string;
  short_name: string;
  x: number;
  y: number;
  threads: string[];
}

interface CourseInfoCardProps {
  course: Course;
  enrollmentData: CourseEnrollmentData | null;
  isLoading: boolean;
  darkMode: boolean;
  isMobile: boolean;
  onClose: () => void;
  position: { top: number; left: number };
}

const CourseInfoCard: React.FC<CourseInfoCardProps> = ({
  course,
  enrollmentData,
  isLoading,
  darkMode,
  isMobile,
  onClose,
  position,
}) => {
  return (
    <div
      className={`fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 transition-all duration-200 ease-in-out
        ${isMobile ? 'w-[90vw] max-w-md left-1/2 -translate-x-1/2' : 'w-[300px]'}`}
      style={{
        top: position.top,
        left: isMobile ? '50%' : position.left,
        transform: isMobile ? 'translateX(-50%)' : undefined,
      }}
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {course.id}
              </CardTitle>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {course.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
              aria-label="Close popup"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Student Enrollment
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Term</p>
                    <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {enrollmentData?.currentEnrollment || 0}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Previous Term</p>
                    <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {enrollmentData?.pastEnrollment || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Historical Data
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Year Ago</p>
                    <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {enrollmentData?.yearAgoEnrollment || 0}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>3 Terms Ago</p>
                    <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
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