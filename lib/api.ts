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

    // Transform the Google Sheets data to match our DashboardData interface
    const rows = result.data || [];

    if (rows.length === 0) {
        return {
            ok: true,
            generated_at: new Date().toISOString(),
            kpis: {
                total_empresas: 0,
                pagando: 0,
                en_trial: 0,
                trial_expirado: 0,
                trial_vence_7d: 0,
                inactivas_7d: 0,
                mrr_total: 0,
                por_plan: { plata: 0, oro: 0, titanio: 0, otro: 0 },
                por_estatus: {},
            },
            rows: [],
        };
    }

    // Parse the data from Google Sheets format
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Map the data to Company objects
    const companies = dataRows.map((row: any[]) => {
        const fecha_creacion = row[0] ? new Date(row[0]) : null;
        const now = new Date();

        // Calculate derived fields
        let dias_desde_creacion = null;
        let fecha_fin_trial = null;
        let en_trial = false;
        let trial_expirado = false;

        if (fecha_creacion) {
            dias_desde_creacion = Math.floor((now.getTime() - fecha_creacion.getTime()) / (1000 * 60 * 60 * 24));
            fecha_fin_trial = new Date(fecha_creacion);
            fecha_fin_trial.setDate(fecha_fin_trial.getDate() + 15);

            // Assume trial if no explicit status indicates payment
            const estatus = (row[3] || '').toString().toLowerCase();
            const isPaid = ['activa', 'active', 'paid', 'pagado', 'pagando', 'suscrito'].includes(estatus);

            en_trial = (now <= fecha_fin_trial) && !isPaid;
            trial_expirado = (now > fecha_fin_trial) && !isPaid;
        }

        // Activity metrics
        const nuevos_tickets_7d = Number(row[4] || 0);
        const nuevos_articulos_7d = Number(row[10] || 0);
        const total_tickets = Number(row[4] || 0);
        const total_clientes = Number(row[11] || 0);
        const total_articulos = Number(row[10] || 0);

        // Activation criteria
        const activado_en_7d = (nuevos_articulos_7d >= 5) && (nuevos_tickets_7d >= 3);
        const empresa_inactiva_7d = (nuevos_tickets_7d === 0);

        // Pricing (you may need to adjust this based on actual plan data)
        const plan_suscripcion = (row[2] || '').toString().toLowerCase();
        const precio_plan_mensual =
            plan_suscripcion.includes('plata') ? 90 :
                plan_suscripcion.includes('oro') ? 220 :
                    plan_suscripcion.includes('titanio') ? 440 : 0;

        const estatus_suscripcion = row[3] || '';
        const isPaid = ['activa', 'active', 'paid', 'pagado', 'pagando', 'suscrito']
            .includes(estatus_suscripcion.toString().toLowerCase());
        const mrr_estimado = isPaid ? precio_plan_mensual : 0;

        return {
            fecha_creacion_empresa: fecha_creacion ? fecha_creacion.toISOString() : null,
            empresa_id: row[2] || '',
            plan_suscripcion: row[2] || '',
            estatus_suscripcion: row[3] || '',
            nombre_empresa: row[1] || '',
            nombre_administrador: row[1] || '', // Adjust if you have this data
            telefono: '',
            correo: row[3] || '',
            nuevos_tickets_7d,
            nuevos_clientes_7d: Number(row[11] || 0),
            nuevos_articulos_7d,
            total_tickets,
            total_clientes,
            total_articulos,
            last_update: new Date().toISOString(),

            // Derived fields
            dias_desde_creacion,
            fecha_fin_trial: fecha_fin_trial ? fecha_fin_trial.toISOString() : null,
            en_trial,
            trial_expirado,
            activado_en_7d,
            empresa_inactiva_7d,
            precio_plan_mensual,
            mrr_estimado,
        };
    });

    return {
        ok: true,
        generated_at: new Date().toISOString(),
        kpis: {
            total_empresas: 0,
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
