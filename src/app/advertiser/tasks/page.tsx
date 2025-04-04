"use client";

import React, { useState, useEffect, FormEvent } from "react";
import TaskModal from "./taskModal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { FiEdit, FiTrash2, FiChevronUp, FiChevronDown, FiDownload, FiEye, FiEyeOff } from "react-icons/fi";
import Swal from "sweetalert2";

interface Task {
  taskId: string;
  title: string;
  description?: string;
  message: string;
  task_price: number;
  hidden: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const TasksPage: React.FC = () => {
  // Local states for tasks, modal form, loading, errors, etc.
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    message: "",
    task_price: 0,
    hidden: 0,
  });
  const [open, setOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // States for search, sorting, and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch tasks from backend with pagination, search and sorting
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/task/getall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: debouncedSearchQuery,
          page: currentPage - 1, // Backend expects zero-indexed page
          per_page: rowsPerPage,
          // If your backend supports sorting, you can send sortField and sortOrder here.
          sortField,
          sortOrder,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load tasks.");
      } else {
        setTasks(data.tasks);
        setTotalRows(data.total);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching tasks.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks on initial load and whenever dependencies change
  useEffect(() => {
    fetchTasks();
  }, [debouncedSearchQuery, currentPage, rowsPerPage, sortField, sortOrder]);

  // Reset page to 1 whenever search query or rows per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, rowsPerPage]);

  // Handle form input changes for modal
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit the new or updated task
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    try {
      if (editMode && editingTaskId) {
        // Update existing task
        const res = await fetch("http://127.0.0.1:5000/task/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: editingTaskId, ...formData }),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "Failed to update task");
        } else {
          fetchTasks();
          setOpen(false);
          setFormData({ title: "", description: "", message: "", task_price: 0, hidden: 0 });
          setEditMode(false);
          setEditingTaskId(null);
        }
      } else {
        // Create new task
        const res = await fetch("http://127.0.0.1:5000/task/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "Failed to create task");
        } else {
          fetchTasks();
          setOpen(false);
          setFormData({ title: "", description: "", message: "", task_price: 0, hidden: 0 });
        }
      }
    } catch (err) {
      console.error(err);
      setFormError("An error occurred while processing the task.");
    } finally {
      setCreating(false);
    }
  };

  // Called when user clicks edit icon: prefill the modal form with task data.
  const handleEditTask = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description || "",
      message: task.message,
      task_price: task.task_price,
      hidden: task.hidden,
    });
    setEditingTaskId(task.taskId);
    setEditMode(true);
    setOpen(true);
  };

  // Called when user clicks delete icon.
  const handleDeleteTask = async (task: Task) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This task will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const res = await fetch("http://127.0.0.1:5000/task/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: task.taskId }),
        });
        const data = await res.json();
        if (res.ok) {
          Swal.fire("Deleted!", data.message || "Task deleted successfully.", "success");
          fetchTasks();
        } else {
          Swal.fire("Error", data.error, "error");
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete the task.", "error");
      }
    }
  };

  const handleToggleHidden = async (task: Task) => {
    const actionText = task.hidden ? "unhide" : "hide";
    const confirmToggle = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${actionText} this task?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
      confirmButtonText: `Yes, ${actionText} it!`,
    });

    if (confirmToggle.isConfirmed) {
      try {
        // Toggle hidden value: if currently hidden (non-zero), set to 0; else set to 1.
        const newHidden = task.hidden ? 0 : 1;
        const res = await fetch("http://127.0.0.1:5000/task/togglehide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: task.taskId, isHide: newHidden }),
        });
        const data = await res.json();
        if (res.ok) {
          Swal.fire("Updated!", data.message || "Task updated successfully.", "success");
          fetchTasks();
        } else {
          Swal.fire("Error", data.error, "error");
        }
      } catch (error) {
        Swal.fire("Error", "Failed to update task.", "error");
      }
    }
  };

  // Handle sorting when a header is clicked
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const showingFrom = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(currentPage * rowsPerPage, totalRows);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Export tasks to Excel by calling the download endpoint
  const handleExportExcel = () => {
    if (tasks.length === 0) {
      Swal.fire("No tasks", "There are no tasks to export.", "info");
      return;
    }

    fetch("http://127.0.0.1:5000/download/tasks", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Convert the response into a blob
        return response.blob();
      })
      .then((blob) => {
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "tasks.xlsx";
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);
        // Optionally revoke the object URL later:
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error exporting tasks:", error);
        Swal.fire("Error", "Failed to export tasks.", "error");
      });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Task Management Heading and Modal */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Task Management</h1>
        <TaskModal
          open={open}
          setOpen={(value) => {
            setOpen(value);
            if (!value) {
              setEditMode(false);
              setEditingTaskId(null);
              setFormData({ title: "", description: "", message: "", task_price: 0, hidden: 0 });
            }
          }}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          creating={creating}
          formError={formError}
          isEditing={editMode}
        />
      </div>

      {/* Search and Rows Per Page Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
        />
        <div className="flex items-center gap-2">
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
          >
            {[5, 10, 20, 50].map((num) => (
              <option key={num} value={num}>
                {num} rows
              </option>
            ))}
          </select>
          <Button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-2"
          >
            <FiDownload size={18} /> Download Excel
          </Button>
        </div>
      </div>

      {/* Task Table */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("taskId")} className="px-6 py-3 cursor-pointer">
                  Task ID {sortField === "taskId" && (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
                </TableHead>
                <TableHead className="px-6 py-3">Hidden</TableHead>
                <TableHead onClick={() => handleSort("title")} className="px-6 py-3 cursor-pointer">
                  Title {sortField === "title" && (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
                </TableHead>
                <TableHead onClick={() => handleSort("description")} className="px-6 py-3 cursor-pointer">
                  Description {sortField === "description" && (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
                </TableHead>
                <TableHead onClick={() => handleSort("message")} className="px-6 py-3 cursor-pointer">
                  Message (URL) {sortField === "message" && (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
                </TableHead>
                <TableHead onClick={() => handleSort("task_price")} className="px-6 py-3 cursor-pointer">
                  Task Price {sortField === "task_price" && (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
                </TableHead>
                <TableHead onClick={() => handleSort("status")} className="px-6 py-3 cursor-pointer">
                  Status {sortField === "status" && (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
                </TableHead>
                <TableHead onClick={() => handleSort("createdAt")} className="px-6 py-3 cursor-pointer">
                  Created At {sortField === "createdAt" && (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
                </TableHead>
                <TableHead className="px-6 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.taskId} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {task.taskId}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {task.hidden ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {task.title}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {task.description}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={task.message}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {task.message}
                    </a>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {task.task_price}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {task.status}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(task.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleEditTask(task)} title="Edit">
                        <FiEdit className="text-green-600 hover:text-green-800" size={18} />
                      </button>
                      <button onClick={() => handleDeleteTask(task)} title="Delete">
                        <FiTrash2 className="text-red-600 hover:text-red-800" size={18} />
                      </button>
                      <button onClick={() => handleToggleHidden(task)} title={task.hidden ? "Unhide" : "Hide"}>
                        {task.hidden ? (
                          <FiEye className="text-blue-600 hover:text-blue-800" size={18} />
                        ) : (
                          <FiEyeOff className="text-blue-600 hover:text-blue-800" size={18} />
                        )}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
        <div>
          <span className="text-sm">
            Showing {showingFrom} to {showingTo} of {totalRows} tasks
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
