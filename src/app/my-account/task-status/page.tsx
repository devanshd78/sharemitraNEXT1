"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TaskHistory {
  taskId: string;
  userId: string;
  matched_link: string;
  task_name: string; // Updated to reflect task name instead of group name
  participant_count: number;
  task_details: any;
  verified: boolean;
  verifiedAt: string;
  image_phash: string;
  task_price: number;
}

const TaskStatus: React.FC = () => {
  const [tasks, setTasks] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Determines the status string and corresponding style classes
  const getStatusInfo = (verified: boolean) => {
    if (verified) {
      return { status: "Completed", style: "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100" };
    } else {
      return { status: "Rejected", style: "bg-red-100 dark:bg-red-700 text-red-800 dark:text-red-100" };
    }
  };

  useEffect(() => {
    const fetchTaskHistory = async () => {
      try {
        // Get the userId from local storage (adjust the key if necessary)
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (!user || !user.userId) {
          throw new Error("User not found. Please log in.");
        }

        const response = await fetch("http://127.0.0.1:5000/task/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.userId }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch task history");
        }

        const json = await response.json();
        // Expected response: { userId: string, task_history: TaskHistory[] }
        setTasks(json.task_history);
      } catch (error: any) {
        console.error("Error fetching task history:", error);
        setError(error.message || "An error occurred while fetching task history.");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskHistory();
  }, []);

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-950 text-gray-800 dark:text-gray-100 p-6 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-green-200 dark:border-green-700 p-4 sm:p-6 md:p-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-green-900 dark:text-green-200 mb-8">
          Task Status History
        </h2>

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Loading tasks...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <span className="text-6xl mb-4">📝</span>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              You haven't completed any tasks yet!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start working on some tasks.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-sm sm:text-base border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 uppercase tracking-wide">
                  <th className="px-4 py-3 rounded-tl-lg text-left">No.</th>
                  <th className="px-4 py-3 text-left">Task Title</th>
                  <th className="px-4 py-3 text-left">Link</th>
                  <th className="px-4 py-3 text-left">Task Description</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => {
                  const { status, style } = getStatusInfo(task.verified);
                  return (
                    <motion.tr
                      key={task.taskId}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white dark:bg-zinc-800 border border-green-100 dark:border-green-700 rounded-lg shadow-sm hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
                    >
                      <td className="px-4 py-4 font-semibold text-gray-800 dark:text-gray-100">{index + 1}</td>
                      <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{task.task_name}</td>
                      <td className="px-4 py-4 text-gray-700 dark:text-gray-200"> <a href={task.matched_link} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800">
                        {task.matched_link} </a> 
                      </td>
                      <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{task.task_details.description}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${style}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(task.verifiedAt).toLocaleString()}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskStatus;
