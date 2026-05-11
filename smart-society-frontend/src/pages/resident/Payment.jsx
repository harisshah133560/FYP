import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../../services/api";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const request = state?.request;

  const [method, setMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!method) return alert("Select payment method");

    if (
      (method === "jazzcash" || method === "easypaisa") &&
      !transactionId
    ) {
      return alert("Enter transaction ID");
    }

    try {
      setLoading(true);

      await API.post(`/requests/${request._id}/pay`, {
        method,
        transactionId,
      });

      alert("Payment submitted! Waiting for admin approval ⏳");

      navigate("/resident/my-requests");
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!request) return <p>Invalid access</p>;

  return (
    <div className="p-6 bg-white rounded shadow max-w-md mx-auto">

      <h2 className="text-xl font-bold mb-4">Payment</h2>

      <p>{request.title}</p>
      <p>PKR {request.price}</p>

      {/* STATUS */}
      {request.paymentStatus === "pending" && (
        <p className="text-orange-600">⏳ Waiting for admin</p>
      )}
      {request.paymentStatus === "verified" && (
        <p className="text-green-600">✅ Paid</p>
      )}
      {request.paymentStatus === "rejected" && (
        <p className="text-red-600">❌ Rejected</p>
      )}

      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="w-full border p-2 mt-3"
      >
        <option value="cash">Cash</option>
        <option value="jazzcash">JazzCash</option>
        <option value="easypaisa">EasyPaisa</option>
      </select>

      {(method === "jazzcash" || method === "easypaisa") && (
        <input
          type="text"
          placeholder="Transaction ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="w-full border p-2 mt-2"
        />
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full mt-4 bg-green-600 text-white py-2"
      >
        {loading ? "Processing..." : "Submit Payment"}
      </button>

    </div>
  );
};

export default Payment;