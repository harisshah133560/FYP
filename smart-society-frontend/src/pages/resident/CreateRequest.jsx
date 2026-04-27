import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

const CreateRequest = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loading, setLoading] = useState(false);

  const [serviceType, setServiceType] = useState("");
  const [category, setCategory] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [price, setPrice] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

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

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const res = await API.get("/services");
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Service fetch error:", error);
      setServices([]);
      alert(error.response?.data?.message || "Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    setCategory("");
    setSelectedServiceId("");
    setPrice(null);
  }, [serviceType]);

  useEffect(() => {
    setSelectedServiceId("");
    setPrice(null);
  }, [category]);

  const serviceTypes = useMemo(() => {
    return [...new Set(services.map((s) => s.serviceType))];
  }, [services]);

  const categories = useMemo(() => {
    return [
      ...new Set(
        services
          .filter((s) => s.serviceType === serviceType)
          .map((s) => s.category)
      ),
    ];
  }, [services, serviceType]);

  const subcategories = useMemo(() => {
    return services.filter(
      (s) => s.serviceType === serviceType && s.category === category
    );
  }, [services, serviceType, category]);

  const selectedService = useMemo(() => {
    return services.find((s) => s._id === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  const handleSubcategoryChange = (serviceId) => {
    setSelectedServiceId(serviceId);

    const selected = services.find((s) => s._id === serviceId);
    setPrice(selected ? selected.price : null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setServiceType("");
    setCategory("");
    setSelectedServiceId("");
    setPrice(null);
    setFormData({
      title: "",
      description: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = formData.title.trim();
    const description = formData.description.trim();

    if (!selectedServiceId) {
      return alert("Please select a complete service");
    }

    if (!title || !description) {
      return alert("Please enter title and description");
    }

    try {
      setLoading(true);

      await API.post("/requests", {
        serviceId: selectedServiceId,
        title,
        description,
        price: price ?? 0,
      });

      alert("Request submitted successfully ✅");
      resetForm();
    } catch (error) {
      console.error("Submit error:", error);
      alert(error.response?.data?.message || "Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Create Service Request
          </h1>
          <p className="text-sm text-gray-500">
            Select a service and describe the work you need.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchServices}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Refresh Services
        </button>
      </div>

      {loadingServices ? (
        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
          No services available
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl space-y-5 rounded-2xl bg-white p-6 shadow"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Service</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                required
                disabled={!serviceType}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Subcategory
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => handleSubcategoryChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
              required
              disabled={!category}
            >
              <option value="">Select Subcategory</option>
              {subcategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subcategory}
                </option>
              ))}
            </select>
          </div>

          {selectedService && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-blue-800">
                Selected Service Details
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-2">
                <p>
                  <span className="font-medium">Service:</span>{" "}
                  {selectedService.serviceType}
                </p>
                <p>
                  <span className="font-medium">Category:</span>{" "}
                  {selectedService.category}
                </p>
                <p>
                  <span className="font-medium">Subcategory:</span>{" "}
                  {selectedService.subcategory}
                </p>
                <p>
                  <span className="font-medium">Price:</span> Rs.{" "}
                  {selectedService.price ?? 0}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Request Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Kitchen sink leakage"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the problem in detail..."
              rows="5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
              required
            />
          </div>

          {price !== null && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Estimated Price
              </label>
              <input
                type="text"
                value={`PKR ${price}`}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateRequest;