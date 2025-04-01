"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const TaskStatus = () => {
  const [tasks] = useState([
    { id: 1, name: "Design Homepage", status: "Pending", timestamp: "2025-03-20 10:30 AM" },
    { id: 2, name: "Fix Bug #42", status: "Not Completed", timestamp: "2025-03-19 03:15 PM" },
    { id: 3, name: "Deploy to Production", status: "Completed", timestamp: "2025-03-18 08:00 AM" },
  ]);

  const statusStyles = (status: string) => {
    switch (status) {
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
    <div className="min-h-screen bg-green-50 dark:bg-zinc-950 text-gray-800 dark:text-gray-100 py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-green-200 dark:border-green-700 p-4 sm:p-6 md:p-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-green-900 dark:text-green-200 mb-8">
          Task Status History
        </h2>

        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-sm sm:text-base border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 uppercase tracking-wide">
                <th className="px-4 py-3 rounded-tl-lg text-left">No.</th>
                <th className="px-4 py-3 text-left">Task Name</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 rounded-tr-lg text-left">Timestamp</th>
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
                  <td className="px-4 py-4 font-semibold text-gray-800 dark:text-gray-100">{task.id}</td>
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{task.name}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${statusStyles(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {task.timestamp}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskStatus;
