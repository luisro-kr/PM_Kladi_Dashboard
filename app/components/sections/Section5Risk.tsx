'use client';

import { RiskCompany } from '../../../types/dashboard';
import CompanyTable from '../shared/CompanyTable';

interface Section5RiskProps {
    riskCompanies: RiskCompany[];
}

export default function Section5Risk({ riskCompanies }: Section5RiskProps) {
    const highRisk = riskCompanies.filter(c => c.risk_score >= 50);
    const mediumRisk = riskCompanies.filter(c => c.risk_score >= 30 && c.risk_score < 50);
    const lowRisk = riskCompanies.filter(c => c.risk_score < 30);

    const getRiskBadge = (score: number) => {
        if (score >= 50) {
            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">ALTO</span>;
        } else if (score >= 30) {
            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">MEDIO</span>;
        } else {
            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">BAJO</span>;
        }
    };

    const riskColumns = [
        {
            key: 'nombre_empresa' as const,
            label: 'Empresa',
        },
        {
            key: 'plan_suscripcion' as const,
            label: 'Plan',
            render: (company: RiskCompany) => (
                <span className="capitalize">{company.plan_suscripcion}</span>
            ),
        },
        {
            key: 'estatus_suscripcion' as const,
            label: 'Estatus',
        },
        {
            key: 'custom' as const,
            label: 'Riesgo',
            render: (company: RiskCompany) => (
                <div className="flex items-center space-x-2">
                    {getRiskBadge(company.risk_score)}
                    <span className="text-sm font-semibold">{company.risk_score}</span>
                </div>
            ),
        },
        {
            key: 'custom' as const,
            label: 'Factores de Riesgo',
            render: (company: RiskCompany) => (
                <div className="text-xs space-y-1">
                    {company.risk_factors.slice(0, 2).map((factor, idx) => (
                        <div key={idx} className="text-red-600">• {factor}</div>
                    ))}
                    {company.risk_factors.length > 2 && (
                        <div className="text-gray-500">+{company.risk_factors.length - 2} más</div>
                    )}
                </div>
            ),
            sortable: false,
        },
        {
            key: 'total_tickets' as const,
            label: 'Tickets',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Riesgo & Churn</h2>
                <p className="text-gray-600">Identificación temprana de empresas en riesgo de abandono</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-500">
                    <div className="text-sm text-gray-600 mb-1">Total en Riesgo</div>
                    <div className="text-3xl font-bold text-gray-900">{riskCompanies.length}</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
                    <div className="text-sm text-gray-600 mb-1">Riesgo Alto</div>
                    <div className="text-3xl font-bold text-red-600">{highRisk.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Score ≥ 50</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
                    <div className="text-sm text-gray-600 mb-1">Riesgo Medio</div>
                    <div className="text-3xl font-bold text-yellow-600">{mediumRisk.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Score 30-49</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600 mb-1">Riesgo Bajo</div>
                    <div className="text-3xl font-bold text-blue-600">{lowRisk.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Score &lt; 30</div>
                </div>
            </div>

            {/* High Risk Alert */}
            {highRisk.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3 mb-4">
                        <svg className="w-6 h-6 text-red-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="text-lg font-semibold text-red-900">
                                ⚠️ Alerta de Riesgo Alto - Acción Inmediata Requerida
                            </h3>
                            <p className="text-sm text-red-700 mt-1">
                                {highRisk.length} empresas requieren atención urgente para prevenir churn
                            </p>
                        </div>
                    </div>
                    <CompanyTable
                        companies={highRisk}
                        columns={riskColumns}
                        emptyMessage="No hay empresas de alto riesgo"
                    />
                </div>
            )}

            {/* Medium Risk */}
            {mediumRisk.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            🟡 Riesgo Medio - Monitoreo Activo
                        </h3>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            {mediumRisk.length} empresas
                        </span>
                    </div>
                    <CompanyTable
                        companies={mediumRisk}
                        columns={riskColumns}
                        emptyMessage="No hay empresas de riesgo medio"
                    />
                </div>
            )}

            {/* Low Risk */}
            {lowRisk.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            🔵 Riesgo Bajo - Seguimiento Regular
                        </h3>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {lowRisk.length} empresas
                        </span>
                    </div>
                    <CompanyTable
                        companies={lowRisk}
                        columns={riskColumns}
                        emptyMessage="No hay empresas de riesgo bajo"
                    />
                </div>
            )}

            {/* Risk Factors Legend */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Factores de Riesgo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                        <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            50
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">Cliente pagando pero inactivo</div>
                            <div className="text-sm text-gray-600">Riesgo crítico de cancelación</div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            40
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">Trial expirado</div>
                            <div className="text-sm text-gray-600">No convirtió a pago</div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="bg-yellow-100 text-yellow-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            30
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">Sin actividad en 7 días</div>
                            <div className="text-sm text-gray-600">Falta de engagement</div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            20
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">No activado</div>
                            <div className="text-sm text-gray-600">Más de 7 días sin activación</div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            15
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">Uso muy bajo</div>
                            <div className="text-sm text-gray-600">Menos de 5 tickets en 14+ días</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
