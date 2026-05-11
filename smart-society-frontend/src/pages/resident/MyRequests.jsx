import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");

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
      alert(error.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

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

    if (
      (paymentMethod === "jazzcash" || paymentMethod === "easypaisa") &&
      !transactionId
    ) {
      return alert("Enter transaction ID");
    }

    try {
      await API.post(`/requests/${selectedRequest._id}/pay`, {
        method: paymentMethod,
        transactionId,
      });

      alert("Payment submitted! Waiting for admin approval ⏳");

      setSelectedRequest(null);
      setPaymentMethod("");
      setTransactionId("");

      fetchMyRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed");
    }
  };

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

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">My Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="w-full bg-white shadow">
            <thead>
              <tr className="bg-gray-100">
                <th>Service</th>
                <th>Worker</th>
                <th>Price</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((req) => (
                <tr key={req._id} className="border-t">

                  <td>{req.title}</td>
                  <td>{req.assignedWorker?.name || "N/A"}</td>
                  <td>PKR {req.price}</td>
                  <td>{req.status}</td>

                  {/* PAYMENT STATUS */}
                  <td>
                    {req.paymentStatus === "pending" && (
                      <span className="text-orange-600">⏳ Pending</span>
                    )}
                    {req.paymentStatus === "verified" && (
                      <span className="text-green-600">✅ Paid</span>
                    )}
                    {req.paymentStatus === "rejected" && (
                      <span className="text-red-600">❌ Rejected</span>
                    )}
                    {!req.paymentStatus && "Unpaid"}
                  </td>

                  <td>

                    {req.status === "completed" &&
                      req.paymentStatus !== "pending" &&
                      req.paymentStatus !== "verified" && (
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="bg-green-600 text-white px-2 py-1"
                        >
                          Pay
                        </button>
                      )}

                    {req.paymentStatus === "pending" && (
                      <span>Waiting admin</span>
                    )}

                    {req.paymentStatus === "verified" && !req.rating && (
                      <button
                        onClick={() => setRatingRequest(req)}
                        className="bg-yellow-500 text-white px-2 py-1"
                      >
                        Rate
                      </button>
                    )}

                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* PAYMENT MODAL */}
          {selectedRequest && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
              <div className="bg-white p-6 rounded space-y-4">

                <h2>Payment</h2>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="border p-2 w-full"
                >
                  <option value="">Select Method</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="cash">Cash</option>
                </select>

                {(paymentMethod === "jazzcash" ||
                  paymentMethod === "easypaisa") && (
                  <input
                    type="text"
                    placeholder="Transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="border p-2 w-full"
                  />
                )}

                <button onClick={handlePayment} className="bg-green-600 text-white px-3 py-1">
                  Submit Payment
                </button>

              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyRequests;