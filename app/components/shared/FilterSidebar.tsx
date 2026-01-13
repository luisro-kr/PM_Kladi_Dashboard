'use client';

import { FilterState, PlanType, StatusType } from '../../types/dashboard';

interface FilterSidebarProps {
    filters: FilterState;
    onFilterChange: (key: keyof FilterState, value: any) => void;
    onResetFilters: () => void;
}

export default function FilterSidebar({ filters, onFilterChange, onResetFilters }: FilterSidebarProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <button
                    onClick={onResetFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    Limpiar
                </button>
            </div>

            {/* Plan Filter */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan
                </label>
                <select
                    value={filters.plan}
                    onChange={(e) => onFilterChange('plan', e.target.value as PlanType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Todos</option>
                    <option value="plata">Plata</option>
                    <option value="oro">Oro</option>
                    <option value="titanio">Titanio</option>
                </select>
            </div>

            {/* Status Filter */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estatus
                </label>
                <select
                    value={filters.status}
                    onChange={(e) => onFilterChange('status', e.target.value as StatusType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Todos</option>
                    <option value="pagando">Pagando</option>
                    <option value="trial">En Trial</option>
                    <option value="expirado">Trial Expirado</option>
                </select>
            </div>

            {/* Date From */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desde
                </label>
                <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => onFilterChange('dateFrom', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Date To */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hasta
                </label>
                <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => onFilterChange('dateTo', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Search */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                </label>
                <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => onFilterChange('searchQuery', e.target.value)}
                    placeholder="Nombre, email, ID..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
    );
}
