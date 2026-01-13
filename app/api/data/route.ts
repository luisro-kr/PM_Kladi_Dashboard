import { NextResponse } from 'next/server';

// Forzar que la API sea dinámica y no se cachee en Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// URL of your new Webhook v2
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbySPrxTlDEQ0DgE23xSYNbn_Ac-9HfiUEV9p3o3rT6m2CT_BAb0AIqaG4V-eCnCbHLCTA/exec';
// NOTE: Make sure to update this URL if you deploy a new script version!

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'get_data';

    // 1. Fetch data from Google Apps Script
    const response = await fetch(`${WEBHOOK_URL}?action=${action}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script responded with ${response.status}`);
    }

    const result = await response.json();

    if (!result.success && !result.ok) { // Check both for compatibility
      throw new Error(result.error || 'Unknown error from Google Script');
    }

    // 2. If asking for raw data, transform it for the frontend
    const rawCompanies = result.data || [];

    const companies = rawCompanies.map((raw: any) => {
      // Data is already cleaned by GAS, just perform frontend calculations
      const now = new Date();
      const fecha_creacion = raw.fecha_creacion_empresa ? new Date(raw.fecha_creacion_empresa) : null;

      // Calculate derived fields
      let dias_desde_creacion = null;
      let fecha_fin_trial = null;
      let en_trial = false;
      let trial_expirado = false;

      if (fecha_creacion) {
        dias_desde_creacion = Math.floor((now.getTime() - fecha_creacion.getTime()) / (1000 * 60 * 60 * 24));
        fecha_fin_trial = new Date(fecha_creacion);
        fecha_fin_trial.setDate(fecha_fin_trial.getDate() + 15);

        const estatus = (raw.estatus_suscripcion || '').toString().toLowerCase();
        const isPaid = ['activa', 'active', 'paid', 'pagado', 'pagando', 'suscrito'].includes(estatus);

        en_trial = (now <= fecha_fin_trial) && !isPaid;
        trial_expirado = (now > fecha_fin_trial) && !isPaid;
      }

      // Pricing logic
      const plan = (raw.plan_suscripcion || '').toString().toLowerCase();
      const precio_plan_mensual =
        plan.includes('plata') ? 90 :
          plan.includes('oro') ? 220 :
            plan.includes('titanio') ? 440 : 0;

      const isPaid = ['activa', 'active', 'paid', 'pagado', 'pagando', 'suscrito']
        .includes((raw.estatus_suscripcion || '').toString().toLowerCase());

      const mrr_estimado = isPaid ? precio_plan_mensual : 0;

      // Activity Logic
      const activado_en_7d = (raw.nuevos_articulos_7d >= 5) && (raw.nuevos_tickets_7d >= 3);
      const empresa_inactiva_7d = (raw.nuevos_tickets_7d === 0);

      return {
        ...raw, // ID, Nombre, Correo, etc came from GAS

        // Frontend Derived Fields
        total_tickets: raw.nuevos_tickets_7d, // Assuming total ~= 7d for now if total not provided, or map correctly if GAS provides
        total_clientes: raw.nuevos_clientes_7d,
        total_articulos: raw.nuevos_articulos_7d,

        last_update: new Date().toISOString(),
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
