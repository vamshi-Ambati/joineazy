import React, { useEffect, useState } from "react";
import apiUrl from "../apiUrl";

const AdminDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/assignments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch assignments");
        setAssignments(data);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {loading ? (
        <p>Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">{a.title}</h3>
              <p>Submissions: {a.submissions || 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
