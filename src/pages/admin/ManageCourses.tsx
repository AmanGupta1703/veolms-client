import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCoursesApi } from "../../api/course.api";
import { deleteCourseApi, togglePublishApi } from "../../api/admin.api";
import type { ICourse } from "../../types";

const ManageCourses = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      // fetch ALL courses including unpublished for admin
      // we need a separate admin endpoint ideally, but for now
      // we fetch published and show all from DB via admin context
      const {
        data: { data },
      } = await getAllCoursesApi();
      setCourses(data.courses);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteCourseApi(id);
      // remove from local state without refetching
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete course.");
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await togglePublishApi(id);
      // flip isPublished locally without refetching
      setCourses((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, isPublished: !c.isPublished } : c,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage courses</h1>
            <p className="text-gray-500 text-sm mt-1">
              {courses.length} courses
            </p>
          </div>
          <Link
            to="/admin/courses/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
          >
            + New course
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <p className="text-gray-500 text-sm mb-4">No courses yet.</p>
            <Link
              to="/admin/courses/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
            >
              Create your first course
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    Course
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden md:table-cell">
                    Price
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50 transition">
                    {/* Course title + thumbnail */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 shrink-0 overflow-hidden">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-indigo-300"
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
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                            {course.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {course.level}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-xs text-gray-600">
                        {course.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-xs font-medium text-gray-900">
                        {!course.price ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `₹${course.price}`
                        )}
                      </span>
                    </td>

                    {/* Publish toggle */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleTogglePublish(course._id)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full transition ${
                          course.isPublished
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/courses/${course._id}/edit`}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-lg transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(course._id, course.title)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCourses;
