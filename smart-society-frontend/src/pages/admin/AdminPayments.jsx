import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

const AdminPayments = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/requests/payments/report");
      setData(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm("Verify this payment?")) return;

    try {
      await API.put(`/requests/${id}/payment/verify`);
      alert("Payment verified ✅");
      fetchPayments();
    } catch (error) {
      alert(error.response?.data?.message || "Verification failed");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await API.put(`/requests/${id}/payment/reject`, { reason });
      alert("Payment rejected ❌");
      fetchPayments();
    } catch (error) {
      alert(error.response?.data?.message || "Reject failed");
    }
  };

  const payments = data?.payments || [];

  const filteredPayments = useMemo(() => {
    const q = search.toLowerCase().trim();

    return payments.filter((p) => {
      const matchesSearch =
        !q ||
        p.resident?.name?.toLowerCase().includes(q) ||
        p.resident?.email?.toLowerCase().includes(q) ||
        p.assignedWorker?.name?.toLowerCase().includes(q) ||
        p.assignedWorker?.email?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.transactionId?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || p.paymentStatus === statusFilter;

      const matchesMethod =
        methodFilter === "all" || p.paymentMethod === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  const formatCurrency = (amount) => {
    return `PKR ${Number(amount || 0).toLocaleString()}`;
  };

  if (loading) {
    return <p className="p-6 text-gray-600">Loading payments...</p>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Payment Management
          </h1>
          <p className="text-sm text-gray-500">
            Verify resident payments and track worker earnings.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-blue-50 p-5 shadow-sm">
          <h3 className="text-sm text-gray-600">Total Revenue</h3>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {formatCurrency(data?.summary?.totalRevenue)}
          </p>
        </div>

        <div className="rounded-2xl bg-green-50 p-5 shadow-sm">
          <h3 className="text-sm text-gray-600">Admin Earnings</h3>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {formatCurrency(data?.summary?.totalAdminEarning)}
          </p>
        </div>

        <div className="rounded-2xl bg-purple-50 p-5 shadow-sm">
          <h3 className="text-sm text-gray-600">Worker Earnings</h3>
          <p className="mt-2 text-2xl font-bold text-purple-700">
            {formatCurrency(data?.summary?.totalWorkerEarning)}
          </p>
        </div>

        <div className="rounded-2xl bg-orange-50 p-5 shadow-sm">
          <h3 className="text-sm text-gray-600">Pending Payments</h3>
          <p className="mt-2 text-2xl font-bold text-orange-700">
            {data?.summary?.pendingCount || 0}
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search resident, worker, service, transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="all">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="jazzcash">JazzCash</option>
            <option value="easypaisa">EasyPaisa</option>
          </select>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Showing {filteredPayments.length} of {payments.length} payments
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Payment History
          </h2>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No payment records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3">Resident</th>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium">{p.resident?.name || "N/A"}</p>
                      <p className="text-xs text-gray-500">
                        {p.resident?.email || ""}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {p.assignedWorker?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.assignedWorker?.email || ""}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium">{p.title || "Service"}</p>
                      <p className="max-w-xs text-xs text-gray-500">
                        {p.description || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4 capitalize">
                      {p.paymentMethod || "-"}
                    </td>

                    <td className="px-4 py-4">
                      {p.transactionId || "-"}
                    </td>

                    <td className="px-4 py-4 font-semibold text-blue-700">
                      {formatCurrency(p.price)}
                    </td>

                    <td className="px-4 py-4 font-semibold text-green-700">
                      {formatCurrency(p.adminEarning)}
                    </td>

                    <td className="px-4 py-4 font-semibold text-purple-700">
                      {formatCurrency(p.workerEarning)}
                    </td>

                    <td className="px-4 py-4">
                      {p.paymentStatus === "pending" && (
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          Pending
                        </span>
                      )}

                      {p.paymentStatus === "verified" && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Verified
                        </span>
                      )}

                      {p.paymentStatus === "rejected" && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {p.paymentStatus === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(p._id)}
                            className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                          >
                            Verify
                          </button>

                          <button
                            onClick={() => handleReject(p._id)}
                            className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : p.paymentStatus === "verified" ? (
                        <span className="text-sm font-medium text-green-600">
                          Done
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-red-600">
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;