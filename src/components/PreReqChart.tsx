"use client";

import React, {useEffect, useRef, useState, useCallback} from 'react';
import data from "../../data/course.json";
import type {CourseEnrollmentData} from '@/lib/api';
import {fetchCourseData} from '@/lib/api';
import {prefetchAllCourseData, type PrefetchedData} from '@/lib/prefetch';
import OnboardingModal from './OnboardingModal';
import GuidedTour from './GuidedTour';
import ThreadBubbles from './ThreadBubbles';
import { CourseType, Thread } from './types';
import { House, ZoomIn, ZoomOut, HelpCircle } from 'lucide-react';
import CourseInfoCard from './CourseInfoCard';

interface Point {
  x: number;
  y: number;
  name: string;
  id: string;
}

interface Course {
  id: string;
  name: string;
  short_name: string;
  x: number;
  y: number;
  threads: CourseType[];
}

interface Prereq {
  from: string;
  to: string;
  fromSide?: 'left' | 'right' | 'top' | 'bottom';
  toSide?: 'left' | 'right' | 'top' | 'bottom';
}

interface CourseData {
  courses: Course[];
  prereqs: Prereq[];
  threads: Thread[];
}

// Cast the data with unknown first to avoid type errors
const courseData = data as unknown as CourseData;
const { courses, prereqs } = courseData;
const threads = courseData.threads.map((t) => ({
  ...t,
  show: true  // Show all threads by default
}));

type ColorScheme = {
  [K in CourseType]: {
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

// Update the COLORS constant with all thread types
const COLORS: ColorScheme = {
  'required': {
    light: {
      bg: '#db9f04',      // Amber-400
      text: '#FFFFFF',    // Amber-900
      textSecondary: '#FFFFFF'  // Amber-800
    },
    dark: {
      bg: '#bb7f00',      // Amber-900
      text: '#FFFFFF',    // Amber-400
      textSecondary: '#FFFFFF'  // Amber-300
    }
  },
  'intel': {
    light: {
      bg: '#018dce',      // Emerald-400
      text: '#FFFFFF',    // Emerald-900
      textSecondary: '#FFFFFF'  // Emerald-800
    },
    dark: {
      bg: '#017dbe',      // Emerald-900
      text: '#FFFFFF',    // Emerald-400
      textSecondary: '#FFFFFF'  // Emerald-300
    }
  },
  'info': {
    light: {
      bg: '#a1b71d',      // Orange-400
      text: '#FFFFFF',    // Orange-900
      textSecondary: '#FFFFFF'  // Orange-800
    },
    dark: {
      bg: '#91a70d',      // Orange-900
      text: '#FFFFFF',    // Orange-400
      textSecondary: '#FFFFFF'  // Orange-300
    }
  },
  'people': {
    light: {
      bg: '#268f3b',      // Blue-400
      text: '#FFFFFF',    // Blue-900
      textSecondary: '#FFFFFF'  // Blue-800
    },
    dark: {
      bg: '#268f3b',      // Blue-900
      text: '#FFFFFF',    // Blue-400
      textSecondary: '#FFFFFF'  // Blue-300
    }
  },
  'media': {
    light: {
      bg: '#e6820d',      // Pink-400
      text: '#FFFFFF',    // Pink-900
      textSecondary: '#FFFFFF'  // Pink-800
    },
    dark: {
      bg: '#b6520d',      // Pink-900
      text: '#FFFFFF',    // Pink-400
      textSecondary: '#FFFFFF'  // Pink-300
    }
  },
  'theory': {
    light: {
      bg: '#0154a6',      // Purple-400
      text: '#FFFFFF',    // Purple-900
      textSecondary: '#FFFFFF'  // Purple-800
    },
    dark: {
      bg: '#0154a6',      // Purple-900
      text: '#FFFFFF',    // Purple-400
      textSecondary: '#FFFFFF'  // Purple-300
    }
  },
  'mod-sim': {
    light: {
      bg: '#652c91',      // Teal-400
      text: '#FFFFFF',    // Teal-900
      textSecondary: '#FFFFFF'  // Teal-800
    },
    dark: {
      bg: '#652c91',      // Teal-900
      text: '#FFFFFF',    // Teal-400
      textSecondary: '#FFFFFF'  // Teal-300
    }
  },
  'sys-arch': {
    light: {
      bg: '#dc017c',      // Green-400
      text: '#FFFFFF',    // Green-900
      textSecondary: '#FFFFFF'  // Green-800
    },
    dark: {
      bg: '#dc017c',      // Green-900
      text: '#FFFFFF',    // Green-400
      textSecondary: '#FFFFFF'  // Green-300
    }
  },
  'devices': {
    light: {
      bg: '#007070',      // Red-400
      text: '#FFFFFF',    // Red-900
      textSecondary: '#FFFFFF'  // Red-800
    },
    dark: {
      bg: '#007070',      // Red-900
      text: '#FFFFFF',    // Red-400
      textSecondary: '#FFFFFF'  // Red-300
    }
  },
  'cyber': {
    light: {
      bg: '#54575a',      // Red-400
      text: '#FFFFFF',    // Red-900
      textSecondary: '#FFFFFF'  // Red-800
    },
    dark: {
      bg: '#54575a',      // Red-900
      text: '#FFFFFF',    // Red-400
      textSecondary: '#FFFFFF'  // Red-300
    }
  }
};

// Add a type for the default connection sides
const DEFAULT_CONNECTION = {
  fromSide: 'right' as const,
  toSide: 'left' as const
};

const HORIZONTAL_SPACING = 256;
const VERTICAL_SPACING = 96;

// Add a type for the thread map
type ThreadMap = {
  [key in CourseType]?: Thread;
};

const PreReqChart = () => {
  const BOX_WIDTH = 160;
  const BOX_HEIGHT = 80;
  const ID_SECTION_HEIGHT = 30;
  const CORNER_RADIUS = 12;
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 2;
  const ZOOM_STEP = 0.1;
  const INITIAL_ZOOM = 0.35;

  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: INITIAL_ZOOM });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({x: 0, y: 0});
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<CourseEnrollmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrefetching, setIsPrefetching] = useState(true);
  const [prefetchProgress, setPrefetchProgress] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [prefetchedData, setPrefetchedData] = useState<PrefetchedData | null>(null);
  const [prefetchErrors, setPrefetchErrors] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<Thread[]>(threads);
  const [highlightedCourse, setHighlightedCourse] = useState<string | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [isTouching, setIsTouching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const threadMap: ThreadMap = {};
  filters.forEach(filter => {
    threadMap[filter.name] = filter;
  });

  const handleClosePopup = useCallback(() => {
    // Don't close the popup during guided tour
    if (showGuidedTour) return;
    
    setSelectedCourse(null);
    setEnrollmentData(null);
    setSelectedHighlight(null);
  }, [showGuidedTour]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        if (!showGuidedTour) {
          handleClosePopup();
        }
      }
    }

    if (selectedCourse) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [selectedCourse, showGuidedTour, handleClosePopup]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsPrefetching(true);
        setPrefetchProgress(0);

        const cached = localStorage.getItem('prefetchedData');
        let existingData: PrefetchedData | null = null;

        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            existingData = parsed;
          }
        }

        const coursesToFetch = courses.filter(course =>
          !existingData?.courses[course.id]
        );

        if (coursesToFetch.length === 0 && existingData) {
          setPrefetchedData(existingData);
          setPrefetchProgress(100);
          return;
        }

        const newData: PrefetchedData = existingData || {
          timestamp: Date.now(),
          courses: {}
        };

        const totalToFetch = coursesToFetch.length;
        let completedCourses = 0;

        const fetchedData = await prefetchAllCourseData(coursesToFetch, (progress) => {
          completedCourses = progress;
          const existingCount = courses.length - totalToFetch;
          const totalProgress = Math.round(((completedCourses + existingCount) / courses.length) * 100);
          setPrefetchProgress(totalProgress);
        }).catch(error => {
          console.error('Error during prefetch:', error);
          return { courses: {} };
        });

        const mergedData: PrefetchedData = {
          timestamp: Date.now(),
          courses: {
            ...newData.courses,
            ...fetchedData.courses
          }
        };

        setPrefetchedData(mergedData);
        localStorage.setItem('prefetchedData', JSON.stringify(mergedData));

        const errors: Record<string, boolean> = {};
        courses.forEach(course => {
          if (!mergedData.courses[course.id]) {
            errors[course.id] = true;
          }
        });
        setPrefetchErrors(errors);
      } catch (error) {
        console.error('Error prefetching data:', error);
      } finally {
        setIsPrefetching(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Set initial transform after component mounts
  useEffect(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setTransform({
      x: centerX - (HORIZONTAL_SPACING * 2),
      y: centerY - (VERTICAL_SPACING * 2),
      scale: INITIAL_ZOOM
    });
  }, []);

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

  const getConnectionPoint = (course: Course, side: 'left' | 'right' | 'top' | 'bottom' = 'right', isLogicGate: boolean = false) => {
    const x = course.x * HORIZONTAL_SPACING;
    const y = course.y * VERTICAL_SPACING;
    const size = isLogicGate ? 40 : BOX_WIDTH;
    const height = isLogicGate ? 40 : BOX_HEIGHT;

    switch(side) {
      case 'left':
        return { x: x - size/2, y };
      case 'right':
        return { x: x + size/2, y };
      case 'top':
        return { x, y: y - height/2 };
      case 'bottom':
        return { x, y: y + height/2 };
      default:
        return { x: x + size/2, y };
    }
  };

  const createPath = (start: Point, end: Point, prereq: Prereq) => {
    const isEndLogicGate = end.name === "AND" || end.name === "OR";
    const isStartLogicGate = start.name === "AND" || start.name === "OR";

    const { fromSide, toSide } = { ...DEFAULT_CONNECTION, ...prereq };

    const startPoint = getConnectionPoint(start as Course, fromSide, isStartLogicGate);
    const endPoint = getConnectionPoint(end as Course, toSide, isEndLogicGate);

    if ((fromSide === 'bottom' && toSide === 'top') ||
        (fromSide === 'top' && toSide === 'bottom')) {
      const midY = (startPoint.y + endPoint.y) / 2;
      return `M ${startPoint.x} ${startPoint.y}
              C ${startPoint.x} ${midY},
                ${endPoint.x} ${midY},
                ${endPoint.x} ${endPoint.y}`;
    }

    const distance = endPoint.x - startPoint.x;
    const thirdDistance = distance / 3;

    return `M ${startPoint.x} ${startPoint.y}
            h ${thirdDistance/2}
            C ${startPoint.x + thirdDistance} ${startPoint.y},
              ${endPoint.x - thirdDistance} ${endPoint.y},
              ${endPoint.x - thirdDistance/2} ${endPoint.y}
            h ${thirdDistance/2}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - transform.x,
        y: e.clientY - transform.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * ZOOM_STEP;
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, transform.scale + delta));

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setTransform((prev) => ({
        scale: newScale,
        x: x - (x - prev.x) * (newScale / prev.scale),
        y: y - (y - prev.y) * (newScale / prev.scale)
      }));
    }
  };

  // Improved touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch for panning
      setIsTouching(true);
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - transform.x,
        y: e.touches[0].clientY - transform.y
      });
    } else if (e.touches.length === 2) {
      // Two touches for pinch zoom
      const dist = getDistanceBetweenTouches(e);
      setLastTouchDistance(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default to avoid scrolling while interacting with the chart
    
    if (e.touches.length === 1 && isDragging) {
      // Handle panning with smoother animation
      requestAnimationFrame(() => {
        setTransform((prev) => ({
          ...prev,
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y
        }));
      });
    } else if (e.touches.length === 2 && lastTouchDistance !== null) {
      // Handle pinch zoom with smoother animation
      const newDist = getDistanceBetweenTouches(e);
      const delta = newDist - lastTouchDistance;
      
      // Calculate zoom factor based on pinch distance
      const zoomFactor = delta * 0.01;
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, transform.scale + zoomFactor));
      
      // Get the midpoint between the two touches
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const x = midX - rect.left;
        const y = midY - rect.top;
        
        requestAnimationFrame(() => {
          setTransform((prev) => ({
            scale: newScale,
            x: x - (x - prev.x) * (newScale / prev.scale),
            y: y - (y - prev.y) * (newScale / prev.scale)
          }));
        });
      }
      
      setLastTouchDistance(newDist);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsTouching(false);
    setLastTouchDistance(null);
  };

  // Helper function to calculate distance between two touch points
  const getDistanceBetweenTouches = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Function to check if a course should be highlighted
  const shouldHighlight = (courseId: string): boolean => {
    // During guided tour first step, always highlight CS 1332
    if (showGuidedTour && courseId === "CS 1332") return true;
    
    if (!highlightedCourse && !selectedHighlight) return true;
    const targetCourse = highlightedCourse || selectedHighlight;
    if (!targetCourse) return true;
    const prerequisites = getAllPrerequisites(targetCourse);
    return prerequisites.has(courseId) || courseId === targetCourse;
  };

  // Update the course click handler to work better with touch
  const handleCourseClick = async (course: Course, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (course.name === "AND" || course.name === "OR") {
      return;
    }

    // Don't open course details if we're dragging
    if (isTouching && isDragging) {
      return;
    }

    // During guided tour, only allow clicking CS 1332 and don't close the tour
    if (showGuidedTour) {
      if (course.id === "CS 1332") {
        setSelectedCourse(course);
        setIsLoading(true);
        try {
          let data: CourseEnrollmentData;
          if (prefetchedData?.courses[course.id]) {
            data = prefetchedData.courses[course.id];
          } else {
            data = await fetchCourseData(course.id);
          }
          setEnrollmentData(data);
        } catch (error) {
          console.error('Error fetching enrollment data:', error);
          setEnrollmentData(null);
        } finally {
          setIsLoading(false);
        }
      }
      return;
    }

    setSelectedCourse(course);
    setIsLoading(true);
    try {
      let data: CourseEnrollmentData;
      if (prefetchedData?.courses[course.id]) {
        data = prefetchedData.courses[course.id];
      } else {
        data = await fetchCourseData(course.id);
        setPrefetchedData(prev => {
          const newData = {
            timestamp: Date.now(),
            courses: {
              ...(prev?.courses || {}),
              [course.id]: data
            }
          };
          localStorage.setItem('prefetchedData', JSON.stringify(newData));
          return newData;
        });
        setPrefetchErrors(prev => ({
          ...prev,
          [course.id]: false
        }));
      }
      setEnrollmentData(data);
    } catch (error) {
      console.error('Error fetching enrollment data:', error);
      setEnrollmentData(null);
      setPrefetchErrors(prev => ({
        ...prev,
        [course.id]: true
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (thread: Thread) => {
    // Don't allow toggling of required thread
    if (thread.name === 'required') return;

    setFilters(prev => prev.map(t => ({
      ...t,
      show: t.name === thread.name ? !t.show : t.show
    })));
  };

  const isThreadVisible = (course: Course | string): boolean => {
    // Handle string input (thread name)
    if (typeof course === 'string') {
      return filters.some(t => t.name === course && t.show);
    }

    // Always show required courses
    if (course.id.includes('*')) {
      return true;
    }

    // Handle AND/OR nodes
    if (course.name === "AND" || course.name === "OR") {
      const connectedCourses = prereqs.filter(p => p.from === course.id || p.to === course.id);
      return connectedCourses.some(p => {
        const otherCourseId = p.from === course.id ? p.to : p.from;
        const otherCourse = courses.find(c => c.id === otherCourseId);
        if (!otherCourse) return false;

        // For connected courses, check if they have any visible threads
        return otherCourse.id.includes('*') ||
               otherCourse.threads.some(threadName =>
                 filters.some(t => t.name === threadName && t.show)
               );
      });
    }

    // Regular course - check if any of its threads are visible
    return course.threads.some(threadName =>
      filters.some(t => t.name === threadName && t.show)
    );
  };

  const visibleCourses = courses.filter(course => {
    if (course.name === "AND" || course.name === "OR") {
      return true; // Always show AND/OR nodes
    }
    return isThreadVisible(course);
  });

  // Update the prerequisites filter
  const visiblePrereqs = prereqs.filter(prereq => {
    const fromCourse = courses.find(c => c.id === prereq.from);
    const toCourse = courses.find(c => c.id === prereq.to);

    // If either course doesn't exist, don't show the arrow
    if (!fromCourse || !toCourse) return false;

    // For AND/OR nodes, check if they have any visible connected courses
    if (fromCourse.name === "AND" || fromCourse.name === "OR" ||
        toCourse.name === "AND" || toCourse.name === "OR") {
      // Only show if both connected courses are visible
      return isThreadVisible(fromCourse) && isThreadVisible(toCourse);
    }

    // For regular courses, check if both courses are visible
    return isThreadVisible(fromCourse) && isThreadVisible(toCourse);
  });

  // Function to get all prerequisites for a course (recursive)
  const getAllPrerequisites = (courseId: string, visited = new Set<string>()): Set<string> => {
    if (visited.has(courseId)) return visited;
    visited.add(courseId);

    prereqs.forEach(prereq => {
      if (prereq.to === courseId) {
        getAllPrerequisites(prereq.from, visited);
      }
    });

    return visited;
  };

  // Update course rendering to include highlighting and improved touch targets
  const renderCourse = (course: Course) => {
    const isHighlighted = shouldHighlight(course.id);
    const opacity = isHighlighted ? "1" : "0.3";

    // Add first step highlight class for CS 1332
    const extraClasses = showGuidedTour && course.id === "CS 1332" ? "first-step-highlight" : "";

    // Handle click on the course background
    const handleBackgroundClick = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation(); // Prevent event from bubbling to SVG
      if (!showGuidedTour) {
        if (selectedHighlight === course.id) {
          setSelectedHighlight(null); // Deselect if already selected
        } else {
          setSelectedHighlight(course.id); // Select this course
        }
      }
    };

    // Special rendering for AND/OR nodes
    if (course.name === "AND" || course.name === "OR") {
      const size = 40;
      return (
        <g
          key={course.id}
          style={{ transition: 'opacity 0.3s ease'}}
          opacity={opacity}
        >
          <path
            d={`M ${course.x * HORIZONTAL_SPACING} ${course.y * VERTICAL_SPACING - size/2} 
                L ${course.x * HORIZONTAL_SPACING + size/2} ${course.y * VERTICAL_SPACING}
                L ${course.x * HORIZONTAL_SPACING} ${course.y * VERTICAL_SPACING + size/2}
                L ${course.x * HORIZONTAL_SPACING - size/2} ${course.y * VERTICAL_SPACING}
                Z`}
            fill={darkMode ? "#1f2937" : "#f3f4f6"}
            stroke={darkMode ? "#2b3543" : "#7c838f"}
            strokeWidth="2"
            className="transition-colors duration-200"
          />
          <text
            x={course.x * HORIZONTAL_SPACING}
            y={course.y * VERTICAL_SPACING + 6}
            textAnchor="middle"
            className="text-sm font-bold"
            fill={darkMode ? "#e5e7eb" : "#4b5563"}
          >
            {course.name}
          </text>
        </g>
      );
    }

    // Determine the primary thread for coloring
    let primaryThread: CourseType;
    if (course.id.includes('*')) {
      primaryThread = 'required';
    } else if (course.threads.length > 0) {
      primaryThread = course.threads[0];
    } else {
      primaryThread = 'required'; // Fallback color scheme
    }

    // Update the getThreadColors function to handle required classes
    const getThreadColors = (thread: CourseType | undefined) => {
      if (!thread || !(thread in COLORS)) {
        return {
          bg: darkMode ? "#1f2937" : "white",
          text: darkMode ? "#f3f4f6" : "#111827",
          textSecondary: darkMode ? "text-gray-300" : "text-gray-600"
        };
      }

      const colorScheme = COLORS[thread];
      return {
        bg: darkMode ? colorScheme.dark.bg : colorScheme.light.bg,
        text: darkMode ? colorScheme.dark.text : colorScheme.light.text,
        textSecondary: darkMode ? `text-${thread}-200` : `text-${thread}-900`
      };
    };

    const colors = getThreadColors(primaryThread);

    // Regular course rendering with improved touch targets
    return (
      <g
        key={course.id}
        onClick={(e) => {
          handleBackgroundClick(e);
          handleCourseClick(course, e);
        }}
        onTouchEnd={(e) => {
          if (!isDragging) {
            handleBackgroundClick(e);
            handleCourseClick(course, e);
          }
        }}
        onMouseEnter={() => !selectedHighlight && !showGuidedTour && setHighlightedCourse(course.id)}
        onMouseLeave={() => !selectedHighlight && !showGuidedTour && setHighlightedCourse(null)}
        style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
        opacity={opacity}
        className={`course-card ${extraClasses}`}
        data-course-id={course.id}
      >
        <rect
          x={course.x * HORIZONTAL_SPACING - BOX_WIDTH / 2}
          y={course.y * VERTICAL_SPACING - BOX_HEIGHT / 2}
          width={BOX_WIDTH}
          height={BOX_HEIGHT}
          rx={CORNER_RADIUS}
          ry={CORNER_RADIUS}
          fill={colors.bg}
          stroke={prefetchErrors[course.id] ? "#ef4444" : (darkMode ? "#4b5563" : "#e5e7eb")}
          strokeWidth={prefetchErrors[course.id] ? "3" : "2"}
          className="cursor-pointer transition-colors duration-200"
        />

        <line
          x1={course.x * HORIZONTAL_SPACING - BOX_WIDTH / 2 + CORNER_RADIUS}
          y1={course.y * VERTICAL_SPACING - BOX_HEIGHT / 2 + ID_SECTION_HEIGHT}
          x2={course.x * HORIZONTAL_SPACING + BOX_WIDTH / 2 - CORNER_RADIUS}
          y2={course.y * VERTICAL_SPACING - BOX_HEIGHT / 2 + ID_SECTION_HEIGHT}
          stroke={darkMode ? "#4b5563" : "#e5e7eb"}
          strokeWidth="1"
        />

        {/* Thread indicator for courses with multiple threads */}
        {course.threads.length > 1 && (
          <g>
            {course.threads.length <= 3 ? (
              // For courses with 2-3 threads, show small stacked circles
              course.threads.slice(1).map((threadName, idx) => {
                // Skip empty thread names
                if (!threadName) return null;
                
                const threadColors = getThreadColors(threadName);
                const CIRCLE_RADIUS = 5;
                const OFFSET = 3; // Slight offset for stacked appearance
                
                return (
                  <circle
                    key={`thread-${idx}`}
                    cx={course.x * HORIZONTAL_SPACING + BOX_WIDTH / 2 - CORNER_RADIUS - CIRCLE_RADIUS - 2}
                    cy={course.y * VERTICAL_SPACING - BOX_HEIGHT / 2 + CORNER_RADIUS + (idx * OFFSET)}
                    r={CIRCLE_RADIUS}
                    fill={threadColors.bg}
                    stroke={darkMode ? "#4b5563" : "#e5e7eb"}
                    strokeWidth="1"
                    opacity={isThreadVisible({id: course.id, name: course.name, short_name: course.short_name, x: course.x, y: course.y, threads: [threadName]}) ? 1 : 0.4}
                  />
                );
              })
            ) : (
              // For courses with 4+ threads, show a counter with the first two thread colors
              <>
                {/* Background for the thread counter */}
                <rect
                  x={course.x * HORIZONTAL_SPACING + BOX_WIDTH / 2 - 26}
                  y={course.y * VERTICAL_SPACING - BOX_HEIGHT / 2 + 4}
                  width={22}
                  height={16}
                  rx={8}
                  fill={darkMode ? "#374151" : "#f3f4f6"}
                  stroke={darkMode ? "#4b5563" : "#e5e7eb"}
                  strokeWidth="1"
                />
                
                {/* Thread color indicators */}
                {course.threads.slice(1, 3).map((threadName, idx) => {
                  if (!threadName) return null;
                  const threadColors = getThreadColors(threadName);
                  return (
                    <circle
                      key={`thread-marker-${idx}`}
                      cx={course.x * HORIZONTAL_SPACING + BOX_WIDTH / 2 - 20 + (idx * 7)}
                      cy={course.y * VERTICAL_SPACING - BOX_HEIGHT / 2 + 12}
                      r={3}
                      fill={threadColors.bg}
                      stroke={darkMode ? "#4b5563" : "#e5e7eb"}
                      strokeWidth="0.5"
                    />
                  );
                })}
                
                {/* Counter text */}
                <text
                  x={course.x * HORIZONTAL_SPACING + BOX_WIDTH / 2 - 10}
                  y={course.y * VERTICAL_SPACING - BOX_HEIGHT / 2 + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill={darkMode ? "#e5e7eb" : "#374151"}
                >
                  +{course.threads.length - 1}
                </text>
              </>
            )}
          </g>
        )}

        <text
          x={course.x * HORIZONTAL_SPACING}
          y={course.y * VERTICAL_SPACING - BOX_HEIGHT / 2 + ID_SECTION_HEIGHT/2 + 6}
          textAnchor="middle"
          fill={colors.text}
          className="text-base font-bold"
        >
          {course.id}
        </text>

        <foreignObject
          x={course.x * HORIZONTAL_SPACING - BOX_WIDTH / 2 + 10}
          y={course.y * VERTICAL_SPACING - BOX_HEIGHT / 2 + ID_SECTION_HEIGHT + 5}
          width={BOX_WIDTH - 20}
          height={BOX_HEIGHT - ID_SECTION_HEIGHT - 10}
        >
          <div className={`text-center text-sm ${colors.textSecondary}`}
               style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#FFFFFF' }}>
            {course.name}
          </div>
        </foreignObject>
      </g>
    );
  };

  // Update arrow rendering to include highlighting
  const renderArrow = (prereq: Prereq, index: number) => {
    const fromCourse = courses.find((c) => c.id === prereq.from);
    const toCourse = courses.find((c) => c.id === prereq.to);

    if (fromCourse && toCourse) {
      const isHighlighted = (highlightedCourse || selectedHighlight) &&
        shouldHighlight(toCourse.id) &&
        shouldHighlight(fromCourse.id);
      const opacity = darkMode ? (isHighlighted ? "1" : "0.5") : (isHighlighted ? "1" : "0.3");

      return (
        <path
          key={`arrow-${index}`}
          d={createPath(fromCourse, toCourse, prereq)}
          fill="none"
          stroke={darkMode ? (isHighlighted ? "#8c939f" : "#2c333f") : (isHighlighted ? "#333" : "#999") }
          strokeWidth="3"
          markerEnd="url(#arrowhead)"
          style={{ transition: 'opacity 0.3s ease' }}
          opacity={opacity}
        />
      );
    }
    return null;
  };

  // Update popup positioning to be next to the course
  const getPopupPosition = (course: Course) => {
    const courseElement = document.querySelector(`[data-course-id="${course.id}"]`);
    const courseRect = courseElement?.getBoundingClientRect();
    
    if (!courseRect) return { top: 0, left: 0 };
    
    const popupWidth = 280; // Updated to match new card width
    const popupHeight = 250; // Approximate card height
    const padding = 15;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (isMobile) {
      return {
        top: Math.min(courseRect.bottom + padding, viewportHeight - popupHeight - padding),
        left: (viewportWidth - popupWidth) / 2
      };
    } else {
      // Try positioning to the right
      let left = courseRect.right + padding;
      
      // If it would go off the right edge, position to the left
      if (left + popupWidth + padding > viewportWidth) {
        left = courseRect.left - popupWidth - padding;
      }
      
      // If still off-screen (window too narrow), center horizontally
      if (left < padding) {
        left = Math.max(padding, (viewportWidth - popupWidth) / 2);
      }
      
      // Vertical positioning, prefer aligning with the top of the course card
      let top = courseRect.top;
      
      // If it would go off the bottom, align to bottom of viewport minus padding
      if (top + popupHeight + padding > viewportHeight) {
        top = viewportHeight - popupHeight - padding;
      }
      
      // Never let it go above the top padding
      if (top < padding) {
        top = padding;
      }
      
      return { top, left };
    }
  };

  // Reset handler with animation
  const handleReset = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Add smooth animation to reset
    const startX = transform.x;
    const startY = transform.y;
    const startScale = transform.scale;
    const endX = centerX - (HORIZONTAL_SPACING * 2);
    const endY = centerY - (VERTICAL_SPACING * 2);
    const endScale = INITIAL_ZOOM;
    
    const duration = 500; // ms
    const startTime = Date.now();
    
    const animateReset = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);
      
      const newX = startX + (endX - startX) * easedProgress;
      const newY = startY + (endY - startY) * easedProgress;
      const newScale = startScale + (endScale - startScale) * easedProgress;
      
      setTransform({
        x: newX,
        y: newY,
        scale: newScale
      });
      
      if (progress < 1) {
        requestAnimationFrame(animateReset);
      }
    };
    
    requestAnimationFrame(animateReset);
  };

  // Add click handler to clear selection when clicking the background
  const handleSvgClick = (e: React.MouseEvent) => {
    if (e.target === svgRef.current && !showGuidedTour) {
      setSelectedHighlight(null);
      handleClosePopup();
    }
  };

  // Handle clicks outside the course info card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Don't handle if we're in guided tour
      if (showGuidedTour) return;

      // Don't handle if we're dragging
      if (isDragging) return;

      // Get the clicked element
      const target = event.target as Element;

      // Check if the click is on the SVG or its background
      const isSvgClick = svgRef.current && target === svgRef.current;
      
      // Check if click is outside the popup and not on a course
      if (selectedCourse && 
          !target.closest('.course-card') && // Not clicking a course
          !popupRef.current?.contains(target) && // Not clicking the popup
          (isSvgClick || !target.closest('svg'))) { // Clicking SVG background or outside SVG
        handleClosePopup();
      }
    };

    // Add listeners if we have a selected course
    if (selectedCourse) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [selectedCourse, showGuidedTour, isDragging, handleClosePopup]);

  // Add an overlay to prevent clicking outside during guided tour
  const renderTourOverlay = () => {
    if (!showGuidedTour) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={(e) => e.stopPropagation()}
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {renderTourOverlay()}
      {/* Thread Bubbles */}
      <div className="fixed right-4 top-20 z-50">
        <ThreadBubbles 
          filters={filters}
          handleFilterChange={handleFilterChange}
          darkMode={darkMode}
          COLORS={COLORS}
        />
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          darkMode={darkMode}
          onClose={() => {
            setShowOnboarding(false);
          }}
        />
      )}

      {/* Guided Tour */}
      {showGuidedTour && (
        <GuidedTour
          darkMode={darkMode}
          onComplete={() => setShowGuidedTour(false)}
          isMobile={isMobile}
        />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-20 transition-colors duration-200">
        <div className="h-full flex items-center justify-between px-4">
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} animate-fadeIn`}>
            GradGT - CS
          </h1>

          <div className="flex items-center gap-2">
            {/* Help Button */}
            <button
              onClick={() => setShowGuidedTour(true)}
              className={`p-2 rounded-full transition-colors duration-200 mobile-nav-button touch-target ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
              title="Show Guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors duration-200 mobile-nav-button touch-target ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path
                    d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd"
                        d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                        clipRule="evenodd"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-16 h-full">
        {isPrefetching && (
          <div
            className="fixed top-20 left-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg z-50 transition-colors duration-200 max-w-[180px] animate-fadeIn">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 border-2 border-blue-500 border-t-transparent dark:border-blue-400 dark:border-t-transparent rounded-full animate-spin"></div>
              <span
                className="text-xs text-gray-700 dark:text-gray-200">Prefetching: {prefetchProgress}%</span>
            </div>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={() => setTransform(prev => ({
              ...prev,
              scale: Math.max(MIN_ZOOM, prev.scale - ZOOM_STEP)
            }))}
            className="p-2.5 shadow rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
           text-gray-700 dark:text-gray-200 transition-colors mobile-nav-button touch-target"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTransform(prev => ({
              ...prev,
              scale: Math.min(MAX_ZOOM, prev.scale + ZOOM_STEP)
            }))}
            className="p-2.5 shadow rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
           text-gray-700 dark:text-gray-200 transition-colors mobile-nav-button touch-target"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 shadow rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
           text-gray-700 dark:text-gray-200 transition-colors mobile-nav-button touch-target"
            title="Reset View"
          >
            <House className="w-5 h-5" />
          </button>
        </div>

        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className={`absolute inset-0 touch-none ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onClick={handleSvgClick}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="12"
                markerHeight="8"
                refX="10"
                refY="4"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M0,0 L12,4 L0,8 L3,4 Z" fill={darkMode ? "#9ca3af" : "#666"} strokeWidth="3" />
              </marker>
            </defs>

            {visiblePrereqs.map((prereq, index) => renderArrow(prereq, index))}

            {visibleCourses.map((course) => renderCourse(course))}
          </g>
        </svg>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-20 transition-colors duration-200">
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Made by{' '}
              <a href="https://www.linkedin.com/in/vineethsendilraj/" target="_blank" rel="noopener noreferrer"
                 className={`underline ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
                Vineeth Sendilraj
              </a>
              <span className="hidden sm:inline">
                ,{' '}
                <a href="https://www.linkedin.com/in/vivek-vishwanath1/" target="_blank" rel="noopener noreferrer"
                  className={`underline ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
                  Vivek Vishwanath
                </a>
                , and{' '}
                <a href="https://www.linkedin.com/in/daveh-day/" target="_blank" rel="noopener noreferrer"
                  className={`underline ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
                  Daveh Day
                </a>
                , under the direction of Dr. Mary Hudachek-Buswell
              </span>
            </span>
          </div>
          <a
            href="https://github.com/VineethSendilraj/GradGT"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
            title="View source on GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="text-sm">Source</span>
          </a>
        </div>
      </footer>

      {/* Course Info Popup */}
      {selectedCourse && (
        <CourseInfoCard
          course={selectedCourse}
          enrollmentData={enrollmentData}
          isLoading={isLoading}
          darkMode={darkMode}
          isMobile={isMobile}
          onClose={handleClosePopup}
          position={getPopupPosition(selectedCourse)}
          COLORS={COLORS}
        />
      )}
    </div>
  );
};

export default PreReqChart;
