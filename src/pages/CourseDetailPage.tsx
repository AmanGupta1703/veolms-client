import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourseBySlugApi, getCourseCurriculumApi } from "../api/course.api";
import { checkEnrollmentApi } from "../api/enrollment.api";
import type { ICourse, ISection, ILesson } from "../types";
import { useAuthStore } from "../store/authStore";
import { useRazorpay } from "../hooks/useRazorpay";

interface CurriculumSection extends ISection {
  lessons: ILesson[];
}

const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
};

const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { initiatePayment } = useRazorpay();

  const [course, setCourse] = useState<ICourse | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumSection[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchAll = async () => {
      try {
        setIsLoading(true);
        setError("");

        const {
          data: { data },
        } = await getCourseBySlugApi(slug);
        setCourse(data.course);

        const curriculumRes = await getCourseCurriculumApi(data.course._id);
        setCurriculum(curriculumRes.data.data.curriculum);

        // open first section by default
        if (curriculumRes.data.data.curriculum.length > 0) {
          setOpenSections([curriculumRes.data.data.curriculum[0]._id]);
        }

        if (isAuthenticated) {
          const enrollRes = await checkEnrollmentApi(data.course._id);
          setIsEnrolled(enrollRes.data.data.isEnrolled);
        }
      } catch {
        setError("Course not found.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [slug, isAuthenticated]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const totalLessons = curriculum.reduce((acc, s) => acc + s.lessons.length, 0);
  const totalDuration = curriculum.reduce(
    (acc, s) => acc + s.lessons.reduce((a, l) => a + (l.duration || 0), 0),
    0,
  );

  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!course) return;
    if (isEnrolled) {
      navigate(`/watch/${curriculum[0]?.lessons[0]?._id}`);
      return;
    }
    if (!course.price) return;
    try {
      await initiatePayment(course._id, course.title);
    } catch {
      alert("Payment failed. Please try again.");
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-48 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Course not found
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            This course may have been removed or is no longer available.
          </p>
          <Link
            to="/courses"
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            ← Back to courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left — course info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-indigo-600 font-medium">
                  {course.category}
                </span>
                <span className="text-gray-300">·</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[course.level]}`}
                >
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {course.title}
              </h1>

              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {course.description}
              </p>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  {course.instructor?.avatar ? (
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-indigo-600">
                      {course.instructor?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Instructor</p>
                  <p className="text-sm font-medium text-gray-900">
                    {course.instructor?.name}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  {totalLessons} lessons
                </span>
                {totalDuration > 0 && (
                  <span className="flex items-center gap-1.5">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatDuration(totalDuration)}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
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
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  {course.language}
                </span>
              </div>
            </div>

            {/* Right — purchase card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-5">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                      <svg
                        className="w-10 h-10 text-indigo-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900">
                    {!course.price ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${course.price}`
                    )}
                  </span>
                </div>

                {/* CTA */}
                <button
                  onClick={handleEnrollClick}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition mb-3"
                >
                  {isEnrolled
                    ? "Continue learning →"
                    : !course.price
                      ? "Enroll for free"
                      : `Enroll for ₹${course.price}`}
                </button>

                {!isAuthenticated && (
                  <p className="text-center text-xs text-gray-400">
                    <Link
                      to="/login"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      Sign in
                    </Link>{" "}
                    to enroll
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Course curriculum
          </h2>

          {curriculum.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No curriculum available yet.
            </p>
          ) : (
            <div className="space-y-3">
              {curriculum.map((section) => (
                <div
                  key={section._id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section._id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${openSections.includes(section._id) ? "rotate-90" : ""}`}
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
                      <span className="text-sm font-medium text-gray-900">
                        {section.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-4">
                      {section.lessons.length} lesson
                      {section.lessons.length !== 1 ? "s" : ""}
                    </span>
                  </button>

                  {/* Lessons */}
                  {openSections.includes(section._id) && (
                    <div className="border-t border-gray-100 divide-y divide-gray-100">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson._id}
                          className="flex items-center gap-3 px-5 py-3"
                        >
                          <div className="shrink-0">
                            {lesson.isPreview ? (
                              <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center">
                                <svg
                                  className="w-3.5 h-3.5 text-indigo-600"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg
                                  className="w-3.5 h-3.5 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          <span className="text-sm text-gray-700 flex-1">
                            {lesson.title}
                          </span>

                          <div className="flex items-center gap-3 shrink-0">
                            {lesson.isPreview && (
                              <span className="text-xs text-indigo-600 font-medium">
                                Preview
                              </span>
                            )}
                            {lesson.duration > 0 && (
                              <span className="text-xs text-gray-400">
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
