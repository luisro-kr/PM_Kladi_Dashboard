// ====================================================================
// APPS SCRIPT WEBHOOK - DASHBOARD PM POS 2026 (NUEVO DESDE CERO)
// Fuente: Sheet "2025" (SOLO LECTURA). Persistencia opcional: "data".
// ====================================================================

const SHEET_2025 = "2025";
const SHEET_DATA = "data";

// Pricing fijo (si no quieres escribirlo a Sheets, se queda aquí)
const PLAN_PRICING = {
  "plata": 90,
  "oro": 220,
  "titanio": 440
};

// ------------------------
// Helpers
// ------------------------
function jsonOutput_(obj) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);

  // CORS
  const headers = out.getHeaders() || {};
  headers["Access-Control-Allow-Origin"] = "*";
  headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type";
  out.setHeaders(headers);

  return out;
}

function normalizePlan_(plan) {
  if (!plan) return "";
  return String(plan).trim().toLowerCase();
}

function parseDate_(v) {
  // Sheets may return Date object already
  if (v instanceof Date) return v;
  // Otherwise parse string
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d;
}

function addDays_(dateObj, days) {
  const d = new Date(dateObj.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays_(a, b) {
  // returns floor difference in days: a - b
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function looksPaid_(estatus) {
  // Ajusta según los valores reales de estatus_suscripcion
  // Ejemplos comunes: "activa", "active", "paid", "pagado"
  if (!estatus) return false;
  const s = String(estatus).trim().toLowerCase();
  return ["activa", "active", "paid", "pagado", "pagando", "suscrito"].includes(s);
}

// ------------------------
// Read "2025" rows
// ------------------------
function get2025Rows_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_2025);
  if (!sh) throw new Error(`No existe la hoja "${SHEET_2025}"`);

  const range = sh.getDataRange();
  const values = range.getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const rows = [];

  const now = new Date();

  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    if (!r || r.length === 0) continue;

    // Map por índice fijo (A-O) según tu especificación
    const fecha_creacion_empresa = parseDate_(r[0]);
    const empresa_id = r[1];

    if (!empresa_id) continue;

    const plan_suscripcion = r[2];
    const estatus_suscripcion = r[3];
    const nombre_empresa = r[4];
    const nombre_administrador = r[5];
    const telefono = r[6];
    const correo = r[7];

    const nuevos_tickets_7d = Number(r[8] || 0);
    const nuevos_clientes_7d = Number(r[9] || 0);
    const nuevos_articulos_7d = Number(r[10] || 0);

    const total_tickets = Number(r[11] || 0);
    const total_clientes = Number(r[12] || 0);
    const total_articulos = Number(r[13] || 0);

    const last_update = r[14]; // puede ser Date o string

    // Derivados
    let dias_desde_creacion = null;
    let fecha_fin_trial = null;
    let en_trial = null;
    let trial_expirado = null;

    if (fecha_creacion_empresa) {
      dias_desde_creacion = diffDays_(now, fecha_creacion_empresa);
      fecha_fin_trial = addDays_(fecha_creacion_empresa, 15);

      const paid = looksPaid_(estatus_suscripcion);
      en_trial = (now <= fecha_fin_trial) && !paid;
      trial_expirado = (now > fecha_fin_trial) && !paid;
    }

    // Activación (regla v1: ajustable en front o luego en "data")
    const activado_en_7d = (nuevos_articulos_7d >= 5) && (nuevos_tickets_7d >= 3);

    // Inactividad
    const empresa_inactiva_7d = (nuevos_tickets_7d === 0);

    // Pricing y MRR estimado
    const planKey = normalizePlan_(plan_suscripcion);
    const precio_plan_mensual = PLAN_PRICING[planKey] || 0;

    const pagado = looksPaid_(estatus_suscripcion);
    const mrr_estimado = pagado ? precio_plan_mensual : 0;

    rows.push({
      fecha_creacion_empresa: fecha_creacion_empresa ? fecha_creacion_empresa.toISOString() : null,
      empresa_id,
      plan_suscripcion,
      estatus_suscripcion,
      nombre_empresa,
      nombre_administrador,
      telefono,
      correo,
      nuevos_tickets_7d,
      nuevos_clientes_7d,
      nuevos_articulos_7d,
      total_tickets,
      total_clientes,
      total_articulos,
      last_update: (last_update instanceof Date) ? last_update.toISOString() : last_update,

      // Derivados
      dias_desde_creacion,
      fecha_fin_trial: fecha_fin_trial ? fecha_fin_trial.toISOString() : null,
      en_trial,
      trial_expirado,
      activado_en_7d,
      empresa_inactiva_7d,
      precio_plan_mensual,
      mrr_estimado
    });
  }

  return rows;
}

// ------------------------
// KPIs aggregations
// ------------------------
function computeKpis_(rows) {
  const total_empresas = rows.length;

  let pagando = 0;
  let en_trial = 0;
  let trial_expirado = 0;
  let inactivas_7d = 0;

  const por_plan = { plata: 0, oro: 0, titanio: 0, otro: 0 };
  const por_estatus = {}; // dynamic
  let mrr_total = 0;

  // trial por vencer en 7 días
  const now = new Date();
  let trial_vence_7d = 0;

  for (const r of rows) {
    const planKey = normalizePlan_(r.plan_suscripcion);
    if (por_plan.hasOwnProperty(planKey)) por_plan[planKey] += 1;
    else por_plan.otro += 1;

    const est = (r.estatus_suscripcion || "sin_estatus");
    por_estatus[est] = (por_estatus[est] || 0) + 1;

    if (looksPaid_(r.estatus_suscripcion)) pagando += 1;
    if (r.en_trial) en_trial += 1;
    if (r.trial_expirado) trial_expirado += 1;
    if (r.empresa_inactiva_7d) inactivas_7d += 1;

    mrr_total += Number(r.mrr_estimado || 0);

    // Trial vence en <=7 días (si está en trial)
    if (r.en_trial && r.fecha_fin_trial) {
      const fin = new Date(r.fecha_fin_trial);
      const daysToEnd = diffDays_(fin, now);
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
    por_estatus
  };
}

// ------------------------
// Writable "data" sheet utilities (optional)
// ------------------------
function getOrCreateDataSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_DATA);
  if (!sh) sh = ss.insertSheet(SHEET_DATA);
  return sh;
}

function seedPricingToData_() {
  const sh = getOrCreateDataSheet_();

  // We'll create a small table in data:
  // A1: key, B1: plan, C1: precio_plan_mensual
  // A2..: plata/oro/titanio
  const headers = ["key", "plan", "precio_plan_mensual"];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);

  const rows = [
    ["plata", "Plata", 90],
    ["oro", "Oro", 220],
    ["titanio", "Titanio", 440]
  ];

  sh.getRange(2, 1, rows.length, headers.length).setValues(rows);

  return { ok: true, rows_written: rows.length };
}

function upsertNote_(empresa_id, note, author) {
  const sh = getOrCreateDataSheet_();

  // Notes table layout (if not present, create headers):
  // A: empresa_id, B: nota, C: author, D: updated_at
  const neededHeaders = ["empresa_id", "nota", "author", "updated_at"];
  const firstRow = sh.getRange(1, 1, 1, 4).getValues()[0];

  const isEmpty = firstRow.every(v => !v);
  if (isEmpty) sh.getRange(1, 1, 1, 4).setValues([neededHeaders]);

  const data = sh.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(empresa_id)) {
      rowIndex = i + 1;
      break;
    }
  }

  const now = new Date().toISOString();
  const row = [String(empresa_id), String(note || ""), String(author || ""), now];

  if (rowIndex > 0) {
    sh.getRange(rowIndex, 1, 1, 4).setValues([row]);
    return { ok: true, action: "updated", rowIndex };
  } else {
    sh.appendRow(row);
    return { ok: true, action: "inserted", rowIndex: sh.getLastRow() };
  }
}

// ------------------------
// Web App endpoints
// ------------------------
function doOptions(e) {
  // CORS preflight
  return jsonOutput_({ ok: true });
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "kpis";

    const rows = get2025Rows_();

    if (action === "raw") {
      return jsonOutput_({
        ok: true,
        source_sheet: SHEET_2025,
        rows_count: rows.length,
        rows
      });
    }

    if (action === "kpis") {
      const kpis = computeKpis_(rows);
      return jsonOutput_({
        ok: true,
        source_sheet: SHEET_2025,
        generated_at: new Date().toISOString(),
        kpis
      });
    }

    if (action === "health") {
      return jsonOutput_({
        ok: true,
        message: "Webhook Dashboard PM POS 2026 funcionando",
        sheet: SpreadsheetApp.getActiveSpreadsheet().getId(),
        source_sheet: SHEET_2025,
        has_data_sheet: !!SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DATA)
      });
    }

    return jsonOutput_({ ok: false, error: "Acción no reconocida. Usa action=raw | kpis | health" });

  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOutput_({ ok: false, error: "POST sin body" });
    }

    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    // Seguridad básica: no permitir escribir en "2025"
    // Este webhook solo escribe en "data".

    if (action === "seed_pricing") {
      const result = seedPricingToData_();
      return jsonOutput_({ ok: true, result });
    }

    if (action === "upsert_note") {
      if (!body.empresa_id) return jsonOutput_({ ok: false, error: "Falta empresa_id" });
      const result = upsertNote_(body.empresa_id, body.nota || "", body.author || "");
      return jsonOutput_({ ok: true, result });
    }

    return jsonOutput_({ ok: false, error: "Acción POST no reconocida. Usa action=seed_pricing | upsert_note" });

  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
}
