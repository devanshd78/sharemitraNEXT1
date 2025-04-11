"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface StateOption {
  stateId: string;
  state: string;
  cities: { cityId: string; name: string }[];
}

const Contact: React.FC = () => {
  // Base styling for inputs
  const baseInputClass =
    "w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400";
  const inputClass = baseInputClass;
  const selectClass = baseInputClass;
  const textareaClass = baseInputClass;

  // Updated form state including IDs and names for state and city
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    phoneNumber: "",
    stateId: "",
    stateName: "",
    cityId: "",
    cityName: "",
    address: "",
  });

  // State options fetched from API
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  // City options for selected state
  const [cityOptions, setCityOptions] = useState<{ cityId: string; name: string }[]>([]);

  // Fetch states and cities from API on mount.
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/contact/india_states")
      .then((res) => {
        // Expected API response structure:
        // { success: true, message: "...", data: { states: [ { stateId, state, cities: [ { cityId, name } ] } ] } }
        if (res.data && res.data.success) {
          setStateOptions(res.data.data.states);
        } else {
          console.error("Failed to fetch states:", res.data.message);
        }
      })
      .catch((err) => {
        console.error("Error fetching states:", err);
      });
  }, []);

  // Custom handler for state selection.
  const handleStateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedStateId = e.target.value;
    // Find the selected state object.
    const selectedState = stateOptions.find((s) => s.stateId === selectedStateId);
    setFormData((prev) => ({
      ...prev,
      stateId: selectedStateId,
      stateName: selectedState ? selectedState.state : "",
      // Reset city fields when state changes.
      cityId: "",
      cityName: "",
    }));
    setCityOptions(selectedState ? selectedState.cities : []);
  };

  // Custom handler for city selection.
  const handleCityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedCityId = e.target.value;
    const selectedCity = cityOptions.find((city) => city.cityId === selectedCityId);
    setFormData((prev) => ({
      ...prev,
      cityId: selectedCityId,
      cityName: selectedCity ? selectedCity.name : "",
    }));
  };

  // General handleChange for other inputs.
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  
    // Create payload with keys expected by the backend.
    const payload = {
      fullname: formData.fullName,
      email: formData.email,
      phonemumber: formData.phoneNumber,
      subject: formData.subject,
      message: formData.message,
      stateId: formData.stateId,
      state: formData.stateName,
      cityId: formData.cityId,
      city: formData.cityName,
      address: formData.address,
    };
  
    axios
      .post("http://127.0.0.1:5000/contact/store", payload, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        if (res.data && res.data.success) {
          // Show SweetAlert success notification.
          Swal.fire({
            icon: "success",
            title: "Success",
            text: res.data.message,
            timer: 1500,
            showConfirmButton: false,
          });
          setFormData({
            fullName: "",
            email: "",
            subject: "",
            message: "",
            phoneNumber: "",
            stateId: "",
            stateName: "",
            cityId: "",
            cityName: "",
            address: "",
          });
        } else {
          // Show SweetAlert error notification if API returns failure.
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res.data.message || "Submission error",
            timer: 1500,
            showConfirmButton: false,
          });
          console.error("Submission error: ", res.data.message);
        }
      })
      .catch((err) => {
        // Handle errors from the API or network issues.
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || err.message,
          timer: 1500,
          showConfirmButton: false,
        });
        console.error("Failed to submit contact form:", err.response?.data || err.message);
      });
  };
  

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-950 py-24 px-4 text-gray-800 dark:text-gray-100">
      <div className="max-w-7xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-lg border border-green-200 dark:border-green-700 p-6 sm:p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-2 text-4xl sm:text-5xl font-extrabold text-green-800 dark:text-green-200">
            Contact Us
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We'd love to hear from you. Fill out the form below and we’ll get back to you shortly.
          </p>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Left Column Fields */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phoneNumber"
              placeholder="9876543210"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              placeholder="123 Main St"
              value={formData.address}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          {/* Right Column Fields */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              placeholder="Feedback, Support, or Query"
              value={formData.subject}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              rows={5}
              placeholder="Write your message here..."
              value={formData.message}
              onChange={handleChange}
              required
              className={textareaClass}
            ></textarea>
          </div>
          {/* State and City Selections */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              State <span className="text-red-500">*</span>
            </label>
            <select
              name="stateId"
              value={formData.stateId}
              onChange={handleStateChange}
              required
              className={selectClass}
            >
              <option value="">Select State</option>
              {stateOptions.map((state) => (
                <option key={state.stateId} value={state.stateId}>
                  {state.state}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              City <span className="text-red-500">*</span>
            </label>
            <select
              name="cityId"
              value={formData.cityId}
              onChange={handleCityChange}
              disabled={!formData.stateId}
              required
              className={`${selectClass} ${!formData.stateId ? "bg-gray-200 dark:bg-zinc-600 cursor-not-allowed" : ""}`}
            >
              <option value="">Select City</option>
              {cityOptions.map((city) => (
                <option key={city.cityId} value={city.cityId}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
