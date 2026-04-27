import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    serviceType: "",
    category: "",
    subcategory: "",
    price: "",
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await API.get("/services");
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      serviceType: "",
      category: "",
      subcategory: "",
      price: "",
    });
    setEditId(null);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const serviceType = form.serviceType.trim();
    const category = form.category.trim();
    const subcategory = form.subcategory.trim();
    const price = Number(form.price);

    if (!serviceType || !category || !subcategory || !price) {
      return alert("Please fill all fields");
    }

    if (price < 0) {
      return alert("Price must be positive");
    }

    const duplicate = services.find(
      (s) =>
        s.serviceType === serviceType &&
        s.category === category &&
        s.subcategory === subcategory &&
        s._id !== editId
    );

    if (duplicate) {
      return alert("This service already exists");
    }

    try {
      setSaving(true);

      if (editId) {
        await API.put(`/services/${editId}`, {
          serviceType,
          category,
          subcategory,
          price,
        });
        alert("Service updated successfully ✅");
      } else {
        await API.post("/services", {
          serviceType,
          category,
          subcategory,
          price,
        });
        alert("Service added successfully ✅");
      }

      resetForm();
      fetchServices();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const editService = (service) => {
    setForm({
      serviceType: service.serviceType,
      category: service.category,
      subcategory: service.subcategory,
      price: service.price,
    });
    setEditId(service._id);
  };

  const deleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      setDeletingId(id);
      await API.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) =>
      a.serviceType.localeCompare(b.serviceType)
    );
  }, [services]);

  return (
    <div className="p-4 md:p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Manage Services
        </h1>

        <button
          onClick={fetchServices}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* FORM */}
      <form
        onSubmit={submitHandler}
        className="bg-white p-5 rounded-2xl shadow mb-6 grid gap-4 max-w-lg"
      >
        <h2 className="text-lg font-semibold">
          {editId ? "Edit Service" : "Add New Service"}
        </h2>

        <input
          placeholder="Service Type"
          value={form.serviceType}
          onChange={(e) =>
            setForm({ ...form, serviceType: e.target.value })
          }
          className="border rounded-lg px-3 py-2"
        />

        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
          className="border rounded-lg px-3 py-2"
        />

        <input
          placeholder="Subcategory"
          value={form.subcategory}
          onChange={(e) =>
            setForm({ ...form, subcategory: e.target.value })
          }
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="number"
          placeholder="Price (PKR)"
          value={form.price}
          min="0"
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
          className="border rounded-lg px-3 py-2"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 disabled:bg-gray-400"
          >
            {saving
              ? "Saving..."
              : editId
              ? "Update Service"
              : "Add Service"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="border px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* TABLE */}
      {loading ? (
        <p className="text-center text-gray-500">
          Loading services...
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow">

          <table className="min-w-full text-sm">

            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">Service</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Subcategory</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedServices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500">
                    No services found
                  </td>
                </tr>
              ) : (
                sortedServices.map((service) => (
                  <tr key={service._id} className="border-t hover:bg-gray-50">

                    <td className="p-3 font-medium">
                      {service.serviceType}
                    </td>

                    <td className="p-3">{service.category}</td>
                    <td className="p-3">{service.subcategory}</td>

                    <td className="p-3 text-green-600 font-semibold">
                      PKR {service.price}
                    </td>

                    <td className="p-3 space-x-2">

                      <button
                        onClick={() => editService(service)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteService(service._id)}
                        disabled={deletingId === service._id}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:bg-gray-300"
                      >
                        {deletingId === service._id ? "Deleting..." : "Delete"}
                      </button>

                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default ManageServices;