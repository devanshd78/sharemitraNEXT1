"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description?: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

const TaskStatus: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks"); // Update with actual API endpoint
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data: Task[] = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    //fetchTasks();
  }, []);

  const statusStyles = (message: string) => {
    switch (message) {
      case "Completed":
        return "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100";
      case "Pending":
        return "bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-100";
      case "Not Completed":
        return "bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-950 text-gray-800 dark:text-gray-100 p-6 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-green-200 dark:border-green-700 p-4 sm:p-6 md:p-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-green-900 dark:text-green-200 mb-8">
          Task Status History
        </h2>

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          // 👇 Show this message if no tasks are available
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
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white dark:bg-zinc-800 border border-green-100 dark:border-green-700 rounded-lg shadow-sm hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
                  >
                    <td className="px-4 py-4 font-semibold text-gray-800 dark:text-gray-100">{index + 1}</td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{task.title}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${statusStyles(
                          task.message
                        )}`}
                      >
                        {task.message}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(task.createdAt).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskStatus;