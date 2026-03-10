import React from "react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryDistribution = ({ distribution = [] }) => {
    const chartData = {
        labels: distribution.map(d => d.product?.category?.name || "Sans catégorie"),
        datasets: [
            {
                data: distribution.map(d => d.sold),
                backgroundColor: [
                    "rgba(99, 102, 241, 0.8)",
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(245, 158, 11, 0.8)",
                    "rgba(239, 68, 68, 0.8)",
                    "rgba(107, 114, 128, 0.8)",
                ],
                borderWidth: 0,
                hoverOffset: 10,
            },
        ],
    };

    const options = {
        cutout: "70%",
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 11,
                        weight: "bold",
                        family: "'Inter', sans-serif",
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => ` ${context.label}: ${context.raw} ventes`,
                },
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="h-[300px] relative">
            {distribution.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <p className="text-slate-400 font-bold">Aucune donnée de vente</p>
                </div>
            ) : (
                <Doughnut data={chartData} options={options} />
            )}
        </div>
    );
};

export default CategoryDistribution;
