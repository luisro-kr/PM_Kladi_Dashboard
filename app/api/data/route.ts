import { NextResponse } from 'next/server';

// Forzar que la API sea dinámica y no se cachee en Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// URL of your new Webhook v2
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxI0wh5XEF48nJgax1wmwBvWG8HDt2BFvVUwi9davfE7EYx-K2Tkdqy3EmxIlac5rZLlg/exec';
// NOTE: Make sure to update this URL if you deploy a new script version!

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'get_data';

    // 1. Fetch data from Google Apps Script
    console.log(`[API] Fetching from GAS: ${WEBHOOK_URL}?action=${action}`);
    const response = await fetch(`${WEBHOOK_URL}?action=${action}`, {
      cache: 'no-store',
    });

    const responseText = await response.text();
    console.log(`[API] GAS Response Status: ${response.status}`);

    if (!response.ok) {
      console.error(`[API] GAS Error Response: ${responseText.slice(0, 500)}...`);
      throw new Error(`Google Apps Script responded with ${response.status}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error(`[API] Failed to parse JSON. Raw response: ${responseText.slice(0, 500)}...`);
      throw new Error(`Invalid JSON from Google Script: ${responseText.slice(0, 100)}`);
    }

    // 2. Pass-through for flags and debug
    if (action === 'get_flags' || action === 'debug_sheet') {
      return NextResponse.json(result);
    }

    if (!result.success && !result.ok) {
      throw new Error(result.error || 'Unknown error from Google Script');
    }

    // 3. For 'get_data', transform it for the frontend
    const rawCompanies = result.data || [];

    const companies = rawCompanies.map((raw: any) => {
      // --- 0. NORMALIZATION & PARSING ---

      // 0.3 Parsing Numbers (Safety)
      const parseNum = (val: any) => {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : n;
      };

      const nuevos_tickets_7d = parseNum(raw.nuevos_tickets_7d);
      const nuevos_clientes_7d = parseNum(raw.nuevos_clientes_7d);
      const nuevos_articulos_7d = parseNum(raw.nuevos_articulos_7d);
      const total_tickets = parseNum(raw.total_tickets); // Fallback if needed
      const total_clientes = parseNum(raw.total_clientes);
      const total_articulos = parseNum(raw.total_articulos);

      // 0.1 Normalize Plan
      const rawPlan = (raw.plan_suscripcion || '').toString().toLowerCase();
      let plan_key = 'otro';

      if (rawPlan.includes('plata')) plan_key = 'plata';
      else if (rawPlan.includes('oro')) plan_key = 'oro';
      else if (rawPlan.includes('titanio')) plan_key = 'titanio';
      else if (rawPlan.includes('legacy')) plan_key = 'legacy';
      else if (rawPlan.includes('especial')) plan_key = 'especial';
      else if (rawPlan.includes('sin plan') || rawPlan.trim() === '') plan_key = 'sin_plan';

      // 0.2 Normalize Status
      const rawStatus = (raw.estatus_suscripcion || '').toString().toLowerCase();
      const is_active = rawStatus.includes('activa');
      // "Pagando" proxy: Active AND not "sin_plan" (until we have payment dates)
      const is_paying_proxy = is_active && plan_key !== 'sin_plan';

      // 0.4 Parse Dates
      const now = new Date();
      const fecha_creacion = raw.fecha_creacion_empresa ? new Date(raw.fecha_creacion_empresa) : null;

      // --- 1. BUSINESS LOGIC ---

      let dias_desde_creacion = 0;
      let fecha_fin_trial = null;
      let en_trial = false;
      let trial_expirado = false;
      let trial_vence_7d = false;

      if (fecha_creacion) {
        // Calculate days since creation
        const diffTime = Math.abs(now.getTime() - fecha_creacion.getTime());
        dias_desde_creacion = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Trial Logic (15 days fixed rule)
        fecha_fin_trial = new Date(fecha_creacion);
        fecha_fin_trial.setDate(fecha_fin_trial.getDate() + 15);

        // Logic: In trial if within 15 days AND not yet paying
        // We use !is_paying_proxy to ensure we don't mark paid accounts as "in trial"
        en_trial = (now <= fecha_fin_trial) && !is_paying_proxy;

        trial_expirado = (now > fecha_fin_trial) && !is_paying_proxy;

        // Trial expires within next 7 days: is in trial AND (0 <= time_left <= 7 days)
        const daysLeft = Math.ceil((fecha_fin_trial.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        trial_vence_7d = en_trial && (daysLeft >= 0 && daysLeft <= 7);
      }

      // Pricing Logic
      let precio_plan_mensual = 0;
      switch (plan_key) {
        case 'plata': precio_plan_mensual = 90; break;
        case 'oro': precio_plan_mensual = 220; break;
        case 'titanio': precio_plan_mensual = 440; break;
        // legacy/especial = 0 or custom logic
      }
      const mrr_estimado = is_paying_proxy ? precio_plan_mensual : 0;

      // Activity Logic (Funnel Section)
      // Activated: >= 5 articles AND >= 3 tickets in last 7d
      const activado_en_7d = (nuevos_articulos_7d >= 5) && (nuevos_tickets_7d >= 3);

      // Inactive Risk: 0 tickets in last 7d (But must be an ACTIVE account to care)
      const empresa_inactiva_7d = (nuevos_tickets_7d === 0) && is_active;

      return {
        ...raw, // Keep original fields 
        // Normalized overrides
        plan_suscripcion: plan_key, // Send the normalized key to frontend
        estatus_suscripcion: is_active ? 'Activa' : 'Inactiva',

        // Numeric fields ensured
        nuevos_tickets_7d,
        nuevos_clientes_7d,
        nuevos_articulos_7d,
        total_tickets,
        total_clientes,
        total_articulos,

        // Derived fields
        last_update: new Date().toISOString(),
        dias_desde_creacion,
        fecha_fin_trial: fecha_fin_trial ? fecha_fin_trial.toISOString() : null,
        en_trial,
        trial_expirado,
        trial_vence_7d,
        activado_en_7d,
        empresa_inactiva_7d,
        precio_plan_mensual,
        mrr_estimado,
        // Helper specifically for frontend "Pagando" badge
        is_paying: is_paying_proxy
      };
    });

    // 3. Return formatted response
    return NextResponse.json({
      success: true,
      data: companies,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Proxy POST requests to GAS (for updating flags)
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
