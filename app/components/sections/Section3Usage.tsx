'use client';

import { UsageMetrics } from '../../../types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Section3UsageProps {
    usage: UsageMetrics;
}

export default function Section3Usage({ usage }: Section3UsageProps) {
    const percentileData = [
        {
            percentile: 'P25',
            tickets: usage.tickets.p25,
            clientes: usage.clientes.p25,
            articulos: usage.articulos.p25,
        },
        {
            percentile: 'P50',
            tickets: usage.tickets.p50,
            clientes: usage.clientes.p50,
            articulos: usage.articulos.p50,
        },
        {
            percentile: 'P75',
            tickets: usage.tickets.p75,
            clientes: usage.clientes.p75,
            articulos: usage.articulos.p75,
        },
        {
            percentile: 'P90',
            tickets: usage.tickets.p90,
            clientes: usage.clientes.p90,
            articulos: usage.articulos.p90,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Uso del Producto</h2>
                <p className="text-gray-600">Análisis de actividad y distribución de uso</p>
            </div>

            {/* Average Usage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-6 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-blue-900">Tickets Promedio</h3>
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div className="text-4xl font-bold text-blue-900">{usage.tickets.avg.toFixed(1)}</div>
                    <div className="text-sm text-blue-700 mt-2">Máximo: {usage.tickets.max}</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm p-6 border-2 border-green-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-green-900">Clientes Promedio</h3>
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div className="text-4xl font-bold text-green-900">{usage.clientes.avg.toFixed(1)}</div>
                    <div className="text-sm text-green-700 mt-2">Máximo: {usage.clientes.max}</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm p-6 border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-purple-900">Artículos Promedio</h3>
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <div className="text-4xl font-bold text-purple-900">{usage.articulos.avg.toFixed(1)}</div>
                    <div className="text-sm text-purple-700 mt-2">Máximo: {usage.articulos.max}</div>
                </div>
            </div>

            {/* Percentile Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Percentiles</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={percentileData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="percentile" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="tickets" fill="#3b82f6" name="Tickets" />
                            <Bar dataKey="clientes" fill="#10b981" name="Clientes" />
                            <Bar dataKey="articulos" fill="#8b5cf6" name="Artículos" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Percentile Tables */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tickets */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Tickets</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">P25</span>
                            <span className="font-semibold">{usage.tickets.p25}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">P50 (Mediana)</span>
                            <span className="font-semibold">{usage.tickets.p50}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">P75</span>
                            <span className="font-semibold">{usage.tickets.p75}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">P90</span>
                            <span className="font-semibold">{usage.tickets.p90}</span>
                        </div>
                        <div className="flex justify-between py-2 bg-blue-50 px-2 rounded">
                            <span className="text-gray-900 font-medium">Promedio</span>
                            <span className="font-bold text-blue-700">{usage.tickets.avg.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Clientes */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Clientes</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">P25</span>
                            <span className="font-semibold">{usage.clientes.p25}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">P50 (Mediana)</span>
                            <span className="font-semibold">{usage.clientes.p50}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">P75</span>
                            <span className="font-semibold">{usage.clientes.p75}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">P90</span>
                            <span className="font-semibold">{usage.clientes.p90}</span>
                        </div>
                        <div className="flex justify-between py-2 bg-green-50 px-2 rounded">
                            <span className="text-gray-900 font-medium">Promedio</span>
                            <span className="font-bold text-green-700">{usage.clientes.avg.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Artículos */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Artículos</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">P25</span>
                            <span className="font-semibold">{usage.articulos.p25}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">P50 (Mediana)</span>
                            <span className="font-semibold">{usage.articulos.p50}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">P75</span>
                            <span className="font-semibold">{usage.articulos.p75}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">P90</span>
                            <span className="font-semibold">{usage.articulos.p90}</span>
                        </div>
                        <div className="flex justify-between py-2 bg-purple-50 px-2 rounded">
                            <span className="text-gray-900 font-medium">Promedio</span>
                            <span className="font-bold text-purple-700">{usage.articulos.avg.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
