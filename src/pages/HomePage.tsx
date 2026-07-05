import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCoursesApi } from "../api/course.api";
import CourseCard from "../components/course/CourseCard";
import type { ICourse } from "../types";

const stats = [
  { label: "Students enrolled", value: "10,000+" },
  { label: "Expert instructors", value: "50+" },
  { label: "Courses available", value: "100+" },
  { label: "Hours of content", value: "500+" },
];

const HomePage = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [requestState, setRequestState] = useState({
    isLoading: false,
    error: "",
  });

  useEffect(() => {
    async function fetchCourses() {
      try {
        setRequestState({ isLoading: true, error: "" });
        const {
          data: { data },
        } = await getAllCoursesApi();
        setCourses(data.courses);
      } catch (err) {
        setRequestState((prev) => ({
          ...prev,
          error: err?.message || "Something went wrong.",
        }));
      } finally {
        setRequestState((prev) => ({ ...prev, isLoading: false }));
      }
    }
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              Learn at your own pace
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
              Build real skills,{" "}
              <span className="text-indigo-600">ship real projects</span>
            </h1>

            <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
              Learn web development from experienced instructors. Practical
              courses designed to take you from beginner to job-ready.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
              >
                Get started free
              </Link>
              <Link
                to="/courses"
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-300 transition"
              >
                Browse courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-indigo-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Featured courses
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Hand-picked courses to get you started
            </p>
          </div>
          <Link
            to="/courses"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition hidden sm:block"
          >
            View all →
          </Link>
        </div>

        {/* Loading */}
        {requestState.isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {requestState.error && !requestState.isLoading && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">{requestState.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 transition"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!requestState.isLoading &&
          !requestState.error &&
          courses.length === 0 && (
            <div className="text-center py-16">
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
              <p className="text-gray-500 text-sm">
                Check back soon — new courses are being added.
              </p>
            </div>
          )}

        {/* Grid */}
        {!requestState.isLoading && courses.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            {courses.length > 6 && (
              <div className="text-center mt-10">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition"
                >
                  View all {courses.length} courses →
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Ready to start learning?
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
            Join thousands of students already learning on VeoLMS. Create your
            free account today.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
          >
            Create free account →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
