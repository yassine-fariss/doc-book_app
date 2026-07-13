import React, { useEffect, useState } from "react";
import {
  AlertErrorMessage,
  AuthButton,
  Footer,
  Header,
} from "../../Components";
import { useDispatch, useSelector } from "react-redux";
import { get, storeInLocalStorage } from "../../Services/LocalStorageService";
import { useNavigate } from "react-router";
import axiosClient from "../../AxiosClient";
import { loginSuccess } from "../../Redux/SliceAuthDoctor";
import { Link } from "react-router-dom";
import { useToast } from "../../Context/ToastContext";

const Login = () => {
  document.title = "Doctors Connexion";

  const doctorData = useSelector((state) => state.AuthDoctor);
  const navigate = useNavigate();
  console.log(doctorData);
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
  }, []);

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
      <div className=" absolute w-[100%] h-[133vh]  add_img">
        <div className=" relative bg-black h-[133vh] bg-opacity-75 ">
          <Header />
          <div className="h-[41rem] flex justify-center items-center ">
            <div className="  w-[27rem] rounded-md  bg-white pl-8 pt-7 pr-8 pb-7">
              <div className=" text-center">
                <div className="flex justify-center items-center">
                  <img src="/img/logo.png" className="w-[123px]" alt="" />
                </div>
                <div className="mb-[14px]">
                  <h1 className="mt-4 text-[25px] font-medium text-gray-900 ">
                    Welcome to DocAppoint
                  </h1>
                </div>
                <div>
                  <p className=" text-[14px] text-slate-400	">
                    {" "}
                    Vous creez votre premier compte DocAppoint pour obtenir un
                    rendez-vous avec un medcine !!{" "}
                  </p>
                </div>
              </div>
              {error && <AlertErrorMessage message={error} />}
              <form className="  p-5 pl-8 pr-8 " onSubmit={HandleSubmit}>
                <div className="mb-[20px]">
                  <label
                    htmlFor="email"
                    className="block mb-1 text-[12px]  font-medium text-gray-900 dark:text-white"
                  >
                    Email
                  </label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-[12px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full   py-[4px] dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="exemple@gmail.com"
                    required
                    onChange={HandleChangeData}
                  />
                </div>

                <div className="mb-[20px]">
                  <label
                    htmlFor="Password"
                    className="block mb-1 text-[12px]  font-medium text-gray-900 dark:text-white"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="Password"
                    name="password"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-[12px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full   py-[4px] dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="•••••••••"
                    required
                    onChange={HandleChangeData}
                  />
                </div>
                <div className="flex items-center justify-between mb-4">
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
                
                <div className="flex justify-center items-center w-full ">
                  <AuthButton Text={"se connecter"} Loading={loading} />
                </div>
              </form>
              <div className="  flex justify-center items-center mb-4 ">
                <p className="mt-4 text-[14px] text-gray-500 sm:mt-0">
                  Vous n'avez pas de compte ?
                  <Link to="/doctor/signup" className="text-gray-700 underline">
                    {" "}
                    S'identifier
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
          <Footer colorText="white" />
        </div>
      </div>
    </>
  );
};

export default Login;
