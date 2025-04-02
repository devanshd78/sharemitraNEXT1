"use client"

import React, { useState, useEffect, FormEvent } from 'react';
import TaskModal from './taskModal';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from '@/components/ui/table';

interface Task {
  taskId: string;
  title: string;
  description?: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    message: '',
  });
  const [open, setOpen] = useState<boolean>(false);

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/task/getall');
      const data = await res.json();
      if (data.task) {
        setTasks(data.task);
      } else {
        setError('Failed to load tasks.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit the new task
  const handleCreateTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    try {
      const res = await fetch('http://127.0.0.1:5000/task/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create task');
      } else {
        // Refresh task list after successful creation
        fetchTasks();
        setOpen(false);
        setFormData({ title: '', description: '', message: '' });
      }
    } catch (err) {
      console.error(err);
      setFormError('An error occurred while creating the task.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Task Management</h1>
        <TaskModal
          open={open}
          setOpen={setOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handleCreateTask={handleCreateTask}
          creating={creating}
          formError={formError}
        />
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-3">Task ID</TableHead>
                <TableHead className="px-6 py-3">Title</TableHead>
                <TableHead className="px-6 py-3">Description</TableHead>
                <TableHead className="px-6 py-3">Message (URL)</TableHead>
                <TableHead className="px-6 py-3">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.taskId} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {task.taskId}
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
                    {new Date(task.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
