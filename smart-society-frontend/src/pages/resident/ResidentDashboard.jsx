import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

const ResidentDashboard = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Protect route
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo"));

      if (!user || user.role !== "resident") {
        navigate("/", { replace: true });
      }
    } catch {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await API.get("/requests/my");
      setRequests(Array.isArray(res.data) ? res.data : []);

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 📊 Stats
  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === "pending").length,
      assigned: requests.filter(r => r.status === "assigned").length,
      inProgress: requests.filter(r => r.status === "in-progress").length,
      completed: requests.filter(r => r.status === "completed").length,
      paid: requests.filter(r => r.isPaid).length,
    };
  }, [requests]);

  // 📌 Recent requests
  const recentRequests = useMemo(() => {
    return [...requests].slice(0, 5);
  }, [requests]);

  if (loading) {
    return (
      <div className="mt-16 text-center text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Resident Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Track your service requests and progress.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* 📊 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-5">

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Assigned</p>
          <p className="text-3xl font-bold text-sky-600">{stats.assigned}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-3xl font-bold text-purple-600">{stats.inProgress}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.paid}</p>
        </div>

      </div>

      {/* 📌 Recent Requests */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm">

        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Recent Requests
        </h2>

        {recentRequests.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No requests yet
          </p>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <div
                key={req._id}
                className="flex justify-between items-center border rounded-xl p-4"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {req.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {req.service?.serviceType} • PKR {req.price}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${
                    req.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : req.status === "assigned"
                      ? "bg-sky-100 text-sky-700"
                      : req.status === "in-progress"
                      ? "bg-purple-100 text-purple-700"
                      : req.status === "otp-sent"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default ResidentDashboard;