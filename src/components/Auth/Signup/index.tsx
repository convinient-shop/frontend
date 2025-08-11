'use client';

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { register, googleAuth } from "@/redux/features/user-slice";
import { useRouter } from "next/navigation";
import axios from "axios";

const Signup = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    user_type: "customer",
    phone: "",
    company_name: "",
    first_name: "",
    last_name: "",
    date_joined: new Date().toISOString(),
    profile_picture: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const payload = { ...formData };
      delete payload.confirmPassword; // Remove confirmPassword before sending

      await axios.post("/api/auth/signup/", payload);
      toast.success("Successfully signed up!");
      router.push("/signin");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      toast.error('Google did not return an ID token');
      return;
    }
    setIsLoading(true);
    try {
      await dispatch(googleAuth(idToken)).unwrap();
      toast.success('Successfully signed up with Google!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your details below</p>
            </div>

            <div>
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="username" className="block mb-2.5">
                    Username
                  </label>

                  <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Enter your username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="confirmPassword" className="block mb-2.5">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="first_name" className="block mb-2.5">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="last_name" className="block mb-2.5">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="phone" className="block mb-2.5">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="company_name" className="block mb-2.5">
                    Company Name
                  </label>

                  <input
                    type="text"
                    name="company_name"
                    id="company_name"
                    placeholder="Enter your company name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>

                <span className="relative z-1 block font-medium text-center mt-4.5">
                  <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                  <span className="inline-block px-3 bg-white">Or</span>
                </span>

                <div className="flex flex-col gap-4.5 mt-4.5">
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google sign up failed')}
                    />
                  </div>
                </div>

                <p className="text-center mt-6">
                  Already have an account?
                  <Link
                    href="/signin"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Sign In Now!
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
