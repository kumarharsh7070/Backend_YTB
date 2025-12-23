import { useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post("/users/forgot-password", { email });
      setMessage("Reset link generated. Check backend console.");

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-indigo-900 to-purple-900">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-xl shadow-2xl">
        
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Forgot Password
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

        <form onSubmit={handleForgot} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded bg-slate-800 text-white outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Remembered your password?{" "}
          <Link to="/" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
