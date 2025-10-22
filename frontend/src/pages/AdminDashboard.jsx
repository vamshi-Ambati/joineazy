import React, { useEffect, useState } from "react";
import apiUrl from "../apiUrl";

const AdminDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    oneDriveLink: "",
  });
  const [submissions, setSubmissions] = useState({}); // { assignmentId: [submissions] }

  const token = localStorage.getItem("token");

  // Fetch all assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
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

  // Fetch submissions for a specific assignment
  const fetchSubmissions = async (assignmentId) => {
    try {
      const res = await fetch(
        `${apiUrl}/assignments/submissions/${assignmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setSubmissions((prev) => ({ ...prev, [assignmentId]: data }));
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (token) fetchAssignments();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${apiUrl}/assignments/update-assignment/${editing}`
      : `${apiUrl}/assignments/create-assignment`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error saving assignment");

      setShowForm(false);
      setEditing(null);
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        oneDriveLink: "",
      });
      fetchAssignments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (assignment) => {
    setEditing(assignment.id);
    setFormData({
      title: assignment.title,
      description: assignment.description || "",
      dueDate: assignment.due_date?.split("T")[0],
      oneDriveLink: assignment.onedrive_link || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?"))
      return;

    try {
      const res = await fetch(`${apiUrl}/assignments/delete-assignment/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error deleting assignment");
      fetchAssignments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Professor Dashboard</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            setFormData({
              title: "",
              description: "",
              dueDate: "",
              oneDriveLink: "",
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? "Cancel" : "Create Assignment"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-lg shadow mb-6 space-y-3"
        >
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="url"
            placeholder="OneDrive Link"
            value={formData.oneDriveLink}
            onChange={(e) =>
              setFormData({ ...formData, oneDriveLink: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {editing ? "Update Assignment" : "Save Assignment"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{a.title}</h3>
                  <p className="text-gray-600">{a.description}</p>
                  <p className="text-sm">
                    Due: {new Date(a.due_date).toLocaleDateString()}
                  </p>
                  {a.onedrive_link && (
                    <a
                      href={a.onedrive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline text-sm"
                    >
                      OneDrive Link
                    </a>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(a)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => fetchSubmissions(a.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    View Submissions
                  </button>
                </div>
              </div>

              {/* Submissions List */}
              {submissions[a.id] && submissions[a.id].length > 0 && (
                <div className="mt-3 border-t pt-2">
                  <h4 className="font-semibold mb-2">Submissions:</h4>
                  {submissions[a.id].map((s) => (
                    <div key={s.id} className="text-sm mb-1">
                      <p>
                        {s.student_name} ({s.email}) -{" "}
                        <a
                          href={s.file_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Submission
                        </a>{" "}
                        - {new Date(s.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
