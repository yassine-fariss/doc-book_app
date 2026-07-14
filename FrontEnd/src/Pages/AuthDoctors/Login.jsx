import React, { useEffect, useState } from "react";
import {
  AlertErrorMessage,
  AuthButton,
  Footer,
  Header,
} from "../../Components";
import { useDispatch, useSelector } from "react-redux";
import { get, storeInLocalStorage } from "../../Services/LocalStorageService";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosClient from "../../AxiosClient";
import { loginSuccess } from "../../Redux/SliceAuthDoctor";
import { useToast } from "../../Context/ToastContext";

const Login = () => {
  document.title = "Doctors Connexion";

  const doctorData = useSelector((state) => state.AuthDoctor);
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { showToast } = useToast();

  useEffect(() => {
    if (doctorData.isAuthenticated && get("TOKEN_DOCTOR")) {
      navigate("/doctor/dashboard");
    }
  }, [navigate, doctorData.isAuthenticated]);

  const [rememberMe, setRememberMe] = useState(false);
  const [DataForm, setDataForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Load remember me details on mount
  useEffect(() => {
    const savedEmail = get("REMEMBER_ME_DOCTOR");
    if (savedEmail) {
      setDataForm((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }

    // Check for demo autofill query param
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("demo") === "doctor") {
      setDataForm({
        email: "demo.doctor@healthconnect.ma",
        password: "DemoDoctor123!",
      });
    }
  }, [location]);

  const HandleChangeData = (ev) => {
    const { name, value } = ev.target;
    setDataForm({ ...DataForm, [name]: value });
  };

  const HandleSubmit = (e) => {
    e.preventDefault();
    
    // Front-end Form Validation
    if (!DataForm.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (DataForm.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    
    setError("");
    setLoading(true);
    
    axiosClient
      .post("/doctor/login", DataForm)
      .then(({ data }) => {
        dispatch(loginSuccess(data));
        storeInLocalStorage("TOKEN_DOCTOR", data.token);
        
        // Handle Remember Me storage logic
        if (rememberMe) {
          storeInLocalStorage("REMEMBER_ME_DOCTOR", DataForm.email);
        } else {
          localStorage.removeItem("REMEMBER_ME_DOCTOR");
        }
        
        showToast("Login successful! Welcome back, Doctor.", "success");
        setLoading(false);
        navigate("/doctor/dashboard");
      })
      .catch((err) => {
        setLoading(false);
        const errMsg = err.response?.data?.message || "Invalid login credentials.";
        setError(errMsg);
        showToast(errMsg, "error");
      });
  };

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-10 space-y-6 text-left animate-fade-in">
            
            {/* Header info */}
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <img src="/img/logo.png" className="w-[123px] object-contain" alt="DocAppoint logo" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Doctor Login</h2>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                Sign in to your doctor dashboard panel to review schedules and coordinate consultations.
              </p>
            </div>

            {error && <AlertErrorMessage message={error} />}

            <form className="space-y-4" onSubmit={HandleSubmit}>
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={DataForm.email}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition"
                  placeholder="doctor@example.com"
                  required
                  onChange={HandleChangeData}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="Password" className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Password
                </label>
                <input
                  type="password"
                  id="Password"
                  name="password"
                  value={DataForm.password}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition"
                  placeholder="••••••••"
                  required
                  onChange={HandleChangeData}
                />
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded outline-none"
                  />
                  <span>Remember Me</span>
                </label>
                <Link to="/forgotpassword" className="text-xs text-blue-600 font-bold hover:underline">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <AuthButton Text={"Login"} Loading={loading} />
              </div>
            </form>

            {/* DEMO ACCOUNTS SECTION */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Presentation Demo Accounts
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/Connexion?demo=patient"
                  className="w-full py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs transition duration-200 border border-blue-200 flex justify-center items-center"
                >
                  Patient Demo
                </Link>
                <button
                  type="button"
                  onClick={() => setDataForm({ email: "demo.doctor@healthconnect.ma", password: "DemoDoctor123!" })}
                  className="w-full py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-xl text-xs transition duration-200 border border-indigo-200"
                >
                  Doctor Demo
                </button>
              </div>
            </div>

            <div className="border-t border-gray-50 pt-6 text-center space-y-3">
              <p className="text-xs md:text-sm text-gray-500">
                New practitioner on platform?{" "}
                <Link to="/doctor/signup" className="text-blue-600 font-bold hover:underline">
                  Join Now
                </Link>
              </p>
              <p className="text-xs text-gray-400">
                Are you a patient?{" "}
                <Link to="/Connexion" className="text-blue-600 font-semibold hover:underline">
                  Patient Login
                </Link>
              </p>
            </div>

          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default Login;
