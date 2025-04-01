"use client";

import React, { useEffect, useState } from "react";

interface Task {
  taskId: string;
  title: string;
  message: string;
  link: string;
  created_at: string;
  isNew: number;
}

const PrevTask: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/task/prevtasks");
        const data = await response.json();

        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        } else {
          setTasks([]);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Message copied to clipboard!");
  };

  const handleWhatsAppShare = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const renderTaskCard = (task: Task) => (
    <div
      key={task.taskId}
      className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-green-100 dark:border-green-800 cursor-pointer"
    >
      <h3 className="text-2xl font-semibold text-green-900 dark:text-green-100 mb-2">
        {task.title}
      </h3>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
        {task.message}
      </p>

      <a
        href={task.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 underline break-all mb-4 inline-block hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
      >
        {task.link}
      </a>

      <div className="flex flex-wrap gap-3 pt-2">
        {/* <button
          onClick={() => handleCopy(`${task.message}\n${task.link}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer"
        >
          📋 Copy Message
        </button>
        <button
          onClick={() => handleWhatsAppShare(`${task.message}\n${task.link}`)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer"
        >
          📤 Share on WhatsApp
        </button> */}
        <a
          href={task.link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer"
        >
          🔗 Visit Link
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-950 px-4 pt-28 pb-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-green-900 dark:text-green-100 mb-10 text-center">
          Previous Tasks
        </h1>

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-300">Loading previous tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300">No previous tasks available.</p>
        ) : (
          <div className="space-y-8">
            {tasks.map((task) => renderTaskCard(task))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrevTask;
