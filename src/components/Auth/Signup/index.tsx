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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      // Generate username and names from email
      const email = formData.email;
      const username = email.split("@")[0];
      const [first, ...rest] = username.split(/[._-]/);
      const first_name = first || username;
      const last_name = rest.join(" ") || username;

      // Prepare payload for backend
      const payload = {
        username,
        email,
        password: formData.password,
        user_type: "customer",
        phone: "",
        company_name: "",
        first_name,
        last_name,
        date_joined: new Date().toISOString(),
        profile_picture: "",
      };

      await axios.post("/api/auth/signup/", payload);

      toast.success("Signup successful! Please check your email for verification.");
      router.push("/signin");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
          <div className="text-center mb-11">
            <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
              Create an Account
            </h2>
            <p>Enter your details below</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="email" className="block mb-2.5">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
                className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none"
              />
            </div>
            <div className="mb-5">
              <label htmlFor="password" className="block mb-2.5">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none"
              />
            </div>
            <div className="mb-5">
              <label htmlFor="confirmPassword" className="block mb-2.5">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
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
      </section>
    </>
  );
};

export default Signup;
