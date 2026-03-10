import React, { useRef, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SalesChart = ({ data = { labels: [], values: [] } }) => {
  const chartRef = useRef(null);
  const [gradient, setGradient] = useState(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.ctx;
      const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
      gradientFill.addColorStop(0, "rgba(99, 102, 241, 0.2)");
      gradientFill.addColorStop(1, "rgba(99, 102, 241, 0)");
      setGradient(gradientFill);
    }
  }, []);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Ventes (F)",
        data: data.values,
        fill: true,
        backgroundColor: gradient,
        borderColor: "#6366f1", // indigo-500
        borderWidth: 4,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#6366f1",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#6366f1",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 12, weight: "bold", family: "'Inter', sans-serif" },
        bodyFont: { size: 14, weight: "black", family: "'Inter', sans-serif" },
        padding: 16,
        borderRadius: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${Number(context.raw).toLocaleString()} F`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10, weight: "bold", family: "'Inter', sans-serif" },
          color: "#94a3b8",
        },
      },
      y: {
        grid: { color: "rgba(241, 245, 249, 1)", drawBorder: false },
        ticks: {
          font: { size: 10, weight: "bold", family: "'Inter', sans-serif" },
          color: "#94a3b8",
          callback: (value) => `${value / 1000}k`,
        },
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default SalesChart;