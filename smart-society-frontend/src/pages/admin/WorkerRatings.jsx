import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

const WorkerRatings = () => {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

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
    fetchRatings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchRatings = async () => {
    try {
      setLoading(true);

      const res = await API.get("/requests/dashboard/worker-ratings");

      setWorkers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to load worker ratings");
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const name = worker.name?.toLowerCase() || "";
      const email = worker.email?.toLowerCase() || "";
      const q = search.toLowerCase();

      return name.includes(q) || email.includes(q);
    });
  }, [workers, search]);

  const totalPages = Math.max(1, Math.ceil(filteredWorkers.length / perPage));
  const start = (currentPage - 1) * perPage;
  const currentWorkers = filteredWorkers.slice(start, start + perPage);

  const getRatingBadge = (rating) => {
    if (rating >= 4.5) return "bg-green-100 text-green-700";
    if (rating >= 3.5) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Worker Rating Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            View worker performance based on completed and rated jobs.
          </p>
        </div>

        <button
          onClick={fetchRatings}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search by worker name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 md:max-w-sm"
        />

        <div className="text-sm text-gray-500">
          Total Workers: <span className="font-semibold">{filteredWorkers.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          Loading...
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow">
          No rating data available
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-white shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Worker</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Rated Jobs</th>
                  <th className="px-4 py-3 font-semibold">Average Rating</th>
                </tr>
              </thead>

              <tbody>
                {currentWorkers.map((worker, index) => {
                  const avg = Number(worker.avgRating || 0);

                  return (
                    <tr
                      key={worker._id || index}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {worker.name || "N/A"}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {worker.email || "N/A"}
                      </td>

                      <td className="px-4 py-3">{worker.totalJobs || 0}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRatingBadge(
                            avg
                          )}`}
                        >
                          ⭐ {avg.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="rounded-lg bg-gray-200 px-4 py-2 disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg bg-gray-200 px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkerRatings;