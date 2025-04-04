"use client";

import React, { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TaskModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  formData: {
    title: string;
    description: string;
    message: string;
    task_price: number;
    hidden: number;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  creating: boolean;
  formError: string | null;
  isEditing?: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({
  open,
  setOpen,
  formData,
  handleInputChange,
  handleSubmit,
  creating,
  formError,
  isEditing = false,
}) => {

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{isEditing ? "Edit Task" : "Add Task"}</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[90%] sm:max-w-md md:max-w-lg mx-auto p-4 bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Task" : "Add Task"}
          </DialogTitle>
        </DialogHeader>
        {formError && <p className="text-red-500 mb-2 text-sm">{formError}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </Label>
            <Input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>
          {/* Description */}
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          {/* Message (URL) */}
          <div>
            <Label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message (URL)
            </Label>
            <Input
              id="message"
              type="url"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>
          {/* Task Amount */}
          <div>
            <Label htmlFor="task_price" className="block text-sm font-medium text-gray-700">
              Task Amount
            </Label>
            <Input
              id="task_price"
              type="number"
              name="task_price"
              value={formData.task_price}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>
          {/* Hide Task Toggle */}
          <div className="flex items-center space-x-3">
            <Label htmlFor="hidden" className="block text-sm font-medium text-gray-700">
              Hide Task
            </Label>
            <div
              className={`relative inline-block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                formData.hidden ? 'bg-green-600' : 'bg-gray-300'
              }`}
              onClick={() => {
                // Toggle the value manually when clicking on the custom toggle
                const newValue = formData.hidden ? 0 : 1;
                const syntheticEvent = {
                  target: {
                    name: 'hidden',
                    value: newValue, // Send as number
                  },
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                handleInputChange(syntheticEvent);
              }}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                  formData.hidden ? 'translate-x-4' : ''
                }`}
              ></span>
              {/* Hidden checkbox for accessibility */}
              <input
                id="hidden"
                type="checkbox"
                name="hidden"
                checked={Boolean(formData.hidden)}
                onChange={() => {}}
                className="opacity-0 absolute w-full h-full cursor-pointer"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={creating}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={creating}>
              {creating
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Task'
                  : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
