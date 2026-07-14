import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminStatsApi, getAllEnrollmentsApi } from "../../api/admin.api";
import type { IEnrollment } from "../../types";

interface Stats {
  students: number;
  courses: number;
  enrollments: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<IEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, enrollRes] = await Promise.all([
          getAdminStatsApi(),
          getAllEnrollmentsApi(),
        ]);
        setStats(statsRes.data.data);
        // show only 5 most recent enrollments on dashboard
        setRecentEnrollments(enrollRes.data.data.enrollments.slice(0, 5));
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

  const statCards = [
    {
      label: "Total students",
      value: stats?.students ?? 0,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total courses",
      value: stats?.courses ?? 0,
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Total enrollments",
      value: stats?.enrollments ?? 0,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total revenue",
      // revenue is stored in paise — divide by 100 to get rupees
      value: `₹${((stats?.totalRevenue ?? 0) / 100).toLocaleString("en-IN")}`,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">Overview of your LMS</p>
          </div>
          <Link
            to="/admin/courses/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
          >
            + New course
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-200 p-5"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.color}`}
              >
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Link
            to="/admin/courses"
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Manage courses
            </p>
            <p className="text-xs text-gray-500">
              Create, edit, and publish courses
            </p>
          </Link>
          <Link
            to="/admin/students"
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Manage students
            </p>
            <p className="text-xs text-gray-500">
              View and manage student accounts
            </p>
          </Link>
          <Link
            to="/admin/courses/new"
            className="bg-indigo-600 rounded-2xl p-5 hover:bg-indigo-700 transition-all duration-200"
          >
            <p className="text-sm font-semibold text-white mb-1">
              Create new course
            </p>
            <p className="text-xs text-indigo-200">
              Add a new course to the catalog
            </p>
          </Link>
        </div>

        {/* Recent enrollments */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Recent enrollments
          </h2>

          {recentEnrollments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
              <p className="text-gray-500 text-sm">No enrollments yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                      Student
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                      Course
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentEnrollments.map((enrollment) => {
                    const student = enrollment.student as any;
                    const course = enrollment.course as any;

                    return (
                      <tr
                        key={enrollment._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-indigo-600">
                                {student?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-900">
                                {student?.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {student?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-xs text-gray-700 line-clamp-1">
                            {course?.title}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              enrollment.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-xs text-gray-400">
                            {new Date(enrollment.enrolledAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
