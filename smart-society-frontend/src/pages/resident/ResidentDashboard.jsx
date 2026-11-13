
import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import CreateRequest from "./CreateRequest";

const ResidentDashboard = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Protect route
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

  // Fetch resident requests
  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await API.get("/requests/my");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Dashboard statistics
  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    assigned: requests.filter(r => r.status === "assigned").length,
    inProgress: requests.filter(r => r.status === "in-progress").length,
    completed: requests.filter(r => r.status === "completed").length,
    paid: requests.filter(r => r.isPaid).length,
  }), [requests]);

  // Recent requests
  const recentRequests = useMemo(
    () => requests.slice(0, 5),
    [requests]
  );

  if (loading) {
    return (
      <div className="mt-16 text-center text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">

      {/* Dashboard Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Resident Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Track your service requests and progress.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            + Create New Request
          </button>

          <button
            onClick={fetchRequests}
            className="rounded-lg bg-gray-200 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-6">

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Assigned</p>
          <p className="text-3xl font-bold text-sky-600">{stats.assigned}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-3xl font-bold text-purple-600">{stats.inProgress}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.paid}</p>
        </div>

      </div>

      {/* Recent Requests */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Recent Requests
        </h2>

        {recentRequests.length === 0 ? (
          <p className="text-sm text-gray-500">
            No requests yet
          </p>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between rounded-xl border p-4"
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
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
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

      {/* Create Request Modal */}
      {showRequestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowRequestModal(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowRequestModal(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
              aria-label="Close modal"
            >
              <X size={22} />
            </button>

            <CreateRequest
              onSuccess={() => {
                setShowRequestModal(false);
                fetchRequests();
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default ResidentDashboard;
