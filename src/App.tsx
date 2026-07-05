import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminRoute from "./components/layout/AdminRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";

// Public pages
const CourseDetailPage = () => <div>Course Detail</div>;

// Student pages
const StudentDashboard = () => <div>Student Dashboard</div>;
const MyCoursesPage = () => <div>My Courses</div>;
const WatchPage = () => <div>Watch</div>;

// Admin pages
const AdminDashboard = () => <div>Admin Dashboard</div>;
const ManageCourses = () => <div>Manage Courses</div>;
const CourseForm = () => <div>Course Form</div>;
const ManageStudents = () => <div>Manage Students</div>;

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
