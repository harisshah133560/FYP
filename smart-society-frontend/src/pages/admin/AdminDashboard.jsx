import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    assignedRequests: 0,
    cancelledRequests: 0,
  });
  const [loading, setLoading] = useState(true);

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
    const fetchDashboardStats = async () => {
      try {
        const { data } = await API.get("/admin/dashboard-stats");
        setStats((prev) => ({
          ...prev,
          ...data,
        }));
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const chartData = useMemo(() => {
    return {
      labels: ["Pending", "Assigned", "In Progress", "Completed", "Cancelled"],
      datasets: [
        {
          label: "Service Requests",
          data: [
            stats?.pendingRequests || 0,
            stats?.assignedRequests || 0,
            stats?.inProgressRequests || 0,
            stats?.completedRequests || 0,
            stats?.cancelledRequests || 0,
          ],
        },
      ],
    };
  }, [stats]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    };
  }, []);

  const cards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Workers",
      value: stats?.totalWorkers || 0,
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Requests",
      value: stats?.totalRequests || 0,
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Pending Jobs",
      value: stats?.pendingRequests || 0,
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Assigned Jobs",
      value: stats?.assignedRequests || 0,
      textColor: "text-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      title: "In Progress",
      value: stats?.inProgressRequests || 0,
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed Jobs",
      value: stats?.completedRequests || 0,
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Cancelled Jobs",
      value: stats?.cancelledRequests || 0,
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  if (loading) {
    return (
      <div className="mt-20 flex items-center justify-center text-lg text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">
            Overview of users, workers, and service request progress.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Refresh Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-gray-100 p-5 shadow-sm ${card.bgColor}`}
          >
            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
            <p className={`mt-3 text-3xl font-bold ${card.textColor}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Service Request Status
          </h2>
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Quick Summary
          </h2>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center justify-between border-b pb-2">
              <span>Residents</span>
              <span className="font-semibold">{stats?.totalUsers || 0}</span>
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span>Workers</span>
              <span className="font-semibold">{stats?.totalWorkers || 0}</span>
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span>All Requests</span>
              <span className="font-semibold">{stats?.totalRequests || 0}</span>
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span>Active Work</span>
              <span className="font-semibold">
                {(stats?.assignedRequests || 0) + (stats?.inProgressRequests || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span>Completed</span>
              <span className="font-semibold text-green-600">
                {stats?.completedRequests || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Cancelled</span>
              <span className="font-semibold text-red-600">
                {stats?.cancelledRequests || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;