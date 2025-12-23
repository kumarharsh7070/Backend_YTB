import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post(`/users/reset-password/${token}`, {
        newPassword,
      });

      setMessage("Password reset successful 🎉");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-indigo-900 to-purple-900">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-xl shadow-2xl">
        
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Reset Password
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-4">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-400 text-center mb-4">
            {message}
          </p>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="text"
            placeholder="Reset token"
            className="w-full px-4 py-3 rounded bg-slate-800 text-white outline-none focus:ring-2 focus:ring-indigo-500"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New password"
            className="w-full px-4 py-3 rounded bg-slate-800 text-white outline-none focus:ring-2 focus:ring-indigo-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Back to{" "}
          <Link to="/" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
