import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

const CreateWorker = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const res = await API.get("/services");
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch services error:", error);
      alert(error.response?.data?.message || "Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
    });
    setSelectedServices([]);
  };

  const selectedServiceLabels = useMemo(() => {
    return services
      .filter((service) => selectedServices.includes(service._id))
      .map(
        (service) =>
          `${service.serviceType} / ${service.category}${
            service.subcategory ? ` / ${service.subcategory}` : ""
          }`
      );
  }, [services, selectedServices]);

  const validateEmail = (email) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!name || !email || !password) {
      return alert("Please fill all fields");
    }

    if (!validateEmail(email)) {
      return alert("Please enter a valid email address");
    }

    if (password.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    if (selectedServices.length === 0) {
      return alert("Please select at least one service");
    }

    try {
      setLoading(true);

      await API.post("/users/workers", {
        name,
        email,
        password,
        services: selectedServices,
      });

      alert("Worker created successfully ✅");
      handleReset();
    } catch (error) {
      console.error("Create worker error:", error);
      alert(error.response?.data?.message || "Failed to create worker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Create Worker</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add a new worker and assign one or more services.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Worker Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter worker name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Worker Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter worker email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="max-w-md">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Assign Services
          </label>

          {loadingServices ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              No services found. Please create services first.
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {services.map((service) => {
                  const checked = selectedServices.includes(service._id);

                  return (
                    <label
                      key={service._id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                        checked
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleServiceToggle(service._id)}
                        className="mt-1"
                      />

                      <div className="min-w-0">
                        <p className="font-medium capitalize text-gray-800">
                          {service.serviceType}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {service.category}
                          {service.subcategory ? ` / ${service.subcategory}` : ""}
                        </p>
                        <p className="text-xs text-gray-400">
                          Price: Rs. {service.price ?? 0}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Selected Services
            </p>

            {selectedServiceLabels.length === 0 ? (
              <p className="text-sm text-gray-500">No services selected</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedServiceLabels.map((label, index) => (
                  <span
                    key={`${label}-${index}`}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium capitalize text-blue-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading || loadingServices}
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Worker"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateWorker;