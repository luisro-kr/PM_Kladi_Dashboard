import { WEBAPP_URL } from "./constants";
import { DashboardData } from "../types/dashboard";

// Use Next.js API route to avoid CORS issues
const API_BASE = '/api/data';

export async function fetchDashboardData(action: "kpis" | "raw" = "raw"): Promise<DashboardData> {
    // For now, we'll use the Next.js API route which fetches from Google Sheets
    // This avoids CORS issues during development
    const response = await fetch(API_BASE);

    if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error('API returned unsuccessful response');
    }

    // The API now returns fully normalized Company objects
    const companies = result.data || [];

    return {
        ok: true,
        generated_at: result.generated_at || new Date().toISOString(),
        kpis: {
            total_empresas: 0, // Computed by store
            pagando: 0,
            en_trial: 0,
            trial_expirado: 0,
            trial_vence_7d: 0,
            inactivas_7d: 0,
            mrr_total: 0,
            por_plan: { plata: 0, oro: 0, titanio: 0, otro: 0 },
            por_estatus: {},
        },
        rows: companies,
    };
}

/**
 * Combines both KPIs and Raw data for the full dashboard view
 */
export async function getFullDashboardState(): Promise<DashboardData> {
    return await fetchDashboardData("raw");
}
