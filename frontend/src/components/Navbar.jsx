import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="font-bold text-xl">🎓 Joineazy</h1>
      <div className="flex gap-4">
        {token ? (
          <>
            {role === "student" && (
              <>
                <Link to="/student/dashboard">Dashboard</Link>
                <Link to="/group">Groups</Link>
              </>
            )}
            {role === "admin" && <Link to="/admin/dashboard">Admin</Link>}
            <Link to="/assignments">Assignments</Link>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-3 py-1 rounded-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
