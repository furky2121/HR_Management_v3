import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { classNames } from 'primereact/utils';

const StatisticsCard = ({
    title,
    value,
    previousValue = 0,
    icon,
    color = 'blue',
    showTrend = true,
    animate = true,
    format = 'number'
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [trend, setTrend] = useState(null);

    useEffect(() => {
        if (animate && value !== displayValue) {
            const duration = 1000;
            const steps = 50;
            const increment = (value - displayValue) / steps;
            const stepDuration = duration / steps;

            let currentStep = 0;
            const timer = setInterval(() => {
                currentStep++;
                if (currentStep < steps) {
                    setDisplayValue(prev => Math.floor(prev + increment));
                } else {
                    setDisplayValue(value);
                    clearInterval(timer);
                }
            }, stepDuration);

            return () => clearInterval(timer);
        } else {
            setDisplayValue(value);
        }
    }, [value, animate]);

    useEffect(() => {
        if (showTrend && previousValue !== undefined) {
            const diff = value - previousValue;
            const percentage = previousValue > 0 ? ((diff / previousValue) * 100) : 0;
            setTrend({
                value: Math.abs(percentage),
                direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
                absolute: Math.abs(diff)
            });
        }
    }, [value, previousValue, showTrend]);

    const formatValue = (val) => {
        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                }).format(val);
            case 'percentage':
                return `${val}%`;
            default:
                return val.toLocaleString('tr-TR');
        }
    };

    const getTrendIcon = () => {
        if (!trend) return null;
        switch (trend.direction) {
            case 'up':
                return 'pi pi-arrow-up';
            case 'down':
                return 'pi pi-arrow-down';
            default:
                return 'pi pi-minus';
        }
    };

    const getTrendColor = () => {
        if (!trend) return 'text-600';
        switch (trend.direction) {
            case 'up':
                return 'text-green-600';
            case 'down':
                return 'text-red-600';
            default:
                return 'text-600';
        }
    };

    return (
        <Card className="statistics-card mb-3 cursor-pointer transition-all transition-duration-200 hover:shadow-4">
            <div className="flex align-items-center justify-content-between">
                <div className="flex-1">
                    <div className={classNames(
                        'text-3xl font-bold mb-1 transition-all transition-duration-500',
                        animate ? 'animate-fadeInUp' : ''
                    )}>
                        {formatValue(displayValue)}
                    </div>
                    <div className="text-600 font-medium text-sm mb-2">{title}</div>
                    {showTrend && trend && (
                        <div className={classNames(
                            'flex align-items-center gap-1 text-xs',
                            getTrendColor()
                        )}>
                            <i className={getTrendIcon()}></i>
                            <span>{trend.value.toFixed(1)}%</span>
                            <span className="text-500 ml-1">
                                ({trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}{trend.absolute})
                            </span>
                        </div>
                    )}
                </div>
                <div className={classNames(
                    'border-circle w-3rem h-3rem flex align-items-center justify-content-center transition-all transition-duration-300 hover:scale-110',
                    {
                        'bg-blue-100 text-blue-600': color === 'blue',
                        'bg-green-100 text-green-600': color === 'green',
                        'bg-orange-100 text-orange-600': color === 'orange',
                        'bg-purple-100 text-purple-600': color === 'purple',
                        'bg-teal-100 text-teal-600': color === 'teal',
                        'bg-red-100 text-red-600': color === 'red',
                        'bg-yellow-100 text-yellow-600': color === 'yellow',
                        'bg-indigo-100 text-indigo-600': color === 'indigo'
                    }
                )}>
                    <i className={`${icon} text-xl`}></i>
                </div>
            </div>
        </Card>
    );
};

export default StatisticsCard;