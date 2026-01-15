import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
import { BookOpen, Loader } from "lucide-react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const dispatch = useDispatch();
  const { isLoggingIn, authUser } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", formData.role);
    try {
      await dispatch(login(data)).unwrap();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error?.message || "Login failed. Please try again.",
      }));
    }
  };

  useEffect(() => {
    if (authUser) {
      switch (authUser.role) {
        case "Student":
          navigate("/student");
          break;
        case "Teacher":
          navigate("/teacher");
          break;
        case "Admin":
          navigate("/admin");
          break;
          // Todo: Properly handle unexpected roles
        default:
          navigate("/login");
      }
    }
  }, [authUser, navigate]);

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
            <p className="text-slate-600 mt-2">Sign in to your account</p>
          </div>
          {/* Login Form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}
              {/* Email Input */}
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input ${errors.email ? "input-error" : ""}`}
                  placeholder="Enter Your Email"
                />
                {errors.email && (
                  <p className="text-red-600 mt-1 text-sm ">{errors.email}</p>
                )}
              </div>
              {/* Password Input */}
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input ${errors.password ? "input-error" : ""}`}
                  placeholder="Enter Your Password"
                />
                {errors.password && (
                  <p className="text-red-600 mt-1 text-sm ">
                    {errors.password}
                  </p>
                )}
              </div>
              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-blue-500 hover:underline text-sm"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Role Selection */}
              {/* TODO: Handle role selection properly & Securely */}
              <div>
                <label className="label">Select Role</label>
                <select
                  name="role"
                  className="input"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <div className="flex items-center justify-center">
                    <Loader className="-ml-1 mr-3 w-5 h-5 text-white animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
