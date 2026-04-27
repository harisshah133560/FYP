import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

const WorkerDashboard = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo"));

      if (!user || user.role !== "worker") {
        navigate("/", { replace: true });
      }
    } catch {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/requests/worker");
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const stats = useMemo(() => {
    const totalAssigned = jobs.length;
    const assigned = jobs.filter((job) => job.status === "assigned").length;
    const inProgress = jobs.filter((job) => job.status === "in-progress").length;
    const otpSent = jobs.filter((job) => job.status === "otp-sent").length;
    const completed = jobs.filter((job) => job.status === "completed").length;

    return {
      totalAssigned,
      assigned,
      inProgress,
      otpSent,
      completed,
    };
  }, [jobs]);

  const recentJobs = useMemo(() => {
    return [...jobs].slice(0, 5);
  }, [jobs]);

  if (loading) {
    return (
      <div className="mt-16 text-center text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Worker Dashboard</h1>
          <p className="text-sm text-gray-500">
            Overview of assigned work and progress.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Jobs</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {stats.totalAssigned}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Assigned</p>
          <p className="mt-2 text-3xl font-bold text-sky-600">
            {stats.assigned}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {stats.inProgress}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">OTP Sent</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {stats.otpSent}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {stats.completed}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Recent Jobs</h2>

        {recentJobs.length === 0 ? (
          <p className="text-sm text-gray-500">No assigned jobs yet.</p>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job._id}
                className="flex flex-col gap-2 rounded-xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {job.title || job.service?.serviceType || "Untitled Job"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {job.resident?.name || "Resident"} • PKR {job.price || 0}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    job.status === "assigned"
                      ? "bg-sky-100 text-sky-700"
                      : job.status === "in-progress"
                      ? "bg-purple-100 text-purple-700"
                      : job.status === "otp-sent"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;