import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import API from "../../services/api";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const request = state?.request;

  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("cash");

  const canPay = useMemo(() => {
    if (!request) return false;
    if (request.isPaid) return false;
    return request.status === "completed";
  }, [request]);

  const handlePayment = async () => {
    if (!request?._id) {
      return alert("Invalid payment request");
    }

    if (!canPay) {
      return alert("This request is not available for payment");
    }

    try {
      setLoading(true);

      await API.post(`/requests/${request._id}/pay`, {
        method,
      });

      alert("Payment successful ✅");
      navigate("/resident/my-requests", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!request) {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-white p-6 text-center shadow">
        <h2 className="mb-2 text-xl font-bold text-red-600">
          Invalid payment access
        </h2>
        <p className="mb-5 text-sm text-gray-500">
          No request data was provided for payment.
        </p>
        <button
          onClick={() => navigate("/resident/my-requests")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Back to My Requests
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-6 shadow">
      <h2 className="mb-1 text-2xl font-bold text-gray-800">Payment</h2>
      <p className="mb-6 text-sm text-gray-500">
        Complete payment for your finished service request.
      </p>

      <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Service
          </p>
          <p className="font-semibold text-gray-800">{request.title}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Description
          </p>
          <p className="text-sm text-gray-700">{request.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Status
            </p>
            <p className="font-medium capitalize text-gray-800">
              {request.status}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Amount
            </p>
            <p className="font-semibold text-green-600">
              PKR {request.price || 0}
            </p>
          </div>
        </div>

        {request.isPaid && (
          <div className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700">
            This request is already paid.
          </div>
        )}

        {!request.isPaid && request.status !== "completed" && (
          <div className="rounded-lg bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-700">
            Payment is available only after the job is completed.
          </div>
        )}
      </div>

      <div className="mt-5">
        <label className="mb-2 block font-medium text-gray-700">
          Payment Method
        </label>

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-green-500"
          disabled={!canPay || loading}
        >
          <option value="cash">Cash</option>
          <option value="jazzcash">JazzCash</option>
          <option value="easypaisa">EasyPaisa</option>
        </select>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate("/resident/my-requests")}
          className="w-full rounded-lg border border-gray-300 py-2.5 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={handlePayment}
          disabled={loading || !canPay}
          className="w-full rounded-lg bg-green-600 py-2.5 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default Payment;