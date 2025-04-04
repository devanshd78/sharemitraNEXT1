"use client";

import React, { useState, FormEvent } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

interface AdminCredentialsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AdminCredentialsModal: React.FC<AdminCredentialsModalProps> = ({ open, setOpen }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/update_credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update credentials");
      }
      Swal.fire("Success", "Login credentials updated successfully", "success");
      setOpen(false);
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Update Login Credentials
          </DialogTitle>
        </DialogHeader>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={saving}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCredentialsModal;
