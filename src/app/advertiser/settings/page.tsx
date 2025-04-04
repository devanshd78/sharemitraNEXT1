"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import AdminCredentialsModal from "./adminModal";

interface Settings {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: number; // 0 or 1
}

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    siteTitle: "",
    siteDescription: "",
    contactEmail: "",
    maintenanceMode: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:5000/admin/settings", {
          method: "GET",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load settings.");
        }
        setSettings({
          siteTitle: data.siteTitle || "",
          siteDescription: data.siteDescription || "",
          contactEmail: data.contactEmail || "",
          maintenanceMode: data.maintenanceMode || 0,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const toggleMaintenanceMode = () => {
    setSettings((prev) => ({
      ...prev,
      maintenanceMode: prev.maintenanceMode ? 0 : 1,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings.");
      }
      Swal.fire("Success", "Settings updated successfully.", "success");
    } catch (err: any) {
      setError(err.message);
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Site Title */}
            <div>
              <Label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700">
                Site Title
              </Label>
              <Input
                id="siteTitle"
                name="siteTitle"
                type="text"
                value={settings.siteTitle}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>
            {/* Site Description */}
            <div>
              <Label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                Site Description
              </Label>
              <textarea
                id="siteDescription"
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleInputChange}
                className="mt-1 w-full border rounded p-2"
                rows={3}
              />
            </div>
            {/* Contact Email */}
            <div>
              <Label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>
            {/* Maintenance Mode Toggle */}
            <div className="flex items-center space-x-3">
              <Label htmlFor="maintenanceMode" className="block text-sm font-medium text-gray-700">
                Maintenance Mode
              </Label>
              <div
                onClick={toggleMaintenanceMode}
                className={`relative inline-block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                  settings.maintenanceMode ? "bg-red-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                    settings.maintenanceMode ? "translate-x-4" : ""
                  }`}
                ></span>
                <input
                  id="maintenanceMode"
                  type="checkbox"
                  name="maintenanceMode"
                  checked={Boolean(settings.maintenanceMode)}
                  onChange={() => {}}
                  className="opacity-0 absolute w-full h-full cursor-pointer"
                />
              </div>
              <span className="text-sm">
                {settings.maintenanceMode ? "Enabled" : "Disabled"}
              </span>
            </div>
            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="submit" disabled={saving} className="bg-green-600 text-white hover:bg-green-700">
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {/* Credentials Modal */}
      <AdminCredentialsModal open={credentialsModalOpen} setOpen={setCredentialsModalOpen} />
      <div className="flex justify-end">
        <Button onClick={() => setCredentialsModalOpen(true)} variant="outline">
          Update Login Credentials
        </Button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
