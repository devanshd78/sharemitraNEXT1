"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogIn,
  Info,
  ClipboardCopy,
  Megaphone,
  Upload,
  Gift,
} from "lucide-react";
import { useModalStore } from "../stores/modalStore";
import LoginModal from "./login";

interface Task {
  taskId: string;         // 👈 Add this
  title: string;
  message: string;
  description: string;
  created_at?: string;
  updatedAt?: string;
}

const steps = [
  {
    title: "Log In",
    description: "Log in to view all available tasks.",
    icon: <LogIn className="w-6 h-6 text-green-600" />,
  },
  {
    title: "Check Details",
    description: "Review the task message and provided link carefully.",
    icon: <Info className="w-6 h-6 text-blue-600" />,
  },
  {
    title: "Copy Message",
    description: "Copy the message to share via WhatsApp or social platforms.",
    icon: <ClipboardCopy className="w-6 h-6 text-yellow-500" />,
  },
  {
    title: "Broadcast on WhatsApp",
    description: "Use WhatsApp broadcast for maximum reach and efficiency.",
    icon: <Megaphone className="w-6 h-6 text-purple-600" />,
  },
  {
    title: "Submit Proof",
    description: "Click 'Proceed to Task' to upload your screenshots.",
    icon: <Upload className="w-6 h-6 text-indigo-600" />,
  },
  {
    title: "Earn Rewards",
    description: "Complete tasks on time to earn rewards 🎉.",
    icon: <Gift className="w-6 h-6 text-pink-600" />,
  },
];


const HomePage: React.FC = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { showLoginModal, closeLoginModal } = useModalStore();
  const heading = "ShareMitra...";
  const [typedText, setTypedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");

    if (ref) {
      localStorage.setItem("referralCode", ref);
    }
  }, []);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:5000/task/newtask");
        const data = await response.json();
        if (data.task) {
          setTasks([data.task]); // Wrap single object in an array
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


  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (charIndex < heading.length) {
      timeout = setTimeout(() => {
        setTypedText((prev) => prev + heading[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 120);
    } else {
      timeout = setTimeout(() => {
        setTypedText("");
        setCharIndex(0);
      }, 1800);
    }
    return () => clearTimeout(timeout);
  }, [charIndex]);

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    alert("Message copied!");
  };

  const handleSendWhatsApp = (message: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleNextStepForTask = (taskId: string) => {
    router.push(`/home/taskupload?taskId=${taskId}`);
  };

  const renderTaskCard = (task: Task) => (
    <div
      key={task.taskId}
      className="bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-700 p-8 rounded-2xl shadow-xl transition hover:shadow-2xl"
    >
      <h3 className="text-3xl font-bold text-green-800 dark:text-green-100 mb-4">
        {task.title}
      </h3>
  
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
  
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-semibold transition"
          onClick={() => handleCopyMessage(`${task.description}\n${task.message}`)}
        >
          Copy Message
        </button>
  
        <button
          className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-md font-semibold transition"
          onClick={() => handleSendWhatsApp(`${task.description}\n${task.message}`)}
        >
          Broadcast on WhatsApp
        </button>
  
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-md font-semibold transition"
          onClick={() => handleSendWhatsApp(`${task.description}\n${task.message}`)}
        >
          Share on WhatsApp
        </button>
  
        <button
          className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-md font-semibold transition"
          onClick={() => handleNextStepForTask(task.taskId)}
        >
          Proceed to Task
        </button>
      </div>
    </div>
  );    


  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-950 text-gray-800 dark:text-white font-[Poppins]">
      {/* Hero Section */}
      <section className="text-center py-24 px-6 bg-gradient-to-br from-green-200 to-green-100 dark:from-zinc-800 dark:to-zinc-900">
        <h1 className="text-6xl md:text-7xl font-extrabold text-green-900 dark:text-green-100 font-serif tracking-wide">
          {typedText}
        </h1>
        <p className="text-2xl mt-6 text-green-800 dark:text-green-200 font-semibold">
          Earn money effortlessly by completing simple online tasks. 🚀
        </p>
      </section>

      {/* About Section */}
      <section id="about" className="w-full bg-white dark:bg-zinc-900 py-16 px-6">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-green-800 dark:text-green-100 mb-6">
      About ShareMitra
    </h2>
    <p className="text-base sm:text-lg lg:text-xl text-center text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
      ShareMitra is your platform to earn money by completing simple online tasks and sharing with others via WhatsApp. Watch this video to get started!
    </p>

        <div className="relative pt-[56.25%] rounded-xl shadow-lg overflow-hidden">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/MpsobHw-2kg?autoplay=1&mute=1&controls=1&rel=0"
            title="Vedic Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

 {/* Tasks Section */}
<section id="task" className="max-w-6xl mx-auto px-6 py-20">
  <h2 className="text-4xl font-bold mb-10 text-green-900 dark:text-green-100 text-center">
    Latest Task
  </h2>

  {isLoggedIn ? (
    loading ? (
      <p className="text-center text-gray-700 dark:text-gray-300">Loading latest task...</p>
    ) : tasks.length === 0 ? (
      <p className="text-center text-gray-700 dark:text-gray-300">
        No tasks available right now. Please check again later.
      </p>
    ) : (
      renderTaskCard(tasks[0])
    )
  ) : (
    <div className="relative rounded-xl overflow-hidden shadow-lg border border-green-200 dark:border-green-700">
      {/* Faint Background Preview */}
      <div className="p-6 bg-white dark:bg-zinc-900 opacity-60 select-none pointer-events-none">
        <h3 className="text-2xl font-semibold text-green-800 dark:text-green-100 mb-2">
          Sample Task Title
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          Share this link to earn: https://example.com/task
        </p>
        <button className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md cursor-not-allowed">
          Share on WhatsApp
        </button>
      </div>

      {/* Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 z-10 flex flex-col items-center justify-center">
        <div className="text-center px-4">
          <div className="text-5xl mb-3">🔒</div>
          <p className="text-lg text-gray-800 dark:text-gray-200 font-semibold">
            Please log in to view and access your tasks.
          </p>
        </div>
      </div>
    </div>
  )}
</section>


      <section id="how-to-do" className="w-full bg-white dark:bg-zinc-900 py-20 px-6">
      <h2 className="text-4xl font-bold mb-12 text-green-800 dark:text-green-100 text-center">
        How to Complete a Task
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-green-50 dark:bg-zinc-800 border border-green-200 dark:border-green-700 rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-100">
                {step.title}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
      {/* Footer */}
      <footer className="bg-green-50 dark:bg-green-900 py-12 mt-auto shadow-inner border-t border-green-200 dark:border-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <h2 className="text-4xl font-extrabold text-center text-green-800 dark:text-green-100 mb-12">
            ShareMitra
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center sm:text-left">
            <div className="flex flex-col items-center">
              <img src="/QR.png" alt="QR Code" className="w-24 sm:w-28 h-auto object-contain rounded-lg shadow-md" />
              <p className="text-sm text-green-700 dark:text-green-300 mt-3">Scan to visit ShareMitra</p>
            </div>

            <div className="flex flex-col gap-2 text-green-800 dark:text-green-200 text-center">
              <h4 className="font-semibold text-lg mb-2">Info</h4>
              <button onClick={() => router.push("/home#about")} className="hover:text-green-900 dark:hover:text-white transition-colors">About</button>
              <button onClick={() => router.push("/home#how-to-do")} className="hover:text-green-900 dark:hover:text-white transition-colors">How to Do</button>
            </div>

            <div className="flex flex-col gap-2 text-green-800 dark:text-green-200 text-center">
              <h4 className="font-semibold text-lg mb-2">Community</h4>
              <a href="https://www.youtube.com/@ShareMitra" target="_blank" className="hover:text-green-900 dark:hover:text-white transition-colors">YouTube</a>
              <a href="https://t.me/sharemitra" target="_blank" className="hover:text-green-900 dark:hover:text-white transition-colors">Telegram</a>
            </div>

            <div className="flex flex-col gap-2 text-green-800 dark:text-green-200 text-center">
              <h4 className="font-semibold text-lg mb-2">Account</h4>
              <button onClick={() => router.push("/login")} className="hover:text-green-900 dark:hover:text-white transition-colors">Login</button>
              <button onClick={() => router.push("/signup")} className="hover:text-green-900 dark:hover:text-white transition-colors">Sign Up</button>
            </div>
          </div>

          <hr className="my-10 border-green-200 dark:border-green-700" />
          <p className="text-center text-sm text-green-700 dark:text-green-300">
            © 2025 <span className="font-semibold">ShareMitra</span>. All rights reserved.
          </p>
        </div>
      </footer>
      {showLoginModal && <LoginModal onClose={closeLoginModal} />}
    </div>
  );
};

export default HomePage;
