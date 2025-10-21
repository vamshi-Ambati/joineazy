import React, { useState, useEffect } from "react";
import apiUrl from "../apiUrl";

const Assignments = () => {
  const [submitted, setSubmitted] = useState(false);
  const [assignment, setAssignment] = useState({ title: "", link: "" });

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/assignments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch assignment");
        setAssignment(data);
        setSubmitted(data.submitted);
      } catch (err) {
        alert(err.message);
      }
    };
    fetchAssignment();
  }, []);

  const handleConfirm = async () => {
    if (!window.confirm("Have you uploaded your assignment to OneDrive?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/assignments/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignmentId: assignment.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");
      setSubmitted(true);
      alert("Assignment submitted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Assignments</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <p>Title: {assignment.title || "Loading..."}</p>
        <a
          href={assignment.link || "https://onedrive.live.com/"}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          Open OneDrive Link
        </a>
        <button
          onClick={handleConfirm}
          className="bg-green-600 text-white px-3 py-2 rounded ml-4"
          disabled={submitted}
        >
          {submitted ? "Submitted" : "Confirm Submission"}
        </button>
      </div>
    </div>
  );
};

export default Assignments;
