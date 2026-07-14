import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getLessonForStudentApi,
  getCourseCurriculumApi,
} from "../api/course.api";
import {
  getCourseProgressApi,
  updateProgressApi,
  markLessonCompleteApi,
} from "../api/progress.api";
import type { ILesson, IProgress } from "../types";

interface CurriculumSection {
  _id: string;
  title: string;
  lessons: ILesson[];
}

const WatchPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<ILesson | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumSection[]>([]);
  const [progress, setProgress] = useState<IProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [startTime, setStartTime] = useState(0);

  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchedSecondsRef = useRef(0);

  // flatten all lessons — recomputes only when curriculum changes
  const allLessons = useMemo(
    () => curriculum.flatMap((s) => s.lessons),
    [curriculum],
  );

  // String() cast on both sides prevents ObjectId vs string mismatch
  const currentIndex = useMemo(
    () => allLessons.findIndex((l) => String(l._id) === String(lessonId)),
    [allLessons, lessonId],
  );

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  useEffect(() => {
    if (!lessonId) return;

    const fetchAll = async () => {
      try {
        setIsLoading(true);
        setError("");
        watchedSecondsRef.current = 0;

        const {
          data: { data },
        } = await getLessonForStudentApi(lessonId);
        const fetchedLesson = data.lesson;
        setLesson(fetchedLesson);

        const extractedCourseId =
          (fetchedLesson.section as any)?.course?._id ||
          (fetchedLesson.section as any)?.course ||
          null;

        if (!extractedCourseId) return;
        setCourseId(extractedCourseId);

        const [curriculumRes, progressRes] = await Promise.all([
          getCourseCurriculumApi(extractedCourseId),
          getCourseProgressApi(extractedCourseId),
        ]);

        const fetchedCurriculum = curriculumRes.data.data.curriculum;
        const fetchedProgress = progressRes.data.data.progress;

        setCurriculum(fetchedCurriculum);
        setProgress(fetchedProgress);

        const activeSection = fetchedCurriculum.find((s: CurriculumSection) =>
          s.lessons.some((l) => String(l._id) === String(lessonId)),
        );
        if (activeSection) setOpenSections([activeSection._id]);

        const existingProgress = fetchedProgress.find(
          (p: IProgress) =>
            String((p.lesson as any)?._id || p.lesson) === String(lessonId),
        );
        if (existingProgress) {
          setIsCompleted(existingProgress.isCompleted);
          watchedSecondsRef.current = existingProgress.watchedSeconds || 0;
          setStartTime(existingProgress.watchedSeconds || 0); // add this
        } else {
          setIsCompleted(false);
        }
      } catch (err: any) {
        if (err?.response?.status === 403) {
          setError("You are not enrolled in this course.");
        } else {
          setError("Failed to load lesson.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [lessonId]);

  const startProgressTracking = useCallback(
    (cId: string) => {
      if (progressInterval.current) clearInterval(progressInterval.current);

      progressInterval.current = setInterval(async () => {
        watchedSecondsRef.current += 10;
        try {
          await updateProgressApi({
            courseId: cId,
            lessonId: lessonId!,
            watchedSeconds: watchedSecondsRef.current,
          });
        } catch {
          // silent — progress saving is best effort
        }
      }, 10000);
    },
    [lessonId],
  );

  useEffect(() => {
    if (!courseId) return;
    startProgressTracking(courseId);
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [courseId, startProgressTracking]);

  const handleMarkComplete = async () => {
    if (!lesson || !courseId) return;

    try {
      await markLessonCompleteApi({ lessonId: lessonId!, courseId });
      setIsCompleted(true);

      setProgress((prev) => {
        const exists = prev.some(
          (p) =>
            String((p.lesson as any)?._id || p.lesson) === String(lessonId),
        );
        if (exists) {
          return prev.map((p) =>
            String((p.lesson as any)?._id || p.lesson) === String(lessonId)
              ? { ...p, isCompleted: true }
              : p,
          );
        }
        return [...prev, { lesson: lessonId, isCompleted: true } as any];
      });

      if (nextLesson) {
        setTimeout(() => navigate(`/watch/${nextLesson._id}`), 1000);
      }
    } catch {
      // silent
    }
  };

  const isLessonCompleted = (id: string) =>
    progress.some(
      (p) =>
        String((p.lesson as any)?._id || p.lesson) === String(id) &&
        p.isCompleted,
    );

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const completedCount = allLessons.filter((l) =>
    isLessonCompleted(l._id),
  ).length;
  const progressPercent = allLessons.length
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm">Loading lesson...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">{error}</p>
          <Link
            to="/my-courses"
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            ← Back to my courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span className="text-sm font-bold text-white hidden sm:block">
              VeoLMS
            </span>
          </Link>
          <p className="text-sm font-medium text-white truncate max-w-xs hidden sm:block">
            {lesson?.title}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {allLessons.length > 0 && (
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">
                {progressPercent}% complete
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video + controls */}
        <div className="flex-1 flex flex-col overflow-auto">
          <div className="w-full bg-black">
            <div className="max-w-5xl mx-auto">
              <div className="aspect-video">
                {lesson?.youtubeVideoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}?rel=0&modestbranding=1&start=${startTime}`}
                    title={lesson.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <p className="text-gray-500 text-sm">Video not available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto w-full px-4 py-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-lg font-bold text-white mb-1">
                  {lesson?.title}
                </h1>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-medium">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Completed
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    prevLesson && navigate(`/watch/${prevLesson._id}`)
                  }
                  disabled={!prevLesson}
                  className="px-3 py-2 text-xs font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"
                >
                  ← Prev
                </button>

                {!isCompleted ? (
                  <button
                    onClick={handleMarkComplete}
                    className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                  >
                    Mark complete
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      nextLesson && navigate(`/watch/${nextLesson._id}`)
                    }
                    disabled={!nextLesson}
                    className="px-4 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"
                  >
                    Next lesson →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 shrink-0 bg-gray-900 border-l border-gray-800 overflow-y-auto hidden lg:block">
            <div className="px-4 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-white">
                Course curriculum
              </h2>
              {allLessons.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {completedCount} / {allLessons.length} lessons completed
                </p>
              )}
            </div>

            <div className="divide-y divide-gray-800">
              {curriculum.map((section) => (
                <div key={section._id}>
                  <button
                    onClick={() => toggleSection(section._id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800 transition"
                  >
                    <span className="text-xs font-medium text-gray-300 pr-2">
                      {section.title}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-gray-500 shrink-0 transition-transform ${openSections.includes(section._id) ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {openSections.includes(section._id) && (
                    <div>
                      {section.lessons.map((l) => {
                        const completed = isLessonCompleted(l._id);
                        const isCurrent = String(l._id) === String(lessonId);

                        return (
                          <button
                            key={l._id}
                            onClick={() => navigate(`/watch/${l._id}`)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                              isCurrent
                                ? "bg-indigo-600/20 border-l-2 border-indigo-500"
                                : "hover:bg-gray-800 border-l-2 border-transparent"
                            }`}
                          >
                            <div className="shrink-0">
                              {completed ? (
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              ) : (
                                <div
                                  className={`w-5 h-5 rounded-full border-2 ${isCurrent ? "border-indigo-400" : "border-gray-600"}`}
                                />
                              )}
                            </div>
                            <span
                              className={`text-xs leading-snug flex-1 ${isCurrent ? "text-white font-medium" : "text-gray-400"}`}
                            >
                              {l.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPage;
