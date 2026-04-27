import { useEffect, useState } from "react";
import API from "../../services/api";

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [editingWorker, setEditingWorker] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [workerRes, serviceRes] = await Promise.all([
        API.get("/users/workers"),
        API.get("/services"),
      ]);

      setWorkers(Array.isArray(workerRes.data) ? workerRes.data : []);
      setServices(Array.isArray(serviceRes.data) ? serviceRes.data : []);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load workers");
    } finally {
      setLoading(false);
    }
  };

  const deleteWorker = async (id) => {
    if (!window.confirm("Delete this worker?")) return;

    try {
      setDeletingId(id);
      await API.delete(`/users/${id}`);

      alert("Worker deleted successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleServiceChange = (e) => {
    const values = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setSelectedServices(values);
  };

  const openEditModal = (worker) => {
    setEditingWorker(worker);
    setSelectedServices(worker.services?.map((s) => s._id) || []);
  };

  const closeEditModal = () => {
    setEditingWorker(null);
    setSelectedServices([]);
  };

  const updateWorkerService = async () => {
    if (!editingWorker) return;

    if (selectedServices.length === 0) {
      return alert("Select at least one service");
    }

    try {
      setUpdating(true);

      await API.put(`/users/workers/${editingWorker._id}/services`, {
        services: selectedServices,
      });

      alert("Worker updated successfully");

      closeEditModal();
      fetchData();
    } catch (error) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Workers</h1>

        <button
          onClick={fetchData}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white p-6 shadow">
        {loading ? (
          <p className="text-center text-gray-500">Loading workers...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Worker Skills</th>
                <th className="px-4 py-3 text-center font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {workers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    No workers found
                  </td>
                </tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium">{worker.name}</td>
                    <td className="px-4 py-4">{worker.email}</td>

                    <td className="px-4 py-4">
                      {worker.services?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {worker.services.map((s) => (
                            <span
                              key={s._id}
                              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium capitalize text-blue-700"
                            >
                              {s.serviceType} / {s.category}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No Skills</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(worker)}
                          className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteWorker(worker._id)}
                          disabled={deletingId === worker._id}
                          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:bg-gray-300"
                        >
                          {deletingId === worker._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {editingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-xl font-bold text-gray-800">
              Update Worker Skills
            </h2>

            <p className="mb-4 text-sm text-gray-500">
              Worker: <span className="font-medium">{editingWorker.name}</span>
            </p>

            <select
              multiple
              value={selectedServices}
              onChange={handleServiceChange}
              className="h-44 w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-blue-500"
            >
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.serviceType} - {service.category} -{" "}
                  {service.subcategory}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-gray-500">
              Hold Ctrl on Windows or Cmd on Mac to select multiple services.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeEditModal}
                disabled={updating}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={updateWorkerService}
                disabled={updating}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-300"
              >
                {updating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;