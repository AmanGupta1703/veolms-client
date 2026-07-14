import api from "./axios";
import type { IProgress } from "../types";

export const updateProgressApi = (data: {
  courseId: string;
  lessonId: string;
  watchedSeconds: number;
}) => api.post("/progress/update", data);

export const markLessonCompleteApi = (data: {
  lessonId: string;
  courseId: string;
}) => api.post("/progress/complete", data);

export const getCourseProgressApi = (courseId: string) =>
  api.get<{ data: { progress: IProgress[] } }>(`/progress/${courseId}`);

export const getRecentlyWatchedApi = () =>
  api.get<{ data: { lessons: IProgress[] } }>("/progress/recent");
