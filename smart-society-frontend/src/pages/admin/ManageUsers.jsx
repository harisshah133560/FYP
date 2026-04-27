import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const currentUser = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id, role) => {
    if (role === "admin") return alert("You cannot delete an admin");
    if (id === currentUser._id) return alert("You cannot delete yourself");

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setDeletingId(id);

      await API.delete(`/users/${id}`);

      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "worker":
        return "bg-green-100 text-green-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  // 🔍 Filter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // 📄 Pagination
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));

  return (
    <div className="p-4 md:p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>

        <button
          onClick={fetchUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* 🔍 FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-5">

        <input
          type="text"
          placeholder="Search by name or email..."
          className="border rounded-lg px-3 py-2 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded-lg px-3 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="resident">Resident</option>
          <option value="worker">Worker</option>
        </select>

      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading users...</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-white shadow">

            <table className="min-w-full text-sm">

              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Services</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-6 text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user._id} className="border-t hover:bg-gray-50">

                      <td className="p-3 font-medium">{user.name}</td>
                      <td className="p-3">{user.email}</td>

                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* 🔥 SHOW WORKER SERVICES */}
                      <td className="p-3">
                        {user.role === "worker" && user.services?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.services.map((s) => (
                              <span
                                key={s._id}
                                className="bg-gray-100 text-xs px-2 py-1 rounded"
                              >
                                {s.serviceType}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => deleteUser(user._id, user.role)}
                          disabled={deletingId === user._id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:bg-gray-300"
                        >
                          {deletingId === user._id ? "Deleting..." : "Delete"}
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>

            </table>

          </div>

          {/* 📄 PAGINATION */}
          <div className="flex justify-between items-center mt-5">

            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm font-medium">
              Page {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Next
            </button>

          </div>
        </>
      )}
    </div>
  );
};

export default ManageUsers;