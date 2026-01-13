'use client';

import { TrialCompany } from '../../../types/dashboard';
import CompanyTable from '../shared/CompanyTable';

interface Section4TrialProps {
    trialCompanies: TrialCompany[];
}

export default function Section4Trial({ trialCompanies }: Section4TrialProps) {
    const highPriority = trialCompanies.filter(c => c.prioridad === 'alta');
    const mediumPriority = trialCompanies.filter(c => c.prioridad === 'media');
    const lowPriority = trialCompanies.filter(c => c.prioridad === 'baja');

    const activatedCompanies = trialCompanies.filter(c => c.activado_en_7d);

    const getPriorityBadge = (prioridad: 'alta' | 'media' | 'baja') => {
        const colors = {
            alta: 'bg-red-100 text-red-800',
            media: 'bg-yellow-100 text-yellow-800',
            baja: 'bg-green-100 text-green-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[prioridad]}`}>
                {prioridad.toUpperCase()}
            </span>
        );
    };

    const trialColumns = [
        {
            key: 'nombre_empresa' as const,
            label: 'Empresa',
        },
        {
            key: 'plan_suscripcion' as const,
            label: 'Plan',
            render: (company: TrialCompany) => (
                <span className="capitalize">{company.plan_suscripcion}</span>
            ),
        },
        {
            key: 'custom' as const,
            label: 'Días Restantes',
            render: (company: TrialCompany) => (
                <span className={`font-bold ${company.dias_restantes <= 3 ? 'text-red-600' :
                        company.dias_restantes <= 7 ? 'text-yellow-600' :
                            'text-green-600'
                    }`}>
                    {company.dias_restantes} días
                </span>
            ),
        },
        {
            key: 'custom' as const,
            label: 'Prioridad',
            render: (company: TrialCompany) => getPriorityBadge(company.prioridad),
        },
        {
            key: 'custom' as const,
            label: 'Activado',
            render: (company: TrialCompany) => (
                <span className={company.activado_en_7d ? 'text-green-600' : 'text-gray-400'}>
                    {company.activado_en_7d ? '✓ Sí' : '✗ No'}
                </span>
            ),
        },
        {
            key: 'total_tickets' as const,
            label: 'Tickets',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Trial & Conversión</h2>
                <p className="text-gray-600">Empresas en periodo de prueba y oportunidades de conversión</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600 mb-1">Total en Trial</div>
                    <div className="text-3xl font-bold text-gray-900">{trialCompanies.length}</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
                    <div className="text-sm text-gray-600 mb-1">Prioridad Alta</div>
                    <div className="text-3xl font-bold text-red-600">{highPriority.length}</div>
                    <div className="text-xs text-gray-500 mt-1">≤ 3 días restantes</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
                    <div className="text-sm text-gray-600 mb-1">Prioridad Media</div>
                    <div className="text-3xl font-bold text-yellow-600">{mediumPriority.length}</div>
                    <div className="text-xs text-gray-500 mt-1">4-7 días restantes</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                    <div className="text-sm text-gray-600 mb-1">Activadas</div>
                    <div className="text-3xl font-bold text-green-600">{activatedCompanies.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Listas para conversión</div>
                </div>
            </div>

            {/* High Priority - Expiring Soon */}
            {highPriority.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            🔴 Prioridad Alta - Acción Inmediata
                        </h3>
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                            {highPriority.length} empresas
                        </span>
                    </div>
                    <CompanyTable
                        companies={highPriority}
                        columns={trialColumns}
                        emptyMessage="No hay empresas de alta prioridad"
                    />
                </div>
            )}

            {/* Medium Priority */}
            {mediumPriority.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            🟡 Prioridad Media - Seguimiento
                        </h3>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            {mediumPriority.length} empresas
                        </span>
                    </div>
                    <CompanyTable
                        companies={mediumPriority}
                        columns={trialColumns}
                        emptyMessage="No hay empresas de prioridad media"
                    />
                </div>
            )}

            {/* Activated Companies - Ready for Conversion */}
            {activatedCompanies.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-sm p-6 border-2 border-green-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                ✅ Empresas Activadas - Listas para Conversión
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Estas empresas han cumplido los criterios de activación y son candidatos ideales para conversión
                            </p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {activatedCompanies.length} empresas
                        </span>
                    </div>
                    <CompanyTable
                        companies={activatedCompanies}
                        columns={trialColumns}
                        emptyMessage="No hay empresas activadas"
                    />
                </div>
            )}

            {/* All Trial Companies */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Todas las Empresas en Trial
                    </h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {trialCompanies.length} empresas
                    </span>
                </div>
                <CompanyTable
                    companies={trialCompanies}
                    columns={trialColumns}
                    emptyMessage="No hay empresas en trial"
                />
            </div>
        </div>
    );
}
