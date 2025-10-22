import React, { useState, useEffect } from "react";
import apiUrl from "../apiUrl";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${apiUrl}/assignments/get-assignments-for-student`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to fetch assignments");
        setAssignments(data.assignments);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleSubmit = async (assignmentId, groupId, confirm = false) => {
    const message = confirm
      ? "Are you sure you want to confirm your submission?"
      : "Have you uploaded your assignment to OneDrive?";

    if (!window.confirm(message)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ group_id: groupId, confirm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      alert(confirm ? "Submission confirmed!" : "Assignment submitted!");
      setAssignments((prev) =>
        prev.map((a) =>
          a.assignment_id === assignmentId && a.group_id === groupId
            ? { ...a, submitted: true, confirmed: confirm || a.confirmed }
            : a
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading assignments...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Assignments</h2>
      {assignments.length === 0 && <p>No assignments assigned yet.</p>}
      <div className="space-y-4">
        {assignments.map((a) => (
          <div
            key={`${a.assignment_id}-${a.group_id}`}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h3 className="font-semibold text-lg mb-1">{a.title}</h3>
            <p className="text-gray-600 mb-2">{a.description}</p>
            <p className="text-sm text-gray-500 mb-2">
              Due:{" "}
              {a.due_date
                ? new Date(a.due_date).toLocaleDateString()
                : "No due date"}
            </p>
            <a
              href={a.onedrive_link || "https://onedrive.live.com/"}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              Open OneDrive Folder
            </a>

            <div className="mt-3">
              {a.submitted ? (
                a.confirmed ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                    Confirmed 
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      handleSubmit(a.assignment_id, a.group_id, true)
                    }
                    className="bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Confirm Submission
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleSubmit(a.assignment_id, a.group_id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assignments;
