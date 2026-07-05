import { Link } from "react-router-dom";
import type { ICourse } from "../../types";

interface CourseCardProps {
  course: ICourse;
}

const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category + Level */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-indigo-600 font-medium">
            {course.category}
          </span>
          <span className="text-gray-300">·</span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[course.level] ?? "bg-gray-100 text-gray-600"}`}
          >
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-gray-100">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            {course.instructor?.avatar ? (
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-indigo-600">
                {course.instructor?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 truncate">
            {course.instructor?.name}
          </span>

          {/* Price */}
          <span className="ml-auto text-sm font-bold text-gray-900 shrink-0">
            {!course.price ? (
              <span className="text-green-600">Free</span>
            ) : (
              `₹${course.price}`
            )}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
