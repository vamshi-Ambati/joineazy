import React, { useEffect, useState } from "react";
import apiUrl from "../apiUrl";

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch assignments for the student
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

  const ProgressBar = ({ completed }) => (
    <div className="w-full bg-gray-200 rounded-full h-4 relative">
      <div
        className="bg-green-500 h-4 rounded-full"
        style={{ width: `${completed}%` }}
      />
      <span className="absolute right-2 top-0 text-xs text-white font-semibold">
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
      // Optionally, you can refetch assignments to update progress
      // fetchAssignments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Student Dashboard</h2>

      {loading ? (
        <p>Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p>No assignments assigned yet.</p>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition duration-200"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{a.title}</h3>
                <p className="text-sm text-gray-500">
                  Due: {new Date(a.due_date).toLocaleDateString()}
                </p>
              </div>
              {a.description && (
                <p className="text-gray-600 mb-2">{a.description}</p>
              )}
              {a.onedrive_link && (
                <a
                  href={a.onedrive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline mb-2 block"
                >
                  Assignment Link
                </a>
              )}
              <ProgressBar completed={a.completed || 0} />
              <button
                onClick={() => handleSubmitAssignment(a.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
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
