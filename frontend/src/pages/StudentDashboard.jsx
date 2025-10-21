import React, { useEffect, useState } from "react";
import apiUrl from "../apiUrl";

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch(`${apiUrl}/student/assignments`, {
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
  }, [token]);

  const ProgressBar = ({ completed }) => (
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-green-500 h-4 rounded-full"
        style={{ width: `${completed}%` }}
      ></div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>
      {loading ? (
        <p>Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p>No assignments assigned yet.</p>
      ) : (
        assignments.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded-lg shadow mb-4">
            <h3 className="font-semibold">{a.title}</h3>
            <ProgressBar completed={a.completed} />
          </div>
        ))
      )}
    </div>
  );
};

export default StudentDashboard;
