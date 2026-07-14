import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCoursesApi } from "../../api/enrollment.api";
import type { IEnrollment } from "../../types";

const MyCoursesPage = () => {
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const {
          data: { data },
        } = await getMyCoursesApi();
        setEnrollments(data.enrollments);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnrollments();
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My courses</h1>
          <p className="text-gray-500 text-sm mt-1">
            {enrollments.length} course{enrollments.length !== 1 ? "s" : ""}{" "}
            enrolled
          </p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-gray-400"
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
            <p className="text-gray-500 text-sm mb-6">
              You haven't enrolled in any courses yet.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const course = enrollment.course as any;

              return (
                <div
                  key={enrollment._id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col"
                >
                  {/* Thumbnail */}
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
                          className="w-10 h-10 text-indigo-300"
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

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-indigo-600 font-medium mb-1">
                      {course?.category}
                    </p>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3">
                      {course?.title}
                    </h3>

                    <div className="mt-auto flex items-center gap-2">
                      <Link
                        to={`/courses/${course?.slug}`}
                        className="flex-1 text-center py-2 text-xs font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-lg transition"
                      >
                        View course
                      </Link>
                      <Link
                        to={`/watch/${course?._id}`}
                        className="flex-1 text-center py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                      >
                        Continue →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
