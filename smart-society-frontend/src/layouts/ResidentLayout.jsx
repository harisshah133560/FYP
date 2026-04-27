import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const ResidentLayout = () => {
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
    if (!user || user.role !== "resident") {
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
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-blue-800 text-white p-5 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold">Resident Panel</h2>

        <nav className="space-y-2">
          <NavLink to="/resident/dashboard" className={linkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/resident/create-request" className={linkClass}>
            Create Request
          </NavLink>

          <NavLink to="/resident/my-requests" className={linkClass}>
            My Requests
          </NavLink>

          <NavLink to="/resident/rating" className={linkClass}>
            Rate Service
          </NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 w-full rounded-lg border border-red-300 px-3 py-2 text-left text-sm font-medium text-red-200 transition hover:bg-red-500 hover:text-white"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ResidentLayout;