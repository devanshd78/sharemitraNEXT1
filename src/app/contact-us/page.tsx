"use client";

import React, { useState, FormEvent } from "react";

const Contact: React.FC = () => {
  // Consistent styling classes for all fields
  const baseInputClass =
    "w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400";
  const inputClass = baseInputClass;
  const selectClass = baseInputClass;
  const textareaClass = baseInputClass;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    phoneNumber: "",
    state: "",
    city: "",
    employmentStatus: "",
    profession: "",
    companyName: "",
    businessName: "",
    businessAddress: "",
  });

  const [states] = useState([
    { name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur"] },
    { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur"] },
    { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Mangaluru"] },
  ]);
  const [cities, setCities] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // When the state changes, update the cities and reset the selected city.
    if (name === "state") {
      const selectedState = states.find((state) => state.name === value);
      setCities(selectedState ? selectedState.cities : []);
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
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
              Employment Status <span className="text-red-500">*</span>
            </label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
              required
              className={selectClass}
            >
              <option value="">Select Status</option>
              <option value="Employed">Employed</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Student">Student</option>
            </select>
          </div>
          {(formData.employmentStatus === "Employed" ||
            formData.employmentStatus === "Self-Employed") && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  placeholder="Your Business Name"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Business Address
                </label>
                <input
                  type="text"
                  name="businessAddress"
                  placeholder="Your Business Address"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Profession
            </label>
            <input
              type="text"
              name="profession"
              placeholder="Your Profession"
              value={formData.profession}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              placeholder="Your Company Name"
              value={formData.companyName}
              onChange={handleChange}
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
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              State <span className="text-red-500">*</span>
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className={selectClass}
            >
              <option value="">Select State</option>
              {states.map((state, index) => (
                <option key={index} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              City <span className="text-red-500">*</span>
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!formData.state}
              required
              className={`${selectClass} ${!formData.state ? "bg-gray-200 dark:bg-zinc-600 cursor-not-allowed" : ""}`}
            >
              <option value="">Select City</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>
                  {city}
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
