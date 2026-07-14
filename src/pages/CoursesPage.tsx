import { useEffect, useState } from "react";
import { getAllCoursesApi } from "../api/course.api";
import CourseCard from "../components/course/CourseCard";
import type { ICourse } from "../types";

const levels = ["All", "beginner", "intermediate", "advanced"];

const CoursesPage = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCourses = async (params: {
    search?: string;
    level?: string;
    category?: string;
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const {
        data: { data },
      } = await getAllCoursesApi(params);
      setCourses(data.courses);

      // extract unique categories from results
      const unique = [...new Set(data.courses.map((c) => c.category))];
      setCategories(unique);
    } catch (err: any) {
      setError(err?.message || "Failed to load courses.");
    } finally {
      setIsLoading(false);
    }
  };

  // initial fetch
  useEffect(() => {
    const fetchCoursesData = async () => await fetchCourses({});
    fetchCoursesData();
  }, []);

  // debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses({
        search: search || undefined,
        level: level || undefined,
        category: category || undefined,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [search, level, category]);

  const clearFilters = () => {
    setSearch("");
    setLevel("");
    setCategory("");
  };

  const hasActiveFilters = search || level || category;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">All courses</h1>
          <p className="text-gray-500 text-sm">
            {isLoading
              ? "Loading..."
              : `${courses.length} course${courses.length === 1 ? "" : "s"} available`}
          </p>

          {/* Search */}
          <div className="mt-6 relative max-w-xl">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* Level filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l === "All" ? "" : l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    (l === "All" && !level) || level === l
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>

            {/* Category filter */}
            {categories.length > 0 && (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-indigo-600 hover:text-indigo-500 font-medium transition"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Skeleton loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
        {error && !isLoading && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm">{error}</p>
            <button
              onClick={() => fetchCourses({})}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 transition"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && courses.length === 0 && (
          <div className="text-center py-20">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-gray-900 font-medium mb-1">No courses found</h3>
            <p className="text-gray-500 text-sm mb-4">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
