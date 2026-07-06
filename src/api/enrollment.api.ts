import api from "./axios";
import type { IEnrollment } from "../types";

export const getMyCoursesApi = () =>
  api.get<{ data: { enrollments: IEnrollment[] } }>("/enrollments/my-courses");

export const checkEnrollmentApi = (courseId: string) =>
  api.get<{ data: { isEnrolled: boolean } }>(`/enrollments/${courseId}/check`);
