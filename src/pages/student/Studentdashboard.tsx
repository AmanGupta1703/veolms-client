import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCoursesApi } from "../../api/enrollment.api";
import { getRecentlyWatchedApi } from "../../api/progress.api";
import { useAuthStore } from "../../store/authStore";
import type { IEnrollment, IProgress } from "../../types";

const StudentDashboard = () => {
  const { user } = useAuthStore();

  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<IProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // fetch both simultaneously — faster than sequential awaits
        const [enrollRes, recentRes] = await Promise.all([
          getMyCoursesApi(),
          getRecentlyWatchedApi(),
        ]);
        setEnrollments(enrollRes.data.data.enrollments);
        setRecentlyWatched(recentRes.data.data.lessons);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg
          className="w-6 h-6 animate-spin text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
        >
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Pick up where you left off.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Enrolled courses</p>
            <p className="text-3xl font-bold text-gray-900">
              {enrollments.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Recently watched</p>
            <p className="text-3xl font-bold text-gray-900">
              {recentlyWatched.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500 mb-1">Keep learning</p>
            <p className="text-sm font-medium text-indigo-600 mt-1">
              {recentlyWatched.length > 0
                ? "Continue where you left off →"
                : "Start a course today →"}
            </p>
          </div>
        </div>

        {/* Continue learning */}
        {recentlyWatched.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Continue learning
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyWatched.map((item) => {
                // lesson and course are populated objects from the backend
                const lesson = item.lesson as any;
                const course = item.course as any;

                return (
                  <Link
                    key={item._id}
                    to={`/watch/${lesson?._id}`}
                    className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex gap-4"
                  >
                    {/* Course thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-indigo-50 shrink-0 overflow-hidden">
                      {course?.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-indigo-300"
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

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 truncate mb-0.5">
                        {course?.title}
                      </p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {lesson?.title}
                      </p>
                      <p className="text-xs text-indigo-600 mt-1">Resume →</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* My courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">My courses</h2>
            <Link
              to="/my-courses"
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              View all
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-gray-900 font-medium mb-1">No courses yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Browse our catalog and start learning today.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
              >
                Browse courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.slice(0, 3).map((enrollment) => {
                const course = enrollment.course as any;
                return (
                  <Link
                    key={enrollment._id}
                    to={`/courses/${course?.slug}`}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      {course?.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                          <svg
                            className="w-8 h-8 text-indigo-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                        {course?.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {course?.category}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
