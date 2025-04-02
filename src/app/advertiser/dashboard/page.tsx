"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ChartOptions,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

const AdminDashboard = () => {
  // Dummy summary metrics (replace with real data)
  const expenseThisMonth = "₹ 5,000";
  const userRegisterThisMonth = "150";
  const userRegisterToday = "5";

  // Dummy data for Bar Chart (Weekly Expense Breakdown)
  const barData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Expenses",
        data: [1200, 1500, 1000, 1300],
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top", // "top" is now treated as a literal type
      },
      title: {
        display: true,
        text: "Weekly Expenses",
      },
    },
  };

  // Dummy data for Line Chart (User Registration Trend)
  const lineData = {
    labels: ["1", "5", "10", "15", "20", "25", "30"],
    datasets: [
      {
        label: "User Registrations",
        data: [10, 15, 20, 18, 25, 22, 30],
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top", // "top" is correctly inferred as a literal type
      },
      title: {
        display: true,
        text: "User Registrations Trend",
      },
    },
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-4xl font-bold text-center">Advertiser Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{expenseThisMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Register This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{userRegisterThisMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Register Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{userRegisterToday}</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={barData} options={barOptions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Registrations Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={lineData} options={lineOptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
