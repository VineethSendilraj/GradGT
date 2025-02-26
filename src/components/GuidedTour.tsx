import React, { useState, useEffect, useRef, useMemo } from 'react';

interface GuidedTourProps {
  darkMode: boolean;
  onComplete: () => void;
  isMobile: boolean;
}

const GuidedTour: React.FC<GuidedTourProps> = ({ darkMode, onComplete, isMobile }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Define tour steps based on device using useMemo to prevent recreation on each render
  const tourSteps = useMemo(() => {
    return isMobile ? [
      {
        target: '[data-course-id="CS 1332"]',
        content: 'Tap on CS 1332 to view its enrollment data and details.',
        position: 'bottom'
      },
      {
        target: '.zoom-controls',
        content: 'Use these controls to zoom in, zoom out, or reset the view.',
        position: 'bottom'
      },
      {
        target: '.thread-bubbles',
        content: 'Tap here to filter courses by thread.',
        position: 'bottom'
      },
      {
        target: 'svg',
        content: 'Drag to pan around the chart. Pinch to zoom in and out.',
        position: 'top'
      }
    ] : [
      {
        target: '[data-course-id="CS 1332"]',
        content: 'Click on CS 1332 to view its enrollment data and details.',
        position: 'bottom'
      },
      {
        target: '.zoom-controls',
        content: 'Use these controls to zoom in, zoom out, or reset the view.',
        position: 'bottom'
      },
      {
        target: '.thread-bubbles',
        content: 'Click on thread bubbles to filter courses by thread.',
        position: 'bottom'
      },
      {
        target: 'svg',
        content: 'Drag to pan around the chart. Use the mouse wheel to zoom in and out.',
        position: 'top'
      }
    ];
  }, [isMobile]);

  // Find the target element and calculate tooltip position
  useEffect(() => {
    if (currentStep >= tourSteps.length) {
      onComplete();
      return;
    }

    const step = tourSteps[currentStep];
    const element = document.querySelector(step.target) as HTMLElement;
    
    if (element) {
      // Add highlight class to target element
      element.classList.add('tour-highlight');
      
      // For the first step, scroll CS 1332 into view and center it
      if (currentStep === 0) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Calculate tooltip position
      const rect = element.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current?.offsetWidth || 300;
      const tooltipHeight = tooltipRef.current?.offsetHeight || 150;
      
      let top = 0;
      let left = 0;
      
      if (isMobile) {
        if (step.target === '.thread-bubbles') {
          // For thread bubbles on mobile, position near the filter button
          const filterButton = document.querySelector('.thread-bubbles button') as HTMLElement;
          if (filterButton) {
            const filterRect = filterButton.getBoundingClientRect();
            top = filterRect.bottom + 20;
            left = (window.innerWidth - tooltipWidth) / 2;
          }
        } else if (currentStep === tourSteps.length - 1) {
          // Last step - position in center of screen
          top = (window.innerHeight / 2) - (tooltipHeight / 2);
          left = (window.innerWidth - tooltipWidth) / 2;
        } else {
          // Default mobile positioning for other steps
          top = window.innerHeight - tooltipHeight - 100;
          left = (window.innerWidth - tooltipWidth) / 2;
        }
      } else {
        // Special case for zoom controls, thread bubbles, and last step
        if (step.target === '.zoom-controls') {
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.left - tooltipWidth - 20;
        } else if (step.target === '.thread-bubbles') {
          const filterButton = document.querySelector('.thread-bubbles button') as HTMLElement;
          if (filterButton) {
            const filterRect = filterButton.getBoundingClientRect();
            top = filterRect.top;
            left = filterRect.left - tooltipWidth - 20;
          }
        } else if (currentStep === tourSteps.length - 1) {
          // Last step - position in center-right of screen
          top = (window.innerHeight / 2) - (tooltipHeight / 2);
          left = window.innerWidth - tooltipWidth - 100; // 100px from right edge
        } else {
          switch (step.position) {
            case 'top':
              top = rect.top - tooltipHeight - 10;
              left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
              break;
            case 'bottom':
              top = rect.bottom + 10;
              left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
              break;
            case 'left':
              top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
              left = rect.left - tooltipWidth - 10;
              break;
            case 'right':
              top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
              left = rect.right + 10;
              break;
          }
        }
      }
      
      // Ensure tooltip stays within viewport
      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
      if (top < 10) top = 10;
      if (top + tooltipHeight > window.innerHeight - 10) top = window.innerHeight - tooltipHeight - 10;
      
      setTooltipPosition({ top, left });
    }
    
    // Cleanup function to remove highlight
    return () => {
      if (element) {
        element.classList.remove('tour-highlight');
      }
    };
  }, [currentStep, tourSteps, onComplete, isMobile]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (currentStep >= tourSteps.length) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleSkip}
      />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-50 p-4 rounded-lg shadow-lg max-w-sm animate-fadeIn ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          width: isMobile ? '85vw' : '300px'
        }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2">
            Step {currentStep + 1} of {tourSteps.length}
          </h3>
          <p>{tourSteps[currentStep].content}</p>
        </div>
        
        <div className="flex justify-between">
          <div>
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className={`px-3 py-1 rounded mr-2 touch-target ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className={`px-3 py-1 rounded touch-target ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {currentStep < tourSteps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
          
          <button
            onClick={handleSkip}
            className={`px-3 py-1 rounded touch-target ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Skip
          </button>
        </div>
      </div>
    </>
  );
};

export default GuidedTour; 