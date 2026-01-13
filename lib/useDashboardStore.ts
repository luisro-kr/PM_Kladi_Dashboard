import { create } from 'zustand';
import {
    Company,
    DashboardData,
    FilterState,
    KPIs,
    FunnelData,
    UsageMetrics,
    TrialCompany,
    RiskCompany,
    ProcessedDashboardData,
} from '../types/dashboard';
import { fetchDashboardData, getFullDashboardState } from './api';
import {
    filterCompanies,
    computeKPIs,
    computeFunnel,
    computeUsageMetrics,
    getTrialCompanies,
    getRiskCompanies,
} from './dataProcessing';
import { loadManualOverrides } from './testAccountFilter';

interface DashboardStore {
    // Raw data
    rawData: DashboardData | null;

    // Processed data
    processedData: ProcessedDashboardData | null;

    // Filter state
    filters: FilterState;

    // Manual test account overrides
    manualOverrides: Record<string, boolean>;

    // UI state
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;

    // Actions
    fetchData: () => Promise<void>;
    setFilter: (key: keyof FilterState, value: any) => void;
    resetFilters: () => void;
    refreshData: () => Promise<void>;
}

const defaultFilters: FilterState = {
    plan: 'all',
    status: 'all',
    dateFrom: null,
    dateTo: null,
    searchQuery: '',
};

function processData(companies: Company[], filters: FilterState, manualOverrides: Record<string, boolean>): ProcessedDashboardData {
    const filteredCompanies = filterCompanies(companies, filters, manualOverrides);

    return {
        companies,
        filteredCompanies,
        kpis: computeKPIs(filteredCompanies),
        funnel: computeFunnel(filteredCompanies),
        usage: computeUsageMetrics(filteredCompanies),
        trialCompanies: getTrialCompanies(filteredCompanies),
        riskCompanies: getRiskCompanies(filteredCompanies),
    };
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
    rawData: null,
    processedData: null,
    filters: defaultFilters,
    manualOverrides: {},
    loading: false,
    error: null,
    lastUpdated: null,

    fetchData: async () => {
        set({ loading: true, error: null });

        try {
            // Load manual overrides first
            const manualOverrides = await loadManualOverrides();

            // Then load company data
            const data = await getFullDashboardState();

            if (!data.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const { filters } = get();
            const processedData = processData(data.rows || [], filters, manualOverrides);

            set({
                rawData: data,
                processedData,
                manualOverrides,
                loading: false,
                lastUpdated: new Date().toISOString(),
            });
        } catch (error) {
            set({
                loading: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        }
    },

    setFilter: (key, value) => {
        const newFilters = { ...get().filters, [key]: value };
        set({ filters: newFilters });

        // Reprocess data with new filters
        const { rawData, manualOverrides } = get();
        if (rawData && rawData.rows) {
            const processedData = processData(rawData.rows, newFilters, manualOverrides);
            set({ processedData });
        }
    },

    resetFilters: () => {
        set({ filters: defaultFilters });

        // Reprocess data with default filters
        const { rawData, manualOverrides } = get();
        if (rawData && rawData.rows) {
            const processedData = processData(rawData.rows, defaultFilters, manualOverrides);
            set({ processedData });
        }
    },

    refreshData: async () => {
        await get().fetchData();
    },
}));
