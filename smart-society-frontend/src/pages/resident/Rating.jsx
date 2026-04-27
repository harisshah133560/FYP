import { useEffect, useState } from "react";
import API from "../../services/api";

const Rating = () => {
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompletedRequests();
  }, []);

  const fetchCompletedRequests = async () => {
    try {
      const res = await API.get("/requests/my");

      // ✅ Only completed & not rated
      const filtered = res.data.filter(
        (r) => r.status === "completed" && !r.rating
      );

      setRequests(filtered);
    } catch (error) {
      console.error(error);
      alert("Failed to load requests");
    }
  };

  const handleSubmit = async () => {
    if (!selectedId) return alert("Select a service first");
    if (rating === 0) return alert("Please select rating");

    try {
      setLoading(true);

      await API.post(`/requests/${selectedId}/rate`, {
        rating,
        review: feedback,
      });

      alert("Rating submitted successfully ⭐");

      setRating(0);
      setFeedback("");
      setSelectedId("");

      fetchCompletedRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">

      <h1 className="text-2xl font-bold mb-6">
        Rate Completed Service
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow max-w-lg space-y-4">

        {/* SELECT REQUEST */}
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Service</option>

          {requests.map((req) => (
            <option key={req._id} value={req._id}>
              {req.title} ({req.service?.serviceType})
            </option>
          ))}
        </select>

        {/* ⭐ STARS */}
        <div className="flex text-3xl space-x-2 cursor-pointer">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className={
                star <= rating
                  ? "text-yellow-400"
                  : "text-gray-300"
              }
            >
              ★
            </span>
          ))}
        </div>

        {/* FEEDBACK */}
        <textarea
          placeholder="Write feedback (optional)..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full p-2 border rounded"
        />

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Submitting..." : "Submit Rating"}
        </button>

        {/* EMPTY STATE */}
        {requests.length === 0 && (
          <p className="text-gray-500 text-sm">
            No completed services available for rating
          </p>
        )}

      </div>

    </div>
  );
};

export default Rating;