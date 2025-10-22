import React, { useState, useEffect } from "react";
import apiUrl from "../apiUrl";

const GroupManagement = () => {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchGroups();
  }, [token]);

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${apiUrl}/groups/get-groups-by-user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch groups");
      setGroups(data?.groups || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName) return alert("Enter a group name");
    try {
      const res = await fetch(`${apiUrl}/groups/create-group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: groupName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create group");
      else fetchGroups();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddMember = async (groupId) => {
    const email = prompt("Enter member email:");
    if (!email) return;
    try {
      const res = await fetch(`${apiUrl}/groups/add-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ member_email: email, group_id: groupId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add member");
      else fetchGroups();
      // setGroups(
      //   groups && groups.map((g) =>
      //     g.id === groupId ? { ...g, members: [...g.members, data.email] } : g
      //   )
      // );
      
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Group Management</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Group Name"
          className="border p-2 rounded flex-1"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button
          onClick={handleCreateGroup}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          Create Group
        </button>
      </div>
      <ul className="space-y-4">
        {groups.map((group) => (
          <li key={group.id} className="border p-4 rounded shadow">
            <h3 className="font-semibold mb-2">{group.name}</h3>
            <button
              onClick={() => handleAddMember(group.id)}
              className="bg-green-600 text-white px-3 py-1 rounded mb-2"
            >
              Add Member
            </button>
            <ul className="ml-4">
              {group?.members?.map((m, idx) => (
                <li key={idx} className="border p-2 rounded mb-1">
                  {m.name} - {m.email}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupManagement;
