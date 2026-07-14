import { useEffect, useState } from "react";
import { getAllStudentsApi, deleteStudentApi } from "../../api/admin.api";
import type { IUser } from "../../types";

const ManageStudents = () => {
  const [students, setStudents] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const {
          data: { data },
        } = await getAllStudentsApi();
        setStudents(data.students);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove student "${name}"? This cannot be undone.`)) return;
    try {
      await deleteStudentApi(id);
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete student.");
    }
  };

  // client-side search filter — no extra API call needed for small lists
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage students</h1>
          <p className="text-gray-500 text-sm mt-1">
            {students.length} registered students
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 relative max-w-sm">
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <p className="text-gray-500 text-sm">
              {search
                ? "No students match your search."
                : "No students registered yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    Student
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden md:table-cell">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition">
                    {/* Avatar + name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-indigo-600">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-400 sm:hidden">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-xs text-gray-600">{student.email}</p>
                    </td>

                    <td className="px-5 py-4 hidden md:table-cell">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          student.isVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {student.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() =>
                            handleDelete(student._id, student.name)
                          }
                          className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition"
                        >
                          Remove
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

export default ManageStudents;
