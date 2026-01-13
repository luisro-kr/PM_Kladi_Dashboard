'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '../../lib/useDashboardStore';
import FilterSidebar from './shared/FilterSidebar';
import Section1Overview from './sections/Section1Overview';
import Section2Funnel from './sections/Section2Funnel';
import Section3Usage from './sections/Section3Usage';
import Section4Trial from './sections/Section4Trial';
import Section5Risk from './sections/Section5Risk';
import AdminPanel from './AdminPanel';

type Section = 'overview' | 'funnel' | 'usage' | 'trial' | 'risk' | 'admin';

export default function DashboardPMPOS2026() {
    const [activeSection, setActiveSection] = useState<Section>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const {
        rawData,
        processedData,
        filters,
        loading,
        error,
        lastUpdated,
        fetchData,
        setFilter,
        resetFilters,
        refreshData,
    } = useDashboardStore();

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const sections = [
        { id: 'overview' as Section, name: 'Overview', icon: '📊' },
        { id: 'funnel' as Section, name: 'Funnel', icon: '🔄' },
        { id: 'usage' as Section, name: 'Uso', icon: '📈' },
        { id: 'trial' as Section, name: 'Trial', icon: '⏰' },
        { id: 'risk' as Section, name: 'Riesgo', icon: '⚠️' },
    ];

    // Show admin panel if selected
    if (activeSection === 'admin') {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                                <p className="text-sm text-gray-600">Gestión de cuentas de prueba</p>
                            </div>
                            <button
                                onClick={() => setActiveSection('overview')}
                                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <span>← Volver al Dashboard</span>
                            </button>
                        </div>
                    </div>
                </header>
                <AdminPanel allCompanies={rawData?.rows || []} />
            </div>
        );
    }

    if (loading && !processedData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md">
                    <div className="flex items-center space-x-3 mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-red-900">Error al cargar datos</h2>
                    </div>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={refreshData}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!processedData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden text-gray-600 hover:text-gray-900"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Dashboard PM POS 2026</h1>
                                <p className="text-sm text-gray-600">
                                    {lastUpdated && `Última actualización: ${new Date(lastUpdated).toLocaleString('es-MX')}`}
                                    {processedData && ` • ${processedData.filteredCompanies.length} empresas reales`}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={refreshData}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Actualizar</span>
                        </button>
                    </div>

                    {/* Section Navigation */}
                    <nav className="mt-4 flex space-x-2 overflow-x-auto">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeSection === section.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <span className="mr-2">{section.icon}</span>
                                {section.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } lg:translate-x-0 fixed lg:sticky top-[140px] left-0 h-[calc(100vh-140px)] w-80 bg-gray-50 border-r border-gray-200 p-6 transition-transform duration-300 ease-in-out z-20 overflow-y-auto`}
                >
                    <FilterSidebar
                        filters={filters}
                        onFilterChange={setFilter}
                        onResetFilters={resetFilters}
                    />
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-6">
                    {activeSection === 'overview' && <Section1Overview kpis={processedData.kpis} />}
                    {activeSection === 'funnel' && <Section2Funnel funnel={processedData.funnel} />}
                    {activeSection === 'usage' && <Section3Usage usage={processedData.usage} />}
                    {activeSection === 'trial' && <Section4Trial trialCompanies={processedData.trialCompanies} />}
                    {activeSection === 'risk' && <Section5Risk riskCompanies={processedData.riskCompanies} />}
                </main>
            </div>

            {/* Footer with Admin Link */}
            <footer className="bg-white border-t border-gray-200 py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-600">
                    <div>
                        Dashboard PM POS 2026 © {new Date().getFullYear()}
                    </div>
                    <button
                        onClick={() => setActiveSection('admin')}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-xs"
                    >
                        🔧 Admin
                    </button>
                </div>
            </footer>
        </div>
    );
}
