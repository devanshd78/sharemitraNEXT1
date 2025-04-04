"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  // Today's date in YYYY-MM-DD format (max selectable)
  const today = new Date().toISOString().split("T")[0];

  // Date range states for charts (default to current month)
  const [expenseStartDate, setExpenseStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  });
  const [expenseEndDate, setExpenseEndDate] = useState(today);

  const [registrationStartDate, setRegistrationStartDate] = useState(expenseStartDate);
  const [registrationEndDate, setRegistrationEndDate] = useState(today);

  const [tasksCompletedStartDate, setTasksCompletedStartDate] = useState(expenseStartDate);
  const [tasksCompletedEndDate, setTasksCompletedEndDate] = useState(today);

  // Second row states for "today" data, but allow date range selection.
  const [todayRegistrationsStartDate, setTodayRegistrationsStartDate] = useState(today);
  const [todayRegistrationsEndDate, setTodayRegistrationsEndDate] = useState(today);
  const [todayTasksCompletedStartDate, setTodayTasksCompletedStartDate] = useState(today);
  const [todayTasksCompletedEndDate, setTodayTasksCompletedEndDate] = useState(today);

  // Overview state from API (/dash/overview)
  const [overview, setOverview] = useState<any>(null);

  // Chart data states (fetched from your endpoints)
  const [expenseGraph, setExpenseGraph] = useState<any>(null);
  const [registrationGraph, setRegistrationGraph] = useState<any>(null);
  const [tasksCompletedGraph, setTasksCompletedGraph] = useState<any>(null);

  // Metric state for "today" registration and tasks completed (based on selected range)
  const [todayRegistrationsMetric, setTodayRegistrationsMetric] = useState<number>(0);
  const [todayTasksCompletedMetric, setTodayTasksCompletedMetric] = useState<number>(0);

  // New state variables for chart type selection for each graph
  const [expenseChartType, setExpenseChartType] = useState("bar");
  const [registrationChartType, setRegistrationChartType] = useState("line");
  const [tasksCompletedChartType, setTasksCompletedChartType] = useState("line");

  // Chart options (these can be adjusted if needed for different chart types)
  const expenseChartOptions: ChartOptions<any> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Expense Trend" },
    },
  };

  const registrationChartOptions: ChartOptions<any> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "User Registration Trend" },
    },
  };

  const tasksCompletedChartOptions: ChartOptions<any> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Tasks Completed Trend" },
    },
  };

  // Fetch Overview Data from API
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/dash/overview");
        const data = await res.json();
        if (res.ok) {
          setOverview(data);
        } else {
          Swal.fire("Error", data.error || "Overview API error", "error");
          console.error("Overview API error:", data.error);
        }
      } catch (e) {
        Swal.fire("Error", "Overview fetch error", "error");
        console.error("Overview fetch error:", e);
      }
    };
    fetchOverview();
  }, []);

  // Fetch Expense Chart Data from API
  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        const payload = { start_date: expenseStartDate, end_date: expenseEndDate };
        const res = await fetch("http://127.0.0.1:5000/dash/expense", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.graph) {
          const labels = data.graph.map((item: any) =>
            item.date ? item.date : `Week ${item.week}`
          );
          const totals = data.graph.map((item: any) => item.total);
          setExpenseGraph({
            labels,
            datasets: [
              {
                label: "Expenses",
                data: totals,
                fill: false,
                backgroundColor: "rgba(75,192,192,0.6)",
                tension: 0.1,
                borderColor:"rgba(75,192,192,0.6)"
                
              },
            ],
          });
        }
      } catch (e) {
        Swal.fire("Error", "Expense fetch error", "error");
        console.error("Expense fetch error:", e);
      }
    };
    fetchExpenseData();
  }, [expenseStartDate, expenseEndDate]);

  // Fetch Registration Chart Data from API
  useEffect(() => {
    const fetchRegistrationData = async () => {
      try {
        const payload = { start_date: registrationStartDate, end_date: registrationEndDate };
        const res = await fetch("http://127.0.0.1:5000/dash/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.graph) {
          const labels = data.graph.map((item: any) =>
            item.date ? item.date : `Week ${item.week}`
          );
          const totals = data.graph.map((item: any) => item.total);
          setRegistrationGraph({
            labels,
            datasets: [
              {
                label: "Registrations",
                data: totals,
                fill: false,
                backgroundColor: "rgba(54,162,235,1)",
                tension: 0.1,
                borderColor:"rgba(54,162,235,1)"
              },
            ],
          });
        }
      } catch (e) {
        Swal.fire("Error", "Registration fetch error", "error");
        console.error("Registration fetch error:", e);
      }
    };
    fetchRegistrationData();
  }, [registrationStartDate, registrationEndDate]);

  // Fetch Tasks Completed Chart Data from API (for main chart)
  useEffect(() => {
    const fetchTasksCompletedData = async () => {
      try {
        const payload = { start_date: tasksCompletedStartDate, end_date: tasksCompletedEndDate };
        const res = await fetch("http://127.0.0.1:5000/dash/completion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.graph) {
          const labels = data.graph.map((item: any) =>
            item.date ? item.date : `Week ${item.week}`
          );
          const totals = data.graph.map((item: any) => item.total);
          setTasksCompletedGraph({
            labels,
            datasets: [
              {
                label: "Tasks Completed",
                data: totals,
                fill: false,
                backgroundColor: "rgba(255,99,132,1)",
                tension: 0.1,
                borderColor: "rgba(255,99,132,1)",
              },
            ],
          });
        }
      } catch (e) {
        Swal.fire("Error", "Tasks Completed fetch error", "error");
        console.error("Tasks Completed fetch error:", e);
      }
    };
    fetchTasksCompletedData();
  }, [tasksCompletedStartDate, tasksCompletedEndDate]);

  // Fetch Tasks Completed (Summary) Data for Second Row
  useEffect(() => {
    const fetchTodayTasksCompleted = async () => {
      try {
        const payload = { start_date: todayTasksCompletedStartDate, end_date: todayTasksCompletedEndDate };
        const res = await fetch("http://127.0.0.1:5000/dash/completion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setTodayTasksCompletedMetric(data.total_completed);
        }
      } catch (e) {
        Swal.fire("Error", "Today Tasks Completed fetch error", "error");
        console.error("Today Tasks Completed fetch error:", e);
      }
    };
    fetchTodayTasksCompleted();
  }, [todayTasksCompletedStartDate, todayTasksCompletedEndDate]);

  // Fetch Users Registered (Summary) Data for Second Row
  useEffect(() => {
    const fetchTodayRegistrations = async () => {
      try {
        const payload = { start_date: todayRegistrationsStartDate, end_date: todayRegistrationsEndDate };
        const res = await fetch("http://127.0.0.1:5000/dash/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setTodayRegistrationsMetric(data.total_registrations);
        }
      } catch (e) {
        Swal.fire("Error", "Today Registrations fetch error", "error");
        console.error("Today Registrations fetch error:", e);
      }
    };
    fetchTodayRegistrations();
  }, [todayRegistrationsStartDate, todayRegistrationsEndDate]);

  // Dynamic Titles for Second Row Cards
  const tasksCompletedTitle =
    todayTasksCompletedStartDate === todayTasksCompletedEndDate
      ? "Tasks Completed Today"
      : `Tasks Completed from ${todayTasksCompletedStartDate} to ${todayTasksCompletedEndDate}`;

  const usersRegisteredTitle =
    todayRegistrationsStartDate === todayRegistrationsEndDate
      ? "Users Registered Today"
      : `Users Registered from ${todayRegistrationsStartDate} to ${todayRegistrationsEndDate}`;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-4xl font-bold text-center">Advertiser Dashboard</h1>

      {/* First Row: Summary Cards for Total Users, Total Tasks, & Expense */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-800">
              {overview ? overview.total_users : "Loading..."}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-800">
              {overview ? overview.total_tasks : "Loading..."}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-800">
              {overview ? `₹ ${overview.total_expense.toLocaleString()}` : "Loading..."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Summary Cards for Tasks Completed & Users Registered Today (or by selected range) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks Completed Summary */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-xl">{tasksCompletedTitle}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium">From:</label>
              <Input
                type="date"
                value={todayTasksCompletedStartDate}
                onChange={(e) => setTodayTasksCompletedStartDate(e.target.value)}
                max={today}
                className="max-w-xs"
              />
              <label className="text-sm font-medium">To:</label>
              <Input
                type="date"
                value={todayTasksCompletedEndDate}
                onChange={(e) => setTodayTasksCompletedEndDate(e.target.value)}
                max={today}
                className="max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-800">
              {todayTasksCompletedMetric || 0}
            </p>
          </CardContent>
        </Card>

        {/* Users Registered Summary */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-xl">{usersRegisteredTitle}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium">From:</label>
              <Input
                type="date"
                value={todayRegistrationsStartDate}
                onChange={(e) => setTodayRegistrationsStartDate(e.target.value)}
                max={today}
                className="max-w-xs"
              />
              <label className="text-sm font-medium">To:</label>
              <Input
                type="date"
                value={todayRegistrationsEndDate}
                onChange={(e) => setTodayRegistrationsEndDate(e.target.value)}
                max={today}
                className="max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-800">
              {todayRegistrationsMetric || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Trend Graph */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Expense Trend</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">From:</label>
                <Input
                  type="date"
                  value={expenseStartDate}
                  onChange={(e) => setExpenseStartDate(e.target.value)}
                  max={today}
                  className="max-w-xs"
                />
                <label className="text-sm font-medium">To:</label>
                <Input
                  type="date"
                  value={expenseEndDate}
                  onChange={(e) => setExpenseEndDate(e.target.value)}
                  max={today}
                  className="max-w-xs"
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <label className="text-sm font-medium">Chart Type:</label>
              <select
                value={expenseChartType}
                onChange={(e) => setExpenseChartType(e.target.value)}
                className="p-1 border rounded"
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {expenseGraph ? (
              expenseChartType === "bar" ? (
                <Bar data={expenseGraph} options={expenseChartOptions} />
              ) : (
                <Line data={expenseGraph} options={expenseChartOptions} />
              )
            ) : (
              <p className="text-center">No expense chart data available</p>
            )}
          </CardContent>
        </Card>

        {/* User Registration Trend Graph */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>User Registrations Trend</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">From:</label>
                <Input
                  type="date"
                  value={registrationStartDate}
                  onChange={(e) => setRegistrationStartDate(e.target.value)}
                  max={today}
                  className="max-w-xs"
                />
                <label className="text-sm font-medium">To:</label>
                <Input
                  type="date"
                  value={registrationEndDate}
                  onChange={(e) => setRegistrationEndDate(e.target.value)}
                  max={today}
                  className="max-w-xs"
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <label className="text-sm font-medium">Chart Type:</label>
              <select
                value={registrationChartType}
                onChange={(e) => setRegistrationChartType(e.target.value)}
                className="p-1 border rounded"
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {registrationGraph ? (
              registrationChartType === "bar" ? (
                <Bar data={registrationGraph} options={registrationChartOptions} />
              ) : (
                <Line data={registrationGraph} options={registrationChartOptions} />
              )
            ) : (
              <p className="text-center">No registration chart data available</p>
            )}
          </CardContent>
        </Card>

        {/* Tasks Completed Trend Graph */}
        <Card className="shadow-lg md:col-span-2">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Tasks Completed Trend</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">From:</label>
                <Input
                  type="date"
                  value={tasksCompletedStartDate}
                  onChange={(e) => setTasksCompletedStartDate(e.target.value)}
                  max={today}
                  className="max-w-xs"
                />
                <label className="text-sm font-medium">To:</label>
                <Input
                  type="date"
                  value={tasksCompletedEndDate}
                  onChange={(e) => setTasksCompletedEndDate(e.target.value)}
                  max={today}
                  className="max-w-xs"
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <label className="text-sm font-medium">Chart Type:</label>
              <select
                value={tasksCompletedChartType}
                onChange={(e) => setTasksCompletedChartType(e.target.value)}
                className="p-1 border rounded"
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {tasksCompletedGraph ? (
              tasksCompletedChartType === "bar" ? (
                <Bar data={tasksCompletedGraph} options={tasksCompletedChartOptions} />
              ) : (
                <Line data={tasksCompletedGraph} options={tasksCompletedChartOptions} />
              )
            ) : (
              <p className="text-center">No tasks completed chart data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
