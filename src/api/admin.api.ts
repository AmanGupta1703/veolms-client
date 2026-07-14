import api from "./axios";
import type { IUser, IEnrollment } from "../types";

export const getAdminStatsApi = () =>
  api.get<{
    data: {
      students: number;
      courses: number;
      enrollments: number;
      totalRevenue: number;
    };
  }>("/admin/stats");

export const getAllStudentsApi = () =>
  api.get<{ data: { students: IUser[] } }>("/admin/students");

export const getAllEnrollmentsApi = () =>
  api.get<{ data: { enrollments: IEnrollment[] } }>("/admin/enrollments");

export const deleteStudentApi = (id: string) =>
  api.delete(`/admin/students/${id}`);

export const createCourseApi = (data: FormData) => api.post("/courses", data);

export const updateCourseApi = (id: string, data: FormData) =>
  api.put(`/courses/${id}`, data);

export const deleteCourseApi = (id: string) => api.delete(`/courses/${id}`);

export const createSectionApi = (data: {
  title: string;
  order: number;
  course: string;
}) => api.post("/sections", data);

export const updateSectionApi = (
  id: string,
  data: { title: string; order: number },
) => api.put(`/sections/${id}`, data);

export const deleteSectionApi = (id: string) => api.delete(`/sections/${id}`);

export const createLessonApi = (data: {
  title: string;
  youtubeVideoId: string;
  order: number;
  section: string;
  isPreview: boolean;
  duration: number;
}) => api.post("/lessons", data);

export const updateLessonApi = (
  id: string,
  data: {
    title: string;
    youtubeVideoId: string;
    order: number;
    isPreview: boolean;
    duration: number;
  },
) => api.put(`/lessons/${id}`, data);

export const deleteLessonApi = (id: string) => api.delete(`/lessons/${id}`);

export const togglePublishApi = (id: string) =>
  api.patch(`/courses/${id}/publish`);
