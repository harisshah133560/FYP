import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

const MyJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [otpInputs, setOtpInputs] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  // 🔐 Protect route
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo"));

      if (!user || user.role !== "worker") {
        navigate("/", { replace: true });
      }
    } catch {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const fetchJobs = async () => {
    try {
      const res = await API.get("/requests/worker");
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load jobs");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setLoadingId(id);

      await API.put(`/requests/${id}/status`, { status });

      fetchJobs();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update job");
    } finally {
      setLoadingId(null);
    }
  };

  const requestCompletion = async (id) => {
    try {
      setLoadingId(id);

      await API.post(`/requests/${id}/request-completion`); // ✅ FIXED

      alert("OTP sent to resident 📩");

      fetchJobs();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoadingId(null);
    }
  };

  const verifyOtp = async (id) => {
    if (!otpInputs[id]) {
      return alert("Enter OTP first");
    }

    try {
      setLoadingId(id);

      await API.post(`/requests/${id}/verify-otp`, {
        otp: otpInputs[id],
      });

      alert("Job completed ✅");

      fetchJobs();
    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoadingId(null);
    }
  };

  const statusColor = (status) => {
    switch (status) {
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

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      if (a.status === "assigned") return -1;
      if (b.status === "assigned") return 1;
      return 0;
    });
  }, [jobs]);

  return (
    <div className="p-4 md:p-6">

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Jobs</h1>

        <button
          onClick={fetchJobs}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">

        {sortedJobs.length === 0 ? (
          <p>No assigned jobs</p>
        ) : (
          sortedJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border rounded-xl p-4 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">
                  {job.service?.serviceType || job.title}
                </h3>

                <span
                  className={`px-3 py-1 text-xs rounded-full ${statusColor(
                    job.status
                  )}`}
                >
                  {job.status}
                </span>
              </div>

              <p className="text-gray-600">{job.description}</p>

              <p className="text-sm text-gray-500">
                Resident: {job.resident?.name || "N/A"}
              </p>

              {job.price && (
                <p className="text-sm text-gray-500">
                  Price: PKR {job.price}
                </p>
              )}

              {/* ▶ START */}
              {job.status === "assigned" && (
                <button
                  disabled={loadingId === job._id}
                  onClick={() => updateStatus(job._id, "in-progress")}
                  className="bg-blue-600 text-white px-4 py-1 rounded"
                >
                  {loadingId === job._id ? "Processing..." : "Start Job"}
                </button>
              )}

              {/* 🔐 REQUEST OTP */}
              {job.status === "in-progress" && (
                <button
                  disabled={loadingId === job._id}
                  onClick={() => requestCompletion(job._id)}
                  className="bg-yellow-600 text-white px-4 py-1 rounded"
                >
                  {loadingId === job._id
                    ? "Sending..."
                    : "Request Completion (OTP)"}
                </button>
              )}

              {/* 🔑 VERIFY OTP */}
              {job.status === "otp-sent" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otpInputs[job._id] || ""}
                    onChange={(e) =>
                      setOtpInputs({
                        ...otpInputs,
                        [job._id]: e.target.value,
                      })
                    }
                    className="border p-2 rounded w-full"
                  />

                  <button
                    disabled={loadingId === job._id}
                    onClick={() => verifyOtp(job._id)}
                    className="bg-green-600 text-white px-4 py-1 rounded"
                  >
                    {loadingId === job._id
                      ? "Verifying..."
                      : "Verify OTP"}
                  </button>
                </div>
              )}

              {/* ✅ DONE */}
              {job.status === "completed" && (
                <p className="text-green-600 font-semibold">
                  Job Completed ✅
                </p>
              )}
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default MyJobs;