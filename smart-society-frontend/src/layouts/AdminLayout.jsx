
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    setLoading(false);
  }, [navigate, user]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-white/20 text-white"
        : "text-blue-100 hover:bg-white/10 hover:text-white"
    }`;

  if (loading) {
    return <div className="p-6 text-gray-700">Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">

      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col overflow-y-auto bg-blue-900 p-5 text-white shadow-lg">

        <h2 className="mb-6 text-2xl font-bold">
          Admin Panel
        </h2>

        <nav className="flex-1 space-y-2">
          <NavLink to="/admin/dashboard" className={linkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/admin/users" className={linkClass}>
            Manage Users
          </NavLink>

          <NavLink to="/admin/services" className={linkClass}>
            Manage Services
          </NavLink>

          <NavLink to="/admin/assign" className={linkClass}>
            Assign Worker
          </NavLink>

          <NavLink to="/admin/create-worker" className={linkClass}>
            Create Worker
          </NavLink>

          <NavLink to="/admin/workers" className={linkClass}>
            Workers
          </NavLink>

          <NavLink to="/admin/reports" className={linkClass}>
            Reports
          </NavLink>

          <NavLink to="/admin/payments" className={linkClass}>
            Payments
          </NavLink>

          <NavLink to="/admin/worker-ratings" className={linkClass}>
            Worker Ratings
          </NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 w-full shrink-0 rounded-lg border border-red-300 px-3 py-2 text-left text-sm font-medium text-red-200 transition hover:bg-red-500 hover:text-white"
        >
          Logout
        </button>

      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
