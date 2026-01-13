'use client';

import { ReactNode } from 'react';

interface KPICardProps {
    label: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    icon?: ReactNode;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function KPICard({ label, value, trend, icon, color = 'blue' }: KPICardProps) {
    return (
        <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
                    <p className="text-3xl font-bold">{value}</p>

                    {trend && (
                        <div className="mt-2 flex items-center text-sm">
                            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                        </div>
                    )}
                </div>

                {icon && (
                    <div className="ml-4 opacity-60">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
