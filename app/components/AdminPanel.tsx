'use client';

import { useState, useEffect } from 'react';
import { Company } from '../../types/dashboard';
import { isTestAccount } from '../../lib/testAccountFilter';
import CompanyTable from './shared/CompanyTable';

interface AdminPanelProps {
    allCompanies: Company[];
}

const WEBHOOK_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbySPrxTlDEQ0DgE23xSYNbn_Ac-9HfiUEV9p3o3rT6m2CT_BAb0AIqaG4V-eCnCbHLCTA/exec';

export default function AdminPanel({ allCompanies }: AdminPanelProps) {
    const [manualOverrides, setManualOverrides] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load manual overrides from Google Apps Script
    useEffect(() => {
        const loadFlags = async () => {
            try {
                const response = await fetch(`${WEBHOOK_URL}?action=get_flags`);
                const data = await response.json();

                if (data.ok && data.flags) {
                    setManualOverrides(data.flags);
                    console.log(`✅ Loaded ${data.count} manual test account flags from Google Sheets`);
                }
            } catch (error) {
                console.error('Failed to load test account flags:', error);
                // Fallback to localStorage
                const stored = localStorage.getItem('test_account_overrides');
                if (stored) {
                    try {
                        setManualOverrides(JSON.parse(stored));
                    } catch (e) {
                        console.error('Failed to load from localStorage:', e);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        loadFlags();
    }, []);

    // Save manual override to Google Apps Script
    const saveOverride = async (empresaId: string, isTest: boolean) => {
        setSaving(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'update_flag',
                    empresaId,
                    isTest,
                }),
            });

            const data = await response.json();

            if (data.ok) {
                console.log(`✅ Saved test flag for ${empresaId}: ${isTest}`);
                // Also save to localStorage as backup
                const newOverrides = { ...manualOverrides, [empresaId]: isTest };
                localStorage.setItem('test_account_overrides', JSON.stringify(newOverrides));
            } else {
                console.error('Failed to save test flag:', data.error);
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error saving to Google Sheets:', error);
            // Fallback to localStorage only
            const newOverrides = { ...manualOverrides, [empresaId]: isTest };
            localStorage.setItem('test_account_overrides', JSON.stringify(newOverrides));
        } finally {
            setSaving(false);
        }
    };

    const toggleTestStatus = async (empresaId: string) => {
        const currentStatus = isMarkedAsTest(allCompanies.find(c => c.empresa_id === empresaId)!);
        const newStatus = !currentStatus;

        // Update local state immediately for responsive UI
        const newOverrides = { ...manualOverrides, [empresaId]: newStatus };
        setManualOverrides(newOverrides);

        // Save to backend
        await saveOverride(empresaId, newStatus);
    };

    // Determine if company is marked as test (auto-detected or manual override)
    const isMarkedAsTest = (company: Company): boolean => {
        const empresaId = company.empresa_id;

        // Check manual override first
        if (empresaId in manualOverrides) {
            return manualOverrides[empresaId];
        }

        // Fall back to automatic detection
        return isTestAccount(company);
    };

    // Filter companies by search
    const filteredCompanies = allCompanies.filter(company => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        return (
            company.nombre_empresa?.toLowerCase().includes(query) ||
            company.correo?.toLowerCase().includes(query) ||
            company.empresa_id?.toLowerCase().includes(query) ||
            company.nombre_administrador?.toLowerCase().includes(query)
        );
    });

    // Separate into test and real accounts
    const testAccounts = filteredCompanies.filter(c => isMarkedAsTest(c));
    const realAccounts = filteredCompanies.filter(c => !isMarkedAsTest(c));

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    const columns = [
        {
            key: 'nombre_empresa' as const,
            label: 'Empresa',
        },
        {
            key: 'correo' as const,
            label: 'Correo',
        },
        {
            key: 'empresa_id' as const,
            label: 'ID',
        },
        {
            key: 'nombre_administrador' as const,
            label: 'Administrador',
        },
        {
            key: 'custom' as const,
            label: 'Estado',
            render: (company: Company) => {
                const isTest = isMarkedAsTest(company);
                const isManual = company.empresa_id in manualOverrides;
                const autoDetected = isTestAccount(company);

                return (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => toggleTestStatus(company.empresa_id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${isTest
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                        >
                            {isTest ? '🚫 TEST' : '✅ REAL'}
                        </button>
                        {isManual && (
                            <span className="text-xs text-blue-600 font-medium">
                                (Manual)
                            </span>
                        )}
                        {!isManual && autoDetected && (
                            <span className="text-xs text-orange-600 font-medium">
                                (Auto)
                            </span>
                        )}
                    </div>
                );
            },
            sortable: false,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                            🔧 Panel de Administración - Cuentas de Prueba
                        </h1>
                        {saving && (
                            <div className="flex items-center space-x-2 text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm">Guardando...</span>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 mb-4">
                        Gestiona qué cuentas se consideran de prueba y se excluyen del dashboard principal.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                            <div className="text-sm text-blue-600 font-medium">Total Empresas</div>
                            <div className="text-3xl font-bold text-blue-900">{allCompanies.length}</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                            <div className="text-sm text-green-600 font-medium">Cuentas Reales</div>
                            <div className="text-3xl font-bold text-green-900">{realAccounts.length}</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                            <div className="text-sm text-red-600 font-medium">Cuentas de Prueba</div>
                            <div className="text-3xl font-bold text-red-900">{testAccounts.length}</div>
                        </div>
                    </div>

                    {/* Search */}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre, correo, ID o administrador..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Cómo funciona</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <strong>Auto</strong>: Detectadas automáticamente por reglas (dominios @microsip.com, @kladi.mx, @mailinator.com, IDs ≥100000000, keywords)</li>
                        <li>• <strong>Manual</strong>: Marcadas manualmente por ti (override de detección automática)</li>
                        <li>• Haz clic en el botón de estado para cambiar entre TEST y REAL</li>
                        <li>• Los cambios se guardan automáticamente en tu navegador</li>
                    </ul>
                </div>

                {/* Test Accounts Table */}
                {testAccounts.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            🚫 Cuentas de Prueba ({testAccounts.length})
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Estas cuentas están excluidas del dashboard principal
                        </p>
                        <CompanyTable
                            companies={testAccounts}
                            columns={columns}
                            emptyMessage="No hay cuentas de prueba"
                        />
                    </div>
                )}

                {/* Real Accounts Table */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        ✅ Cuentas Reales ({realAccounts.length})
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Estas cuentas aparecen en el dashboard principal
                    </p>
                    <CompanyTable
                        companies={realAccounts}
                        columns={columns}
                        emptyMessage="No hay cuentas reales"
                    />
                </div>
            </div>
        </div>
    );
}
