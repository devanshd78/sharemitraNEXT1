"use client";

import React, { useState, useEffect, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retrieve adminId from localStorage key "user"
  useEffect(() => {
    const userFromStorage = localStorage.getItem("user");
    if (userFromStorage) {
      try {
        const user = JSON.parse(userFromStorage);
        if (user && user.adminId) {
          setAdminId(user.adminId);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage");
      }
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We pass the adminId from localStorage along with email and new password.
        body: JSON.stringify({ adminId, email, password: newPassword }),
      });
      const data = await res.json();
      // Check against the returnstatus key returned by the API.
      if (data.returnstatus !== 200) {
        throw new Error(data.Returnmessage || "Failed to update credentials");
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Update Credentials</h1>
      <Button onClick={() => setOpen(true)}>Update Login Credentials</Button>

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
    </div>
  );
}
