import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const StatisticsChart = ({ type, data, title, height = 300 }) => {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
        },
    };

    const barOptions = {
        ...commonOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            },
        },
    };

    const pieOptions = {
        ...commonOptions,
        plugins: {
            ...commonOptions.plugins,
            legend: {
                position: 'right',
            },
        },
    };

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return <Bar data={data} options={barOptions} height={height} />;
            case 'pie':
                return <Pie data={data} options={pieOptions} height={height} />;
            case 'doughnut':
                return <Doughnut data={data} options={pieOptions} height={height} />;
            default:
                return <Bar data={data} options={barOptions} height={height} />;
        }
    };

    return (
        <div style={{ height: `${height}px`, width: '100%' }}>
            {renderChart()}
        </div>
    );
};

export default StatisticsChart;