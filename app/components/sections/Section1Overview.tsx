'use client';

import { KPIs } from '../../../types/dashboard';
import KPICard from '../shared/KPICard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Section1OverviewProps {
    kpis: KPIs;
}

const PLAN_COLORS = {
    plata: '#94a3b8',
    oro: '#fbbf24',
    titanio: '#8b5cf6',
    otro: '#6b7280',
};

export default function Section1Overview({ kpis }: Section1OverviewProps) {
    const planData = [
        { name: 'Plata', value: kpis.por_plan.plata, color: PLAN_COLORS.plata },
        { name: 'Oro', value: kpis.por_plan.oro, color: PLAN_COLORS.oro },
        { name: 'Titanio', value: kpis.por_plan.titanio, color: PLAN_COLORS.titanio },
        { name: 'Otro', value: kpis.por_plan.otro, color: PLAN_COLORS.otro },
    ].filter(item => item.value > 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Overview - Salud del Negocio</h2>
                <p className="text-gray-600">Vista general de métricas clave y distribución de planes</p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    label="Total Empresas"
                    value={kpis.total_empresas}
                    color="blue"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                />

                <KPICard
                    label="Pagando (Proxy)*"
                    value={kpis.pagando}
                    color="green"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />

                <KPICard
                    label="En Trial"
                    value={kpis.en_trial}
                    color="yellow"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />

                <KPICard
                    label="MRR Estimado*"
                    value={formatCurrency(kpis.mrr_total)}
                    color="purple"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                    label="Trial Expirado"
                    value={kpis.trial_expirado}
                    color="red"
                />

                <KPICard
                    label="Trial Vence en 7d"
                    value={kpis.trial_vence_7d}
                    color="yellow"
                />

                <KPICard
                    label="Inactivas (7d)"
                    value={kpis.inactivas_7d}
                    color="red"
                />
            </div>

            {/* Plan Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Plan</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart */}
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={planData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(props: any) => {
                                        const { name, percent } = props;
                                        return `${name} ${(percent * 100).toFixed(0)}%`;
                                    }}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {planData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                        {planData.map((plan) => {
                            const percentage = kpis.total_empresas > 0
                                ? ((plan.value / kpis.total_empresas) * 100).toFixed(1)
                                : '0';

                            return (
                                <div key={plan.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: plan.color }}
                                        />
                                        <span className="font-medium text-gray-900">{plan.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">{plan.value}</div>
                                        <div className="text-sm text-gray-500">{percentage}%</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estatus</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(kpis.por_estatus).map(([status, count]) => (
                        <div key={status} className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{count}</div>
                            <div className="text-sm text-gray-600 capitalize">{status}</div>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-xs text-gray-400 italic">
                * Métricas marcadas como "Proxy" son estimaciones basadas en estatus activo y plan, pendientes de integración con fechas de pago reales.
            </p>
        </div>
    );
}
