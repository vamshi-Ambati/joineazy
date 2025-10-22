import React, { useEffect, useState } from "react";
import apiUrl from "../apiUrl";

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch(`${apiUrl}/assignments/get-assignments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAssignments(data);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAssignments();
  }, [token]);

  // Progress bar component
  const ProgressBar = ({ completed }) => (
    <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
      <div
        className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
        style={{ width: `${completed}%` }}
      />
      <span className="absolute right-2 top-0 text-xs font-semibold text-white">
        {completed}%
      </span>
    </div>
  );

  // Submit assignment
  const handleSubmitAssignment = async (assignmentId) => {
    const fileLink = prompt("Enter OneDrive/Drive link of your submission:");
    if (!fileLink) return;

    try {
      const res = await fetch(`${apiUrl}/assignments/submit/${assignmentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileLink }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");

      alert("Assignment submitted successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Student Dashboard
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p className="text-center text-gray-500">
          No assignments assigned yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-green-500"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-gray-800">{a.title}</h3>
                <p className="text-sm text-gray-400">
                  Due: {new Date(a.due_date).toLocaleDateString()}
                </p>
              </div>

              {a.description && (
                <p className="text-gray-600 mb-3">{a.description}</p>
              )}

              {a.onedrive_link && (
                <a
                  href={a.onedrive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline mb-3 block hover:text-blue-600"
                >
                  Assignment Link
                </a>
              )}

              <div className="mb-4">
                <ProgressBar completed={a.completed || 0} />
              </div>

              <button
                onClick={() => handleSubmitAssignment(a.id)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:scale-105 transform transition duration-300"
              >
                Submit Assignment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
