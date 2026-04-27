import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Reports = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [workerRatings, setWorkerRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#8b5cf6", "#ef4444"];

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo"));

      if (!user || user.role !== "admin") {
        navigate("/", { replace: true });
      }
    } catch {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        const [requestsRes, monthlyRes, ratingsRes] = await Promise.all([
          API.get("/requests"),
          API.get("/requests/dashboard/monthly"),
          API.get("/requests/dashboard/worker-ratings"),
        ]);

        const allRequests = Array.isArray(requestsRes.data) ? requestsRes.data : [];
        setRequests(allRequests);

        const normalizedMonthly = Array.isArray(monthlyRes.data)
          ? monthlyRes.data.map((item) => ({
              month: monthNames[(item._id || 1) - 1] || `Month ${item._id}`,
              total: item.total || 0,
              completed: item.completed || 0,
              pending: item.pending || 0,
              inProgress: item.inProgress || 0,
            }))
          : [];

        setMonthlyData(normalizedMonthly);
        setWorkerRatings(Array.isArray(ratingsRes.data) ? ratingsRes.data : []);
      } catch (error) {
        console.error("Error fetching reports:", error);
        alert(error.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const serviceStatusData = useMemo(() => {
    const summary = {
      pending: 0,
      assigned: 0,
      "in-progress": 0,
      "otp-sent": 0,
      completed: 0,
      cancelled: 0,
    };

    requests.forEach((req) => {
      if (summary[req.status] !== undefined) {
        summary[req.status] += 1;
      }
    });

    return [
      { name: "Pending", value: summary.pending },
      { name: "Assigned", value: summary.assigned },
      { name: "In Progress", value: summary["in-progress"] },
      { name: "OTP Sent", value: summary["otp-sent"] },
      { name: "Completed", value: summary.completed },
      { name: "Cancelled", value: summary.cancelled },
    ].filter((item) => item.value > 0);
  }, [requests]);

  const workerPerformanceData = useMemo(() => {
    const counts = {};

    requests.forEach((req) => {
      const workerName = req.assignedWorker?.name;
      if (!workerName) return;

      counts[workerName] = (counts[workerName] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, jobs]) => ({ name, jobs }))
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 8);
  }, [requests]);

  const summaryCards = useMemo(() => {
    const total = requests.length;
    const completed = requests.filter((r) => r.status === "completed").length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const inProgress = requests.filter((r) => r.status === "in-progress").length;
    const assigned = requests.filter((r) => r.status === "assigned").length;

    return [
      { title: "Total Requests", value: total, color: "text-blue-600", bg: "bg-blue-50" },
      { title: "Pending", value: pending, color: "text-yellow-600", bg: "bg-yellow-50" },
      { title: "Assigned", value: assigned, color: "text-sky-600", bg: "bg-sky-50" },
      { title: "In Progress", value: inProgress, color: "text-purple-600", bg: "bg-purple-50" },
      { title: "Completed", value: completed, color: "text-green-600", bg: "bg-green-50" },
    ];
  }, [requests]);

  if (loading) {
    return (
      <div className="mt-16 text-center text-gray-600">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">System Reports</h1>
          <p className="text-sm text-gray-500">
            Analytics for service requests, workers, and monthly activity.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Refresh Reports
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-gray-100 p-5 shadow-sm ${card.bg}`}
          >
            <p className="text-sm text-gray-600">{card.title}</p>
            <p className={`mt-2 text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Service Status Distribution
          </h3>

          {serviceStatusData.length === 0 ? (
            <p className="text-sm text-gray-500">No status data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={serviceStatusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {serviceStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Worker Performance
          </h3>

          {workerPerformanceData.length === 0 ? (
            <p className="text-sm text-gray-500">No worker performance data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={workerPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="jobs" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Monthly Requests
          </h3>

          {monthlyData.length === 0 ? (
            <p className="text-sm text-gray-500">No monthly analytics available</p>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" />
                <Bar dataKey="completed" fill="#22c55e" />
                <Bar dataKey="pending" fill="#f59e0b" />
                <Bar dataKey="inProgress" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Worker Ratings
          </h3>

          {workerRatings.length === 0 ? (
            <p className="text-sm text-gray-500">No worker ratings available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Worker</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Total Rated Jobs</th>
                    <th className="px-4 py-3">Average Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {workerRatings.map((worker) => (
                    <tr key={worker._id} className="border-t">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {worker.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{worker.email}</td>
                      <td className="px-4 py-3">{worker.totalJobs}</td>
                      <td className="px-4 py-3 font-semibold text-yellow-600">
                        ⭐ {worker.avgRating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;