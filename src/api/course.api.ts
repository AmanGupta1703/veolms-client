import api from "./axios";
import type { ICourse } from "../types";

export const getAllCoursesApi = (params?: {
  category?: string;
  level?: string;
  search?: string;
}) => api.get<{ data: { courses: ICourse[] } }>("/courses", { params });

export const getCourseBySlugApi = (slug: string) =>
  api.get<{ data: { course: ICourse } }>(`/courses/${slug}`);

export const getCourseCurriculum = (id: string) =>
  api.get(`/courses/${id}/curriculum`);
