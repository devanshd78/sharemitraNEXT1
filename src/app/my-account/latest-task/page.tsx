"use client";

import React, { useState, useEffect } from "react";
import { Lexend } from "next/font/google";
import TaskUploadModal from "./screenshotModal";
import { FaLock } from "react-icons/fa";
import Swal from "sweetalert2";

const lexend = Lexend({
  subsets: ["latin"],
  weight: "400",
});

interface Task {
  taskId: string;
  title: string;
  description: string;
  message: string;
  status: "unlocked" | "locked" | "completed";
}

export default function LatestTaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Replace with proper auth logic if needed.
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          console.error("User object not found in localStorage");
          return;
        }
        const user = JSON.parse(storedUser);
        if (!user.userId) {
          console.error("userId not found in user object");
          return;
        }
        setLoading(true);
        const response = await fetch("http://127.0.0.1:5000/task/latestTask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.userId }),
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: json.message || "Failed to fetch tasks",
            timer: 1500,
            showConfirmButton: false,
          });
          setTasks([]);
        } else {
          // Access tasks from json.data.tasks, as per centralized response.
          setTasks(json.data.tasks || []);
        }
      } catch (err: any) {
        console.error("Failed to fetch tasks", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to fetch tasks",
          timer: 1500,
          showConfirmButton: false,
        });
      } finally {
        setLoading(false);
      }
    }

    if (isLoggedIn) fetchTasks();
  }, [isLoggedIn]);

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    Swal.fire({
      title: "Copied!",
      text: "Message copied to clipboard.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleSendWhatsApp = (message: string) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleOpenUploadModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowModal(false);
    // Mark the task as completed after upload
    if (selectedTaskId) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === selectedTaskId ? { ...task, status: "completed" } : task
        )
      );
    }
    setSelectedTaskId(null);
  };

  // Render each task card using the server-provided status.
  const renderTaskCard = (task: Task) => {
    const isLocked = task.status === "locked";
    const isDone = task.status === "completed";
    const isUnlocked = task.status === "unlocked";

    // Set badge classes based on status.
    const badgeClasses =
      isLocked ? "bg-red-500 text-white" : isDone ? "bg-blue-500 text-white" : "bg-green-500 text-white";

    return (
      <div
        key={task.taskId}
        className={`relative bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-700 p-8 rounded-2xl shadow-xl transition hover:shadow-2xl ${lexend.className} ${isLocked ? "filter blur-sm" : ""
          }`}
      >
        {isLocked && (
          <button
            onClick={() =>
              alert("This task is locked. Complete previous tasks to unlock it.")
            }
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <FaLock className="text-4xl text-gray-500" />
          </button>
        )}

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-3xl font-bold text-green-800 dark:text-green-100">
            {task.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeClasses}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed">
          {task.description}
        </p>

        <a
          href={task.message}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline break-all block mb-6"
        >
          {task.message}
        </a>

        {isUnlocked && (
          <>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-6">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-semibold transition"
                onClick={() => handleCopyMessage(`${task.description}\n${task.message}`)}
              >
                Copy Message
              </button>

              <button
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-md font-semibold transition"
                onClick={() => handleSendWhatsApp(`${task.description}\n${task.message}`)}
              >
                Share on WhatsApp
              </button>
            </div>

            <hr className="my-4 border-gray-300 dark:border-gray-600" />

            <div className="flex">
              <button
                className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-md font-semibold transition w-full"
                onClick={() => handleOpenUploadModal(task.taskId)}
              >
                Upload Screenshots
              </button>
            </div>
          </>
        )}

        {showModal && selectedTaskId === task.taskId && (
          <TaskUploadModal taskId={task.taskId} onClose={handleCloseUploadModal} />
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-green-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl border border-green-200 dark:border-green-700 p-6">
        <h1 className="text-4xl font-bold mb-8">Latest Task</h1>
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center p-4">
              <svg
                className="animate-spin h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              <span className="ml-2 text-green-600 font-medium">Loading...</span>
            </div>
          </div>
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tasks.map((task) => renderTaskCard(task))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <span className="text-6xl mb-4">📝</span>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              No tasks available.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please check back later for new tasks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
