import React, { useState } from "react";
import { Footer, Header } from "../Components";
import { Link } from "react-router-dom";
import { CheckCircleIcon, EnvelopeIcon, ArrowLeftIcon } from "@heroicons/react/20/solid";

const ForgotPassword = () => {
  document.title = "Forgot Password - DocAppoint";
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <>
      <div className="absolute w-[100%] h-[100vh] add_img">
        <div className="relative bg-black h-[100vh] bg-opacity-75 flex flex-col justify-between">
          <Header />
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-[27rem] rounded-2xl bg-white p-8 shadow-xl text-left space-y-6">
              <div className="text-center space-y-2">
                <img src="/img/logo.png" className="w-[120px] mx-auto" alt="Logo" />
                <h2 className="text-xl font-bold text-gray-900 pt-2">Password Recovery</h2>
                <p className="text-xs text-gray-400">Enter your registered email below to receive reset instructions.</p>
              </div>

              {submitted ? (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-100">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 text-sm">Instructions Sent!</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      We've dispatched a mock password recovery email to <strong>{email}</strong>.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link to="/Connexion" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:text-blue-700">
                      <ArrowLeftIcon className="w-4 h-4" /> Back to Login
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 text-center font-medium">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                        <EnvelopeIcon className="w-5 h-5" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-50 pl-10 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 outline-none transition"
                      />
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-md hover:shadow-lg">
                    Send Reset Link
                  </button>
                  
                  <div className="text-center pt-2">
                    <Link to="/Connexion" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:text-blue-700">
                      <ArrowLeftIcon className="w-4 h-4" /> Back to Login
                    </Link>
                  </div>
                </form>
              )}

            </div>
          </div>
          <Footer colorText="white" />
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
