import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminLayout from "./layouts/AdminLayout";
import ResidentLayout from "./layouts/ResidentLayout";
import WorkerLayout from "./layouts/WorkerLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ResidentDashboard from "./pages/resident/ResidentDashboard";
import WorkerDashboard from "./pages/worker/WorkerDashboard";

import CreateRequest from "./pages/resident/CreateRequest";
import MyRequests from "./pages/resident/MyRequests";

import AssignWorker from "./pages/admin/AssignWorker";
import MyJobs from "./pages/worker/MyJobs";

import Rating from "./pages/resident/Rating";

import Reports from "./pages/admin/Reports";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageServices from "./pages/admin/ManageServices";
import CreateWorker from "./pages/admin/CreateWorker";
import Workers from "./pages/admin/Workers";
import WorkerRatings from "./pages/admin/WorkerRatings";

function App() {
  return (
    <Router>
      <Routes>

        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="assign" element={<AssignWorker />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="create-worker" element={<CreateWorker />} />
          <Route path="workers" element={<Workers />} />
          <Route path="worker-ratings" element={<WorkerRatings />} />
        </Route>

        {/* Resident Routes */}
        <Route path="/resident" element={<ResidentLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<ResidentDashboard />} />
          <Route path="create-request" element={<CreateRequest />} />
          <Route path="my-requests" element={<MyRequests />} />
          <Route path="rating" element={<Rating />} />
        </Route>

        {/* Worker Routes */}
        <Route path="/worker" element={<WorkerLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="jobs" element={<MyJobs />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;