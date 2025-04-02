"use client"

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
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCreateTask: (e: FormEvent<HTMLFormElement>) => void;
  creating: boolean;
  formError: string | null;
}

const TaskModal: React.FC<TaskModalProps> = ({
  open,
  setOpen,
  formData,
  handleInputChange,
  handleCreateTask,
  creating,
  formError,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Task</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[90%] sm:max-w-md md:max-w-lg mx-auto p-4 bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Task</DialogTitle>
        </DialogHeader>
        {formError && <p className="text-red-500 mb-2 text-sm">{formError}</p>}
        <form onSubmit={handleCreateTask} className="space-y-4">
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
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={creating}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
