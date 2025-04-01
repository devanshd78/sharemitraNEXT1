"use client";

import React, { useRef, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"];

const TaskUpload: React.FC = () => {
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const fileInput1Ref = useRef<HTMLInputElement | null>(null);
  const fileInput2Ref = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = event.target.files?.[0];
    setError("");

    if (file) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError("Only JPG, JPEG, PNG, HEIC formats are allowed.");
        return;
      }
      setImage(file);
    }
  };

  const removeImage = (
    setImage: React.Dispatch<React.SetStateAction<File | null>>,
    fileInputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!image1 || !image2) {
      setError("Please select both screenshots before submitting.");
      return;
    }

    setError("");

    Swal.fire({
      title: "Verifying...",
      text: "Please wait while we verify your screenshots.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const formData = new FormData();
    formData.append("image", image1);
    formData.append("group_image", image2);

    try {
      const response = await fetch("http://localhost:5000/image/api/verify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      Swal.close();

      if (data.verified) {
        Swal.fire({
          icon: "success",
          title: "✅ Verified Successfully",
          html: `
            <div class="text-left">
              <p><strong>Matched Link:</strong> ${data.matched_link}</p>
              <p><strong>Group Name:</strong> ${data.group_name}</p>
              <p><strong>Participants:</strong> ${data.participant_count}</p>
            </div>
          `,
          confirmButtonColor: "#16a34a",
        }).then(() => {
          router.push("/payment-details");
        });
      } else {
        const mismatchInfo =
          data.group_check?.group_name && data.message_group_info?.group_name
            ? `<p><strong>Group Info Image:</strong> ${data.group_check.group_name}</p>
               <p><strong>Message Image:</strong> ${data.message_group_info.group_name}</p>`
            : "";

        Swal.fire({
          icon: "error",
          title: "❌ Verification Failed",
          html: `
            <p>${data.message || "Could not verify screenshots."}</p>
            ${mismatchInfo}
          `,
          confirmButtonColor: "#b91c1c",
        });
      }
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Please try again later.",
        confirmButtonColor: "#b91c1c",
      });
    }
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-950 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-8 border border-green-200 dark:border-green-800">
        <h1 className="text-3xl font-bold text-center text-green-800 dark:text-green-100 mb-8">
          Upload Task Screenshots
        </h1>

        {/* Message Screenshot */}
        <div className="mb-6">
          <label className="block text-green-900 dark:text-green-200 font-medium mb-2">
            Message Screenshot
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInput1Ref}
            onChange={(e) => handleImageChange(e, setImage1)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          />
          {image1 && (
            <div className="relative mt-3">
              <img
                src={URL.createObjectURL(image1)}
                alt="Preview 1"
                className="w-full h-48 object-cover rounded-lg border border-green-200"
              />
              <button
                onClick={() => removeImage(setImage1, fileInput1Ref)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Broadcast Screenshot */}
        <div className="mb-6">
          <label className="block text-green-900 dark:text-green-200 font-medium mb-2">
            Broadcast List Screenshot
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInput2Ref}
            onChange={(e) => handleImageChange(e, setImage2)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          />
          {image2 && (
            <div className="relative mt-3">
              <img
                src={URL.createObjectURL(image2)}
                alt="Preview 2"
                className="w-full h-48 object-cover rounded-lg border border-green-200"
              />
              <button
                onClick={() => removeImage(setImage2, fileInput2Ref)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-300"
        >
          Submit for Verification
        </button>
      </div>
    </div>
  );
};

export default TaskUpload;
