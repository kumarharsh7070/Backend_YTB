import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [showResend, setShowResend] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const navigate = useNavigate();

  // 🔐 Password strength logic
  const getStrength = () => {
    if (newPassword.length < 6) return "Weak";
    if (
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[0-9]/.test(newPassword)
    )
      return "Strong";
    return "Medium";
  };

  const strength = getStrength();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setShowResend(false);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post(`/users/reset-password/${token}`, {
        newPassword,
      });

      setSuccess(true);
      setMessage("Password reset successful 🎉");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Reset link is invalid or expired"
      );
      setShowResend(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendMsg("");
      await api.post("/users/forgot-password", {
        email: localStorage.getItem("resetEmail"),
      });
      setResendMsg("New reset link sent to your email 📩");
    } catch {
      setResendMsg("Failed to resend reset link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-indigo-900 to-purple-900">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-xl shadow-2xl">

        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Reset Password
        </h2>

        {/* ❌ Error */}
        {error && (
          <p className="text-red-400 text-center mb-4">{error}</p>
        )}

        {/* ✅ Success animation */}
        {success && (
          <div className="text-green-400 text-center mb-4 animate-pulse">
            ✅ Password updated successfully
          </div>
        )}

        {/* 🔁 Resend reset email */}
        {showResend && (
          <div className="text-center mb-4">
            <button
              onClick={handleResend}
              className="text-indigo-400 hover:underline text-sm"
            >
              Resend reset email
            </button>

            {resendMsg && (
              <p className="text-green-400 text-sm mt-2">{resendMsg}</p>
            )}
          </div>
        )}

        {!success && (
          <form onSubmit={handleReset} className="space-y-4">

            {/* New password with eye toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                className="w-full px-4 py-3 pr-12 rounded bg-slate-800 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Strength meter */}
            <p
              className={`text-sm ${
                strength === "Weak"
                  ? "text-red-400"
                  : strength === "Medium"
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              Password strength: {strength}
            </p>

            {/* Confirm password with eye toggle */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                className="w-full px-4 py-3 pr-12 rounded bg-slate-800 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold transition"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

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
