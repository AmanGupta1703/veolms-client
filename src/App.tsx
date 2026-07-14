import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminRoute from "./components/layout/AdminRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import WatchPage from "./pages/WatchPage";
import StudentDashboard from "./pages/student/Studentdashboard";
import MyCoursesPage from "./pages/student/MyCoursesPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageCourses from "./pages/admin/ManageCourses";
import ManageStudents from "./pages/admin/ManageStudents";
import CourseForm from "./pages/admin/CourseForm";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Student — protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/watch/:lessonId" element={<WatchPage />} />
        </Route>

        {/* Admin — protected + admin role */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/courses/new" element={<CourseForm />} />
          <Route path="/admin/courses/:id/edit" element={<CourseForm />} />
          <Route path="/admin/student" element={<ManageStudents />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
