import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import NotFound from "./pages/NotFound";

// Dashboard Layouts
import DashboardLayout from "./components/layout/DashboardLayout";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import SubmitProposal from "./pages/student/SubmitProposal";
import UploadFiles from "./pages/student/UploadFiles";
import SupervisorPage from "./pages/student/SupervisorPage";
import FeedbackPage from "./pages/student/FeedbackPage";
import NotificationsPage from "./pages/student/NotificationsPage";

// Supervisor Pages
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import PendingRequests from "./pages/supervisor/PendingRequests";
import AssignedStudents from "./pages/supervisor/AssignedStudents";
import SupervisorFiles from "./pages/supervisor/SupervisorFiles";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageSupervisors from "./pages/admin/ManageSupervisors";
import AssignSupervisor from "./pages/admin/AssignSupervisor";
import DeadlinesPage from "./pages/admin/DeadlinesPage";
import ProjectsPage from "./pages/admin/ProjectsPage";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./store/slices/authSlice";
import { Loader } from "lucide-react";
import { getAllProjects, getAllUsers } from "./store/slices/adminSlice";
import { fetchDashboardStats } from "./store/slices/studentSlice";
import { Analytics } from "@vercel/analytics/react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const authUser = useSelector((state) => state.auth.authUser);

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(authUser.role)) {
    return <Navigate to={`/${authUser.role}`} replace />;
  }

  return children;
};

const App = () => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // On app load, check if user is authenticated
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (authUser?.role === "Student") {
      dispatch(fetchDashboardStats());
    }
  }, [authUser]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader className="w-12 h-12 text-slate-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Default Route */}
          {/* Default Route */}
          <Route
            path="/"
            element={
              authUser ? (
                <Navigate to={`/${authUser.role}`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              authUser ? (
                <Navigate to={`/${authUser.role}`} replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              authUser ? (
                <Navigate to={`/${authUser.role}`} replace />
              ) : (
                <ForgotPasswordPage />
              )
            }
          />
          <Route
            path="/reset-password"
            element={
              authUser ? (
                <Navigate to={`/${authUser.role}`} replace />
              ) : (
                <ResetPasswordPage />
              )
            }
          />

          {/* Student Routes Protected Dashboard Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <DashboardLayout userRole={"Student"} />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="submit-proposal" element={<SubmitProposal />} />
            <Route path="upload-files" element={<UploadFiles />} />
            <Route path="supervisor" element={<SupervisorPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Supervisor Routes */}
          <Route
            path="/supervisor/*"
            element={
              <ProtectedRoute allowedRoles={["Supervisor"]}>
                <DashboardLayout userRole={"Supervisor"} />
              </ProtectedRoute>
            }
          >
            <Route index element={<SupervisorDashboard />} />
            <Route path="pending-requests" element={<PendingRequests />} />
            <Route path="assigned-students" element={<AssignedStudents />} />
            <Route path="files" element={<SupervisorFiles />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout userRole={"Admin"} />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="supervisors" element={<ManageSupervisors />} />
            <Route path="assign-supervisor" element={<AssignSupervisor />} />
            <Route path="deadlines" element={<DeadlinesPage />} />
            <Route path="projects" element={<ProjectsPage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      </BrowserRouter>
    </>
  );
};

export default App;
