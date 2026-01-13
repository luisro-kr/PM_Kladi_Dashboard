'use client';

import { useState } from 'react';
import { Company } from '../../../types/dashboard';

interface CompanyTableProps<T extends Company> {
    companies: T[];
    columns: {
        key: keyof T | 'custom';
        label: string;
        render?: (company: T) => React.ReactNode;
        sortable?: boolean;
    }[];
    emptyMessage?: string;
}

export default function CompanyTable<T extends Company>({ companies, columns, emptyMessage = 'No hay empresas para mostrar' }: CompanyTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const toggleRow = (empresaId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(empresaId)) {
            newExpanded.delete(empresaId);
        } else {
            newExpanded.add(empresaId);
        }
        setExpandedRows(newExpanded);
    };

    const sortedCompanies = [...companies].sort((a, b) => {
        if (!sortKey) return 0;

        const aVal = a[sortKey as keyof T];
        const bVal = b[sortKey as keyof T];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal);
        const bStr = String(bVal);
        return sortDirection === 'asc'
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
    });

    if (companies.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="w-8"></th>
                        {columns.map((col: typeof columns[number]) => (
                            <th
                                key={String(col.key)}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {col.sortable !== false && col.key !== 'custom' ? (
                                    <button
                                        onClick={() => handleSort(String(col.key))}
                                        className="flex items-center space-x-1 hover:text-gray-700"
                                    >
                                        <span>{col.label}</span>
                                        {sortKey === col.key && (
                                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </button>
                                ) : (
                                    col.label
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedCompanies.map((company) => (
                        <>
                            <tr key={company.empresa_id} className="hover:bg-gray-50">
                                <td className="px-2 py-4">
                                    <button
                                        onClick={() => toggleRow(company.empresa_id)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        {expandedRows.has(company.empresa_id) ? '▼' : '▶'}
                                    </button>
                                </td>
                                {columns.map((col: typeof columns[number]) => (
                                    <td
                                        key={String(col.key)}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {col.render
                                            ? col.render(company)
                                            : col.key !== 'custom'
                                                ? String(company[col.key] ?? '-')
                                                : '-'
                                        }
                                    </td>
                                ))}
                            </tr>
                            {expandedRows.has(company.empresa_id) && (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-6 py-4 bg-gray-50">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Email:</span> {company.correo}
                                            </div>
                                            <div>
                                                <span className="font-medium">Teléfono:</span> {company.telefono}
                                            </div>
                                            <div>
                                                <span className="font-medium">Administrador:</span> {company.nombre_administrador}
                                            </div>
                                            <div>
                                                <span className="font-medium">Última actualización:</span> {company.last_update}
                                            </div>
                                            <div>
                                                <span className="font-medium">Tickets (7d):</span> {company.nuevos_tickets_7d}
                                            </div>
                                            <div>
                                                <span className="font-medium">Total Tickets:</span> {company.total_tickets}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
