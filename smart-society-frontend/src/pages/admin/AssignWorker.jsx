import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

const AssignWorker = () => {
  const [requests, setRequests] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedWorkers, setSelectedWorkers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);

      const [reqRes, workerRes] = await Promise.all([
        API.get("/requests"),
        API.get("/users/workers"),
      ]);

      setRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
      setWorkers(Array.isArray(workerRes.data) ? workerRes.data : []);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoadingData(false);
    }
  };

  const getFilteredWorkers = (request) => {
    if (!request?.service?._id) return [];

    return workers.filter((worker) =>
      worker.services?.some(
        (service) => service?._id?.toString() === request.service._id.toString()
      )
    );
  };

  const handleSelectWorker = (requestId, workerId) => {
    setSelectedWorkers((prev) => ({
      ...prev,
      [requestId]: workerId,
    }));
  };

  const assignWorker = async (requestId) => {
    const workerId = selectedWorkers[requestId];

    if (!workerId) {
      alert("Please select a worker first");
      return;
    }

    const confirmAssign = window.confirm("Assign this worker?");
    if (!confirmAssign) return;

    try {
      setAssigningId(requestId);

      await API.put(`/requests/${requestId}/assign`, { workerId });

      alert("Worker assigned successfully ✅");

      setSelectedWorkers((prev) => ({
        ...prev,
        [requestId]: "",
      }));

      await fetchData();
    } catch (error) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.message || "Failed to assign worker");
    } finally {
      setAssigningId(null);
    }
  };

  const deleteRequest = async (id) => {
    const confirmDelete = window.confirm("Delete this request?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      await API.delete(`/requests/${id}/delete`);

      alert("Deleted successfully 🗑️");
      await fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "assigned":
        return "bg-blue-100 text-blue-700";
      case "in-progress":
        return "bg-purple-100 text-purple-700";
      case "otp-sent":
        return "bg-orange-100 text-orange-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return 0;
    });
  }, [requests]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assign Worker</h1>
          <p className="text-sm text-gray-500">
            Assign matching workers to pending service requests
          </p>
        </div>

        <button
          onClick={fetchData}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        {loadingData ? (
          <div className="p-8 text-center text-gray-500">Loading requests...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Resident</th>
                  <th className="px-4 py-3 font-semibold">Title / Description</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Assign Worker</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {sortedRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No service requests found
                    </td>
                  </tr>
                ) : (
                  sortedRequests.map((req) => {
                    const filteredWorkers = getFilteredWorkers(req);
                    const isPending = req.status === "pending";
                    const isAssigning = assigningId === req._id;
                    const isDeleting = deletingId === req._id;

                    return (
                      <tr
                        key={req._id}
                        className="border-t border-gray-100 align-top hover:bg-gray-50"
                      >
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-800">
                            {req.service?.serviceType || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {req.service?.category || "-"} /{" "}
                            {req.service?.subcategory || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-800">
                            {req.resident?.name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {req.resident?.email || ""}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-800">
                            {req.title || "-"}
                          </div>
                          <div className="max-w-xs break-words text-xs text-gray-500">
                            {req.description || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4 font-medium text-gray-700">
                          Rs. {req.price ?? 0}
                        </td>

                        <td className="px-4 py-4">
                          {isPending ? (
                            filteredWorkers.length > 0 ? (
                              <div className="flex min-w-[240px] flex-col gap-2">
                                <select
                                  className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                                  value={selectedWorkers[req._id] || ""}
                                  onChange={(e) =>
                                    handleSelectWorker(req._id, e.target.value)
                                  }
                                  disabled={isAssigning}
                                >
                                  <option value="">Select Worker</option>
                                  {filteredWorkers.map((worker) => (
                                    <option key={worker._id} value={worker._id}>
                                      {worker.name} -{" "}
                                      {worker.services
                                        ?.map((s) => s.serviceType)
                                        .join(", ")}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  onClick={() => assignWorker(req._id)}
                                  disabled={!selectedWorkers[req._id] || isAssigning}
                                  className="rounded-lg bg-blue-600 px-3 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300 hover:bg-blue-700"
                                >
                                  {isAssigning ? "Assigning..." : "Assign"}
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-red-500">
                                No matching worker
                              </span>
                            )
                          ) : (
                            <div>
                              <div className="font-medium text-green-600">
                                {req.assignedWorker?.name || "Already assigned"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {req.assignedWorker?.email || ""}
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                              req.status
                            )}`}
                          >
                            {req.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => deleteRequest(req._id)}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignWorker;