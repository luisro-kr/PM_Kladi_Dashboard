'use client';

import { FunnelData } from '../../../types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface Section2FunnelProps {
    funnel: FunnelData;
}

const STAGE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function Section2Funnel({ funnel }: Section2FunnelProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Funnel de Conversión</h2>
                <p className="text-gray-600">Seguimiento del proceso desde creación hasta pago</p>
            </div>

            {/* Funnel Visualization */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={funnel.stages}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="stage" type="category" />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                                                <p className="font-semibold">{data.stage}</p>
                                                <p className="text-sm">Empresas: {data.count}</p>
                                                <p className="text-sm">Del total: {data.percentage.toFixed(1)}%</p>
                                                {data.conversionRate !== undefined && (
                                                    <p className="text-sm text-green-600">
                                                        Conversión: {data.conversionRate.toFixed(1)}%
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                                {funnel.stages.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Conversion Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {funnel.stages.map((stage, index) => (
                    <div key={stage.stage} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">{stage.stage}</h3>
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: STAGE_COLORS[index % STAGE_COLORS.length] }}
                            />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{stage.count}</div>
                        <div className="text-sm text-gray-500">
                            {stage.percentage.toFixed(1)}% del total
                        </div>
                        {stage.conversionRate !== undefined && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                ↑ {stage.conversionRate.toFixed(1)}% conversión
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Drop-off Analysis */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Abandono</h3>
                <div className="space-y-4">
                    {funnel.stages.slice(0, -1).map((stage, index) => {
                        const nextStage = funnel.stages[index + 1];
                        const dropOff = stage.count - nextStage.count;
                        const dropOffPercentage = stage.count > 0
                            ? ((dropOff / stage.count) * 100).toFixed(1)
                            : '0';

                        return (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {stage.stage} → {nextStage.stage}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {dropOff} empresas abandonaron ({dropOffPercentage}%)
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-red-600">-{dropOff}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Overall Conversion Rate */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-sm p-6 border-2 border-purple-200">
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">Tasa de Conversión General</div>
                    <div className="text-5xl font-bold text-purple-700 mb-2">
                        {funnel.created > 0
                            ? ((funnel.paid / funnel.created) * 100).toFixed(1)
                            : '0'
                        }%
                    </div>
                    <div className="text-sm text-gray-600">
                        {funnel.paid} de {funnel.created} empresas creadas están pagando
                    </div>
                </div>
            </div>
        </div>
    );
}
