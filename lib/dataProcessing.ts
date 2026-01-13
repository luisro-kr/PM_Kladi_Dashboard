import {
    Company,
    FilterState,
    KPIs,
    FunnelData,
    FunnelStage,
    UsageMetrics,
    UsagePercentiles,
    TrialCompany,
    RiskCompany,
} from '../types/dashboard';
import { filterTestAccounts } from './testAccountFilter';

// ============================================
// Filtering Functions
// ============================================

export function filterCompanies(companies: Company[], filters: FilterState, manualOverrides?: Record<string, boolean>): Company[] {
    // FIRST: Remove test accounts before applying any other filters
    const realCompanies = filterTestAccounts(companies, manualOverrides);

    return realCompanies.filter((company) => {
        // Plan filter
        if (filters.plan !== 'all') {
            const planKey = company.plan_suscripcion?.toLowerCase().trim();
            if (planKey !== filters.plan) return false;
        }

        // Status filter
        if (filters.status !== 'all') {
            const isPaid = looksPaid(company.estatus_suscripcion);
            if (filters.status === 'pagando' && !isPaid) return false;
            if (filters.status === 'trial' && !company.en_trial) return false;
            if (filters.status === 'expirado' && !company.trial_expirado) return false;
        }

        // Date range filter
        if (filters.dateFrom && company.fecha_creacion_empresa) {
            const creationDate = new Date(company.fecha_creacion_empresa);
            const fromDate = new Date(filters.dateFrom);
            if (creationDate < fromDate) return false;
        }

        if (filters.dateTo && company.fecha_creacion_empresa) {
            const creationDate = new Date(company.fecha_creacion_empresa);
            const toDate = new Date(filters.dateTo);
            if (creationDate > toDate) return false;
        }

        // Search query filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const searchableText = [
                company.nombre_empresa,
                company.nombre_administrador,
                company.correo,
                company.empresa_id,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            if (!searchableText.includes(query)) return false;
        }

        return true;
    });
}

// ============================================
// KPI Aggregation
// ============================================

function looksPaid(estatus: string): boolean {
    if (!estatus) return false;
    const s = estatus.trim().toLowerCase();
    return ['activa', 'active', 'paid', 'pagado', 'pagando', 'suscrito'].includes(s);
}

function normalizePlan(plan: string): string {
    if (!plan) return '';
    return plan.trim().toLowerCase();
}

export function computeKPIs(companies: Company[]): KPIs {
    const total_empresas = companies.length;

    let pagando = 0;
    let en_trial = 0;
    let trial_expirado = 0;
    let inactivas_7d = 0;

    const por_plan = { plata: 0, oro: 0, titanio: 0, otro: 0 };
    const por_estatus: Record<string, number> = {};
    let mrr_total = 0;

    // Trial vence en 7 días
    const now = new Date();
    let trial_vence_7d = 0;

    for (const company of companies) {
        const planKey = normalizePlan(company.plan_suscripcion);
        if (planKey in por_plan) {
            por_plan[planKey as keyof typeof por_plan] += 1;
        } else {
            por_plan.otro += 1;
        }

        const est = company.estatus_suscripcion || 'sin_estatus';
        por_estatus[est] = (por_estatus[est] || 0) + 1;

        if (looksPaid(company.estatus_suscripcion)) pagando += 1;
        if (company.en_trial) en_trial += 1;
        if (company.trial_expirado) trial_expirado += 1;
        if (company.empresa_inactiva_7d) inactivas_7d += 1;

        mrr_total += company.mrr_estimado || 0;

        // Trial vence en <=7 días
        if (company.en_trial && company.fecha_fin_trial) {
            const fin = new Date(company.fecha_fin_trial);
            const daysToEnd = Math.floor((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysToEnd >= 0 && daysToEnd <= 7) trial_vence_7d += 1;
        }
    }

    return {
        total_empresas,
        pagando,
        en_trial,
        trial_expirado,
        trial_vence_7d,
        inactivas_7d,
        mrr_total,
        por_plan,
        por_estatus,
    };
}

// ============================================
// Funnel Calculations
// ============================================

export function computeFunnel(companies: Company[]): FunnelData {
    const created = companies.length;
    const activated = companies.filter((c) => c.activado_en_7d).length;

    // Trial end: companies that reached end of trial (either paid or expired)
    const trialEnd = companies.filter((c) => {
        if (!c.fecha_fin_trial) return false;
        const trialEndDate = new Date(c.fecha_fin_trial);
        const now = new Date();
        return trialEndDate <= now;
    }).length;

    const paid = companies.filter((c) => looksPaid(c.estatus_suscripcion)).length;

    // Calculate stages with conversion rates
    const stages: FunnelStage[] = [
        {
            stage: 'Creadas',
            count: created,
            percentage: 100,
        },
        {
            stage: 'Activadas',
            count: activated,
            percentage: created > 0 ? (activated / created) * 100 : 0,
            conversionRate: created > 0 ? (activated / created) * 100 : 0,
        },
        {
            stage: 'Fin Trial',
            count: trialEnd,
            percentage: created > 0 ? (trialEnd / created) * 100 : 0,
            conversionRate: activated > 0 ? (trialEnd / activated) * 100 : 0,
        },
        {
            stage: 'Pagando',
            count: paid,
            percentage: created > 0 ? (paid / created) * 100 : 0,
            conversionRate: trialEnd > 0 ? (paid / trialEnd) * 100 : 0,
        },
    ];

    return {
        created,
        activated,
        trialEnd,
        paid,
        stages,
    };
}

// ============================================
// Usage Percentile Calculations
// ============================================

function calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
}

