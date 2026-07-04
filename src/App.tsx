import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminRoute from "./components/layout/AdminRoute";

// Public pages
const HomePage = () => <div>Home</div>;
const CoursesPage = () => <div>Courses</div>;
const CourseDetailPage = () => <div>Course Detail</div>;
const LoginPage = () => <div>Login</div>;
const SignupPage = () => <div>Signup</div>;

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
  );
};

export default App;
