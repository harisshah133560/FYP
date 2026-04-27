import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  const [ratingRequest, setRatingRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);

      const res = await API.get("/requests/my");

      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Cancel
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this request?")) return;

    try {
      await API.delete(`/requests/${id}/cancel`);
      fetchMyRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Cancel failed");
    }
  };

  // 💳 Payment
  const handlePayment = async () => {
    if (!paymentMethod) return alert("Select payment method");

    try {
      await API.post(`/requests/${selectedRequest._id}/pay`, {
        method: paymentMethod,
      });

      alert("Payment successful ✅");

      setSelectedRequest(null);
      setPaymentMethod("");
      fetchMyRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed");
    }
  };

  // ⭐ Rating
  const submitRating = async () => {
    if (!rating) return alert("Select rating");

    try {
      await API.post(`/requests/${ratingRequest._id}/rate`, {
        rating,
        review,
      });

      alert("Rating submitted ⭐");

      setRatingRequest(null);
      setRating(0);
      setReview("");

      fetchMyRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Rating failed");
    }
  };

  const currentData = useMemo(() => {
    const last = currentPage * perPage;
    const first = last - perPage;
    return requests.slice(first, last);
  }, [requests, currentPage]);

  const totalPages = Math.ceil(requests.length / perPage);

  const statusColor = (status) => {
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
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-4 md:p-6">

      <h1 className="text-2xl font-bold mb-6">My Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No requests found</p>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3 text-left">Service</th>
                  <th className="p-3 text-left">Worker</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((req) => (
                  <tr key={req._id} className="border-t hover:bg-gray-50">

                    <td className="p-3 font-medium">
                      {req.title}
                    </td>

                    <td className="p-3">
                      {req.assignedWorker?.name || "Not Assigned"}
                    </td>

                    <td className="p-3">
                      PKR {req.price || 0}
                    </td>

                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>

                    <td className="p-3 space-x-2">

                      {req.status === "pending" && (
                        <button
                          onClick={() => handleCancel(req._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      )}

                      {req.status === "completed" && !req.isPaid && (
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Pay
                        </button>
                      )}

                      {req.isPaid && !req.rating && (
                        <button
                          onClick={() => setRatingRequest(req)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Rate ⭐
                        </button>
                      )}

                      {req.rating && (
                        <span className="text-yellow-600 font-semibold text-sm">
                          ⭐ {req.rating}/5
                        </span>
                      )}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded"
            >
              Prev
            </button>

            <span>Page {currentPage} / {totalPages || 1}</span>

            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* PAYMENT MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 space-y-4">

            <h2 className="text-lg font-bold">Payment</h2>

            <p>{selectedRequest.title}</p>
            <p>PKR {selectedRequest.price}</p>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Method</option>
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="cash">Cash</option>
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedRequest(null)}>Cancel</button>
              <button
                onClick={handlePayment}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Pay
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {ratingRequest && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 space-y-4">

            <h2 className="text-lg font-bold">Rate Service</h2>

            <div className="flex gap-2">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    rating >= star ? "text-yellow-500" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              placeholder="Write review (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setRatingRequest(null)}>Cancel</button>
              <button
                onClick={submitRating}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Submit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyRequests;