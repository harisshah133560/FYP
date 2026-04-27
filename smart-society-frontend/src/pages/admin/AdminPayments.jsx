import { useEffect, useState } from "react";
import API from "../../services/api";

const AdminPayments = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await API.get("/requests/payments/report");
      setData(res.data);
    } catch (error) {
      alert("Failed to load payments");
    }
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payment Report</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 shadow rounded">
          <h3>Total Revenue</h3>
          <p>PKR {data.summary.totalRevenue}</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h3>Admin Earnings</h3>
          <p>PKR {data.summary.totalAdminEarning}</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h3>Worker Earnings</h3>
          <p>PKR {data.summary.totalWorkerEarning}</p>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-100">
            <th>Resident</th>
            <th>Worker</th>
            <th>Amount</th>
            <th>Admin</th>
            <th>Worker</th>
          </tr>
        </thead>

        <tbody>
          {data.payments.map((p) => (
            <tr key={p._id} className="border-t">
              <td>{p.resident?.name}</td>
              <td>{p.assignedWorker?.name}</td>
              <td>PKR {p.price}</td>
              <td>PKR {p.adminEarning}</td>
              <td>PKR {p.workerEarning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPayments;