"use client";

import React, {useEffect, useRef, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';
import data from "../../data/course.json";
import type {CourseEnrollmentData} from '@/lib/api';
import {fetchCourseData} from '@/lib/api';
import {prefetchAllCourseData, type PrefetchedData} from '@/lib/prefetch';
import OnboardingModal from './OnboardingModal';

type CourseType = 'intel' | 'cyber' | 'info' | 'people' | 'media' | 'theory' | 'mod-sim' | 'sys-arch' | 'devices' | 'required';

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

interface Theme {
    bg: string;
    text: string;
    textSecondary: string;
}

interface ThemeModes {
    light: Theme;
    dark: Theme;
}

interface Thread {
    name: CourseType;
    formalName: string;
    theme: ThemeModes;
    show: boolean;
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
  const [showBubbles, setShowBubbles] = useState(true);

  const threadMap: ThreadMap = {};
  filters.forEach(filter => {
    threadMap[filter.name] = filter;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        handleClosePopup();
      }
    }

    if (selectedCourse) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [selectedCourse]);

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

  const handleCourseClick = async (course: Course) => {
    if (course.name === "AND" || course.name === "OR") {
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

  const handleClosePopup = () => {
    setSelectedCourse(null);
    setEnrollmentData(null);
  };

  const handleFilterChange = (threadName: string) => {
    // Don't allow toggling of required thread
    if (threadName === 'required') return;

    setFilters(prev => prev.map(thread => ({
      ...thread,
      show: thread.name === threadName ? !thread.show : thread.show
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
    return course.id.includes('*') || course.threads.some(threadName => isThreadVisible(threadName));
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

  // Function to check if a course should be highlighted
  const shouldHighlight = (courseId: string): boolean => {
    if (!highlightedCourse) return true;
    const prerequisites = getAllPrerequisites(highlightedCourse);
    return prerequisites.has(courseId);
  };

  // Update course rendering to include highlighting
  const renderCourse = (course: Course) => {
    const isHighlighted = shouldHighlight(course.id);
    const opacity = isHighlighted ? "1" : "0.3";

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

    // Regular course rendering
    return (
      <g
        key={course.id}
        onClick={() => handleCourseClick(course)}
        onMouseEnter={() => setHighlightedCourse(course.id)}
        onMouseLeave={() => setHighlightedCourse(null)}
        style={{ transition: 'opacity 0.3s ease' }}
        opacity={opacity}
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
      const isHighlighted = highlightedCourse &&
        shouldHighlight(toCourse.id) &&
        shouldHighlight(fromCourse.id);
      const opacity = darkMode ? (isHighlighted ? "1" : "0.5") : (isHighlighted ? "1" : "0.3")

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
    const x = course.x * 192;
    const y = course.y * 96;
    const svgRect = svgRef.current?.getBoundingClientRect();

    if (!svgRect) return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };

    const courseX = (x * transform.scale + transform.x);
    const courseY = (y * transform.scale + transform.y);

    // Position the popup to the right of the course by default
    let left = courseX + (BOX_WIDTH / 2 * transform.scale) + 20;
    const top = courseY - 100;

    // If the popup would go off the right edge, position it to the left of the course
    if (left + 500 > window.innerWidth) {
      left = courseX - (BOX_WIDTH / 2 * transform.scale) - 520;
    }

    // Use both left and top for positioning
    return {
      left: `${left}px`,
      top: `${top}px`,
      transform: 'none'
    };
  };

  // Reset handler that uses the same centering logic
  const handleReset = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setTransform({
      x: centerX - (HORIZONTAL_SPACING * 2),
      y: centerY - (VERTICAL_SPACING * 2),
      scale: INITIAL_ZOOM
    });
  };

  // Update the ThreadBubbles component
  const ThreadBubbles = () => {
    const nonRequiredThreads = filters.filter(f => f.name !== 'required');

    const getThreadStyle = (thread: Thread) => {
      if (!(thread.name in COLORS)) {
        return {
          className: `px-2 py-1.5 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
            darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
          } ${thread.show ? 'ring-1 ring-offset-1 ring-gray-400 dark:ring-gray-600' : 'opacity-50'}`,
          style: {}
        };
      }

      return {
        className: `px-2 py-1.5 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
          thread.show ? 'ring-1 ring-offset-1 ring-gray-400 dark:ring-gray-600' : 'opacity-50'
        }`,
        style: {
          backgroundColor: darkMode ? COLORS[thread.name].dark.bg : COLORS[thread.name].light.bg,
          color: darkMode ? COLORS[thread.name].dark.text : COLORS[thread.name].light.text
        }
      };
    };

    return (
      <>
        <button
          onClick={() => setShowBubbles(!showBubbles)}
          className={`fixed top-20 right-4 px-3 py-2 rounded-lg shadow-md z-20 transition-all duration-200 flex items-center justify-center gap-2 w-40 ${
            darkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          } ${showBubbles ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
          title={showBubbles ? "Hide thread filters" : "Show thread filters"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Filter Threads</span>
        </button>

        <div
          className={`fixed top-32 right-4 flex flex-col gap-1.5 z-10 transition-all duration-200 items-end ${
            showBubbles ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
          }`}
        >
          {nonRequiredThreads.map(thread => {
            const { className, style } = getThreadStyle(thread);
            return (
              <div
                key={thread.name}
                className={`${className} w-40 flex items-center justify-center`}
                style={style}
                onClick={() => handleFilterChange(thread.name)}
                title={`Toggle ${thread.formalName}`}
              >
                <span className="text-xs text-center">{thread.formalName}</span>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
    >
      {/* Thread Bubbles */}
      <ThreadBubbles />

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          darkMode={darkMode}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              GradGT - CS
            </h1>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-colors duration-200 ${
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
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-16 h-full">
        {isPrefetching && (
          <div
            className="fixed top-20 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 transition-colors duration-200">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 border-2 border-blue-500 border-t-transparent dark:border-blue-400 dark:border-t-transparent rounded-full animate-spin"></div>
              <span
                className="text-gray-700 dark:text-gray-200">Prefetching course data: {prefetchProgress}%</span>
            </div>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={() => setTransform(prev => ({
              ...prev,
              scale: Math.max(MIN_ZOOM, prev.scale - ZOOM_STEP)
            }))}
            className="p-2.5 shadow rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
           text-gray-700 dark:text-gray-200 transition-colors"
            title="Zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/>
            </svg>
          </button>
          <button
            onClick={() => setTransform(prev => ({
              ...prev,
              scale: Math.min(MAX_ZOOM, prev.scale + ZOOM_STEP)
            }))}
            className="p-2.5 shadow rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
           text-gray-700 dark:text-gray-200 transition-colors"
            title="Zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/>
            </svg>
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 shadow rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
           text-gray-700 dark:text-gray-200 transition-colors"
            title="Reset View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
            </svg>
          </button>
        </div>

        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className={`absolute inset-0 cursor-grab touch-none ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
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
      <footer
        className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Made by{' '}
              <a href="https://www.linkedin.com/in/vineethsendilraj/" target="_blank" rel="noopener noreferrer"
                 className={`underline ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
                Vineeth Sendilraj
              </a>
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

      {/* Popup with dark mode support */}
      {selectedCourse && (
        <div
          className="fixed z-20"
          style={getPopupPosition(selectedCourse)}
          ref={popupRef}
        >
          <Card className={`w-[500px] ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle>{selectedCourse.id} - {selectedCourse.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className={`w-12 h-12 border-4 ${darkMode ? 'border-gray-700 border-t-gray-300' : 'border-blue-200 border-t-blue-500'} rounded-full animate-spin`}></div>
                </div>
              ) : enrollmentData ? (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Enrollment History
                    </h3>
                    <div className="space-y-2">
                      <p>Current Semester: {enrollmentData.currentEnrollment || 'N/A'}</p>
                      <p>Previous Semester: {enrollmentData.pastEnrollment || 'N/A'}</p>
                      <p>One Year Ago: {enrollmentData.yearAgoEnrollment || 'N/A'}</p>
                      <p>Three Semesters Ago: {enrollmentData.threeTermsAgoEnrollment || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-red-500">Error loading course data</p>
              )}
              <button
                onClick={handleClosePopup}
                className={`mt-4 px-4 py-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Close
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PreReqChart;