function computePercentiles(values: number[], metric: string): UsagePercentiles {
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = values.length > 0 ? sum / values.length : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;

    return {
        metric,
        p25: calculatePercentile(sorted, 25),
        p50: calculatePercentile(sorted, 50),
        p75: calculatePercentile(sorted, 75),
        p90: calculatePercentile(sorted, 90),
        avg: Math.round(avg * 100) / 100,
        max,
    };
}

export function computeUsageMetrics(companies: Company[]): UsageMetrics {
    const tickets = companies.map((c) => c.total_tickets);
    const clientes = companies.map((c) => c.total_clientes);
    const articulos = companies.map((c) => c.total_articulos);

    return {
        tickets: computePercentiles(tickets, 'Tickets'),
        clientes: computePercentiles(clientes, 'Clientes'),
        articulos: computePercentiles(articulos, 'Artículos'),
    };
}

// ============================================
// Trial Company Processing
// ============================================

export function getTrialCompanies(companies: Company[]): TrialCompany[] {
    const now = new Date();

    return companies
        .filter((c) => c.en_trial && c.fecha_fin_trial)
        .map((c) => {
            const trialEnd = new Date(c.fecha_fin_trial!);
            const dias_restantes = Math.floor((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            let prioridad: 'alta' | 'media' | 'baja' = 'baja';
            if (dias_restantes <= 3) prioridad = 'alta';
            else if (dias_restantes <= 7) prioridad = 'media';

            return {
                ...c,
                dias_restantes,
                prioridad,
            };
        })
        .sort((a, b) => a.dias_restantes - b.dias_restantes);
}

// ============================================
// Risk Company Processing
// ============================================

export function getRiskCompanies(companies: Company[]): RiskCompany[] {
    return companies
        .map((c) => {
            const risk_factors: string[] = [];
            let risk_score = 0;

            // Inactive for 7 days
            if (c.empresa_inactiva_7d) {
                risk_factors.push('Sin actividad en 7 días');
                risk_score += 30;
            }

            // Trial expired
            if (c.trial_expirado) {
                risk_factors.push('Trial expirado');
                risk_score += 40;
            }

            // Low usage (not activated)
            if (!c.activado_en_7d && c.dias_desde_creacion && c.dias_desde_creacion > 7) {
                risk_factors.push('No activado');
                risk_score += 20;
            }

            // Paid but inactive
            if (looksPaid(c.estatus_suscripcion) && c.empresa_inactiva_7d) {
                risk_factors.push('Cliente pagando pero inactivo');
                risk_score += 50;
            }

            // Low total usage
            if (c.total_tickets < 5 && c.dias_desde_creacion && c.dias_desde_creacion > 14) {
                risk_factors.push('Uso muy bajo');
                risk_score += 15;
            }

            return {
                ...c,
                risk_score,
                risk_factors,
            };
        })
        .filter((c) => c.risk_score > 0)
        .sort((a, b) => b.risk_score - a.risk_score);
}
