import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCourseCurriculumApi } from "../../api/course.api";
import {
  createCourseApi,
  updateCourseApi,
  createSectionApi,
  updateSectionApi,
  deleteSectionApi,
  createLessonApi,
  updateLessonApi,
  deleteLessonApi,
} from "../../api/admin.api";

interface LessonForm {
  _id?: string;
  title: string;
  youtubeVideoId: string;
  duration: number;
  isPreview: boolean;
  order: number;
}

interface SectionForm {
  _id?: string;
  title: string;
  order: number;
  lessons: LessonForm[];
}

const LEVELS = ["beginner", "intermediate", "advanced"];

const emptyLesson = (order: number): LessonForm => ({
  title: "",
  youtubeVideoId: "",
  duration: 0,
  isPreview: false,
  order,
});

const emptySection = (order: number): SectionForm => ({
  title: "",
  order,
  lessons: [emptyLesson(1)],
});

const CourseForm = () => {
  const { id } = useParams<{ id: string }>(); // present only when editing
  const navigate = useNavigate();
  const isEditing = !!id;

  // Course fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [level, setLevel] = useState("beginner");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("English");
  const [thumbnail, setThumbnail] = useState("");

  // Curriculum
  const [sections, setSections] = useState<SectionForm[]>([emptySection(1)]);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [error, setError] = useState("");

  // If editing, fetch the existing course data
  useEffect(() => {
    if (!isEditing || !id) return;

    const fetchCourse = async () => {
      try {
        setIsFetching(true);
        // id in params is actually the course _id for edit
        // we use a workaround: fetch by ID via admin — for now use slug
        // In practice, store the _id in the route and fetch accordingly
        const curriculumRes = await getCourseCurriculumApi(id);
        const curriculum = curriculumRes.data.data.curriculum;

        // populate sections state from existing curriculum
        if (curriculum.length > 0) {
          setSections(
            curriculum.map((s: any) => ({
              _id: s._id,
              title: s.title,
              order: s.order,
              lessons:
                s.lessons.length > 0
                  ? s.lessons.map((l: any) => ({
                      _id: l._id,
                      title: l.title,
                      youtubeVideoId: l.youtubeVideoId || "",
                      duration: l.duration || 0,
                      isPreview: l.isPreview || false,
                      order: l.order,
                    }))
                  : [emptyLesson(1)],
            })),
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCourse();
  }, [id, isEditing]);

  // ── Course field handlers ──────────────────────────────

  const handleCourseSubmit = async () => {
    if (!title || !description || !category || !level) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let courseId = id;

      if (!isEditing) {
        // Create course first
        const res = await createCourseApi({
          title,
          description,
          price,
          level,
          category,
          language,
          thumbnail,
        } as any);
        courseId = res.data.data.course._id;
      } else {
        // Update existing course
        await updateCourseApi(id!, {
          title,
          description,
          price,
          level,
          category,
          language,
          thumbnail,
        } as any);
      }

      // Save curriculum (sections + lessons)
      for (const section of sections) {
        let sectionId = section._id;

        if (!sectionId) {
          // create new section
          const sRes = await createSectionApi({
            title: section.title,
            order: section.order,
            course: courseId!,
          });
          sectionId = sRes.data.data.section._id;
        } else {
          // update existing section
          await updateSectionApi(sectionId, {
            title: section.title,
            order: section.order,
          });
        }

        // save lessons under this section
        for (const lesson of section.lessons) {
          if (!lesson._id) {
            await createLessonApi({
              title: lesson.title,
              youtubeVideoId: lesson.youtubeVideoId,
              duration: lesson.duration,
              isPreview: lesson.isPreview,
              order: lesson.order,
              section: sectionId!,
            });
          } else {
            await updateLessonApi(lesson._id, {
              title: lesson.title,
              youtubeVideoId: lesson.youtubeVideoId,
              duration: lesson.duration,
              isPreview: lesson.isPreview,
              order: lesson.order,
            });
          }
        }
      }

      navigate("/admin/courses");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Section handlers ──────────────────────────────────

  const addSection = () => {
    setSections((prev) => [...prev, emptySection(prev.length + 1)]);
  };

  const updateSection = (
    index: number,
    field: keyof SectionForm,
    value: any,
  ) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const removeSection = async (index: number) => {
    const section = sections[index];
    if (section._id) {
      try {
        await deleteSectionApi(section._id);
      } catch (err) {
        console.error(err);
      }
    }
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Lesson handlers ───────────────────────────────────

  const addLesson = (sectionIndex: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? { ...s, lessons: [...s.lessons, emptyLesson(s.lessons.length + 1)] }
          : s,
      ),
    );
  };

  const updateLesson = (
    sectionIndex: number,
    lessonIndex: number,
    field: keyof LessonForm,
    value: any,
  ) => {
    setSections((prev) =>
      prev.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              lessons: s.lessons.map((l, li) =>
                li === lessonIndex ? { ...l, [field]: value } : l,
              ),
            }
          : s,
      ),
    );
  };

  const removeLesson = async (sectionIndex: number, lessonIndex: number) => {
    const lesson = sections[sectionIndex].lessons[lessonIndex];
    if (lesson._id) {
      try {
        await deleteLessonApi(lesson._id);
      } catch (err) {
        console.error(err);
      }
    }
    setSections((prev) =>
      prev.map((s, si) =>
        si === sectionIndex
          ? { ...s, lessons: s.lessons.filter((_, li) => li !== lessonIndex) }
          : s,
      ),
    );
  };

  if (isFetching) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit course" : "Create new course"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditing
              ? "Update course details and curriculum"
              : "Fill in the details and build your curriculum"}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <svg
              className="w-4 h-4 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Course details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">
            Course details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. React for Beginners"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn?"
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. React, JavaScript"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0 for free"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Language
                </label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="English"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Thumbnail URL
              </label>
              <input
                type="url"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="Thumbnail preview"
                  className="mt-2 h-24 rounded-xl object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Curriculum builder */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Curriculum</h2>
            <button
              onClick={addSection}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition"
            >
              + Add section
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((section, si) => (
              <div
                key={si}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                {/* Section header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-400 shrink-0">
                    Section {si + 1}
                  </span>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(si, "title", e.target.value)}
                    placeholder="Section title"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  {sections.length > 1 && (
                    <button
                      onClick={() => removeSection(si)}
                      className="text-xs text-red-500 hover:text-red-600 shrink-0 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Lessons */}
                <div className="p-4 space-y-3">
                  {section.lessons.map((lesson, li) => (
                    <div
                      key={li}
                      className="bg-gray-50 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          Lesson {li + 1}
                        </span>
                        {section.lessons.length > 1 && (
                          <button
                            onClick={() => removeLesson(si, li)}
                            className="text-xs text-red-500 hover:text-red-600 transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) =>
                          updateLesson(si, li, "title", e.target.value)
                        }
                        placeholder="Lesson title"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                      />

                      <input
                        type="text"
                        value={lesson.youtubeVideoId}
                        onChange={(e) =>
                          updateLesson(si, li, "youtubeVideoId", e.target.value)
                        }
                        placeholder="YouTube video ID (e.g. dQw4w9WgXcQ)"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                      />

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <input
                            type="number"
                            min={0}
                            value={lesson.duration}
                            onChange={(e) =>
                              updateLesson(
                                si,
                                li,
                                "duration",
                                Number(e.target.value),
                              )
                            }
                            placeholder="Duration (seconds)"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                          />
                        </div>

                        {/* Preview toggle */}
                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={lesson.isPreview}
                            onChange={(e) =>
                              updateLesson(
                                si,
                                li,
                                "isPreview",
                                e.target.checked,
                              )
                            }
                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-gray-600">
                            Free preview
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => addLesson(si)}
                    className="w-full py-2 text-xs font-medium text-indigo-600 border border-dashed border-indigo-300 hover:bg-indigo-50 rounded-xl transition"
                  >
                    + Add lesson
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => navigate("/admin/courses")}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCourseSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed rounded-xl transition flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
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
                Saving...
              </>
            ) : isEditing ? (
              "Save changes"
            ) : (
              "Create course"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;
