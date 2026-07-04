export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  avatar?: string;
  isVerified: boolean;
}

export interface ICourse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  language: string;
  isPublished: boolean;
  instructor: IUser;
  totalDuration: number;
}

export interface ISection {
  _id: string;
  title: string;
  order: number;
  course: ICourse;
}

export interface ILesson {
  _id: string;
  title: string;
  youtubeVideoId?: string;
  duration: number;
  isPreview: boolean;
  order: number;
  section: ISection;
}

export interface IEnrollment {
  _id: string;
  student: IUser;
  course: ICourse;
  status: "active" | "cancelled";
  enrolledAt: Date;
}

export interface IProgress {
  _id: string;
  student: IUser;
  course: ICourse;
  lesson: ILesson;
  isCompleted: boolean;
  watchedSeconds: number;
  lastWatchedAt: Date;
}
