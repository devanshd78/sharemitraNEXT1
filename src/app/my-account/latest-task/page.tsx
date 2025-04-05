"use client";

import { useState, useEffect } from "react";
import { Lexend } from "next/font/google";
import TaskUploadModal from "./screenshotModal";
import { FaLock } from "react-icons/fa";

const lexend = Lexend({
  subsets: ["latin"],
  weight: "400",
});

interface Task {
  taskId: string;
  title: string;
  description: string;
  message: string;
  // You can still keep the status property if needed, but it's not used in this level system.
  status?: "pending" | "completed";
}

export default function LatestTaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // Replace this with your actual authentication logic.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:5000/task/newtask");
        const data = await response.json();
        // If your API returns an array of tasks, adjust accordingly.
        if (data.task) {
          // Wrap single object in an array or use data.tasks if available.
          setTasks(Array.isArray(data.task) ? data.task : [data.task]);
        } else {
          setTasks([]);
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    }

    if (isLoggedIn) fetchTasks();
  }, [isLoggedIn]);

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    alert("Message copied to clipboard!");
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
    setSelectedTaskId(null);
  };

  // Only the first card (index 0) is unlocked; all others are locked.
  const renderTaskCard = (task: Task, index: number) => {
    const isLocked = index !== 0;

    return (
      <div
        key={task.taskId}
        className={`relative bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-700 p-8 rounded-2xl shadow-xl transition hover:shadow-2xl ${lexend.className} ${
          isLocked ? "opacity-50 pointer-events-none filter blur-sm" : ""
        }`}
      >
        {/* Lock overlay for locked cards */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <FaLock className="text-4xl text-gray-500" />
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-3xl font-bold text-green-800 dark:text-green-100`}>
            {task.title}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isLocked ? "bg-red-500 text-white" : "bg-green-500 text-white"
            }`}
          >
            {isLocked ? "Locked" : "Unlocked"}
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

        {/* Interactive buttons are only rendered if the task is unlocked */}
        {!isLocked && (
          <>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-6">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-semibold transition"
                onClick={() =>
                  handleCopyMessage(`${task.description}\n${task.message}`)
                }
              >
                Copy Message
              </button>

              <button
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-md font-semibold transition"
                onClick={() =>
                  handleSendWhatsApp(`${task.description}\n${task.message}`)
                }
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
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Latest Task</h1>
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tasks.map((task, index) => renderTaskCard(task, index))}
        </div>
      ) : (
        <p>No tasks available.</p>
      )}
    </div>
  );
}
