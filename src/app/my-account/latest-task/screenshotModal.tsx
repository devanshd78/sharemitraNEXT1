"use client";

import React, { useRef, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Props {
  taskId: string | null;
  onClose: () => void;
}

// Allowed image MIME types.
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"];

const TaskUploadModal: React.FC<Props> = ({ taskId, onClose }) => {
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [error, setError] = useState("");

  const fileInput1Ref = useRef<HTMLInputElement | null>(null);
  const fileInput2Ref = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  // Handle file selection and validate MIME type.
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

  // Remove image and reset the corresponding file input.
  const removeImage = (
    setImage: React.Dispatch<React.SetStateAction<File | null>>,
    fileInputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle task screenshot submission.
  const handleSubmit = async () => {
    if (!image1 || !image2) {
      setError("Please select both screenshots before submitting.");
      return;
    }

    setError("");

    // Show a loading modal.
    Swal.fire({
      title: "Verifying...",
      text: "Please wait while we verify your screenshots.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const formData = new FormData();
    formData.append("image", image1);
    formData.append("group_image", image2);
    formData.append("taskId", taskId ?? "");

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    formData.append("userId", user?.userId ?? "");

    try {
      const response = await fetch("http://localhost:5000/image/api/verify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      Swal.close();

      // Check both HTTP status and centralized success flag.
      if (response.ok && data.success) {
        Swal.fire({
          icon: "success",
          title: "✅ Verified Successfully",
          html: `
            <div class="text-left">
              <p><strong>Matched Link:</strong> ${data.data.matched_link}</p>
              <p><strong>Group Name:</strong> ${data.data.group_name}</p>
              <p><strong>Participants:</strong> ${data.data.participant_count}</p>
            </div>
          `,
          confirmButtonColor: "#16a34a",
          confirmButtonText: "Withdraw",
        }).then(() => {
          onClose();
          router.push("/my-account/wallet");
        });
      } else {
        // If API indicates failure via a false success flag.
        const errMsg =
          data.message || data.error || "Could not verify screenshots.";
        let mismatchInfo = "";
        if (data.data?.group_check?.group_name && data.data?.message_group_info?.group_name) {
          mismatchInfo = `<p><strong>Group Info Image:</strong> ${data.data.group_check.group_name}</p>
          <p><strong>Message Image:</strong> ${data.data.message_group_info.group_name}</p>`;
        }
        Swal.fire({
          icon: "error",
          title: "❌ Verification Failed",
          html: `
            <p>${errMsg}</p>
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

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-8 border border-green-200 dark:border-green-800 relative overflow-y">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold text-center text-green-800 dark:text-green-100 mb-8">
          Upload Task Screenshots
        </h1>

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
        </div>

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
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

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

export default TaskUploadModal;
