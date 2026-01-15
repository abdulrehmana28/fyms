import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, Loader } from "lucide-react";
import { resetPassword } from "../../store/slices/authSlice";

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [noToken, setNoToken] = useState(false);

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isUpdatingPassword } = useSelector((state) => state.auth);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token || token.trim() === "") {
      setNoToken(true);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (noToken) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(
        resetPassword({
          token: token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        })
      ).unwrap();

      navigate("/login");
    } catch (error) {
      setErrors({ general: error || "Failed to reset password" });
    }
  };

  if (noToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Invalid Reset Link
          </h1>
          <p className="text-slate-600">
            The reset link is missing or invalid. Please request a new password
            reset.
          </p>
          <Link
            to="/forgot-password"
            className="btn btn-primary mt-4 inline-block"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              {/* TODO: Add custom icon or logo */}
              <BookOpen className="w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              CapTrak Final Year Project Management System
            </h1>
            <p className="text-slate-600 mt-2">Reset your password</p>
          </div>
          {/* Reset Password Form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}
              {/* Password Input */}
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input ${errors.password ? "input-error" : ""}`}
                  placeholder="Enter Your New Password"
                />
                {errors.password && (
                  <p className="text-red-600 mt-1 text-sm">{errors.password}</p>
                )}
              </div>
              {/* Confirm Password Input */}
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input ${
                    errors.confirmPassword ? "input-error" : ""
                  }`}
                  placeholder="Confirm Your New Password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 mt-1 text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-blue-500 hover:underline text-sm"
                >
                  Back to Login
                </Link>
              </div>
              <button
                type="submit"
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <div className="flex items-center justify-center">
                    <Loader className="-ml-1 mr-3 w-5 h-5 text-white animate-spin" />
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
