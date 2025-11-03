import { NextResponse } from 'next/server';

const SPREADSHEET_ID = '1zFdHighR8eKFeiCM_8RjGKNoCtuL2VxAdeIJ-283XWY';
const API_KEY = 'AIzaSyCBTSvJ6FaP1olBYpWOwGaMdKokE3Ph1J4';
const SOURCE_RANGE = "'2025'!A1:Y3000";
const SNAPSHOT_SHEET = 'Snapshots_Diarios';

export async function POST() {
  try {
    console.log('📸 Iniciando guardado de snapshot...');
    
    // 1. Leer datos actuales de la hoja principal
    const sourceUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SOURCE_RANGE}?key=${API_KEY}`;
    const sourceResponse = await fetch(sourceUrl);
    
    if (!sourceResponse.ok) {
      throw new Error(`Error leyendo hoja principal: ${sourceResponse.statusText}`);
    }
    
    const sourceData = await sourceResponse.json();
    const rows = sourceData.values || [];
    
    if (rows.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'No hay datos para guardar' 
      });
    }
    
    // 2. Preparar datos para snapshot
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    // Agregar columna de fecha_snapshot al inicio
    const snapshotHeaders = ['fecha_snapshot', ...headers];
    const snapshotRows = dataRows.map(row => [today, ...row]);
    
    console.log(`📊 Preparando snapshot de ${snapshotRows.length} empresas para ${today}`);
    
    // 3. Verificar si la hoja Snapshots_Diarios existe
    const sheetMetadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`;
    const metadataResponse = await fetch(sheetMetadataUrl);
    const metadata = await metadataResponse.json();
    
    const sheetExists = metadata.sheets?.some((sheet: any) => 
      sheet.properties.title === SNAPSHOT_SHEET
    );
    
    if (!sheetExists) {
      return NextResponse.json({
        success: false,
        error: `La hoja "${SNAPSHOT_SHEET}" no existe. Por favor créala manualmente primero.`,
        instructions: [
          `1. Abre el Google Sheet`,
          `2. Crea una nueva hoja llamada "${SNAPSHOT_SHEET}"`,
          `3. Vuelve a ejecutar este endpoint`
        ]
      });
    }
    
    // 4. Leer snapshots existentes para verificar si ya hay uno de hoy
    const snapshotReadUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SNAPSHOT_SHEET}!A:A?key=${API_KEY}`;
    const snapshotReadResponse = await fetch(snapshotReadUrl);
    const existingSnapshots = await snapshotReadResponse.json();
    
    const todayExists = existingSnapshots.values?.some((row: string[]) => row[0] === today);
    
    if (todayExists) {
      console.log(`⚠️ Ya existe un snapshot para ${today}`);
      return NextResponse.json({
        success: false,
        error: `Ya existe un snapshot para la fecha ${today}`,
        message: 'Solo se permite un snapshot por día'
      });
    }
    
    // 5. Append datos al final de la hoja de snapshots
    // Nota: Google Sheets API requiere autenticación OAuth para escritura
    // Por ahora, retornamos los datos para que se puedan copiar manualmente
    
    return NextResponse.json({
      success: true,
      message: `Snapshot preparado para ${today}`,
      data: {
        fecha: today,
        totalEmpresas: snapshotRows.length,
        headers: snapshotHeaders,
        preview: snapshotRows.slice(0, 5), // Primeras 5 filas de ejemplo
        instructions: [
          '⚠️ IMPORTANTE: Google Sheets API requiere OAuth para escritura.',
          'Opciones para guardar el snapshot:',
          '',
          'OPCIÓN 1 - Manual (Rápida):',
          '1. Copia los datos de la respuesta',
          `2. Pégalos en la hoja "${SNAPSHOT_SHEET}"`,
          '',
          'OPCIÓN 2 - Automática con Google Apps Script:',
          '1. Ve a Extensiones > Apps Script en tu Google Sheet',
          '2. Crea este script:',
          '',
          'function guardarSnapshotDiario() {',
          '  const ss = SpreadsheetApp.getActiveSpreadsheet();',
          '  const sourceSheet = ss.getSheetByName("2025");',
          '  const snapshotSheet = ss.getSheetByName("Snapshots_Diarios");',
          '  ',
          '  const today = Utilities.formatDate(new Date(), "GMT-6", "yyyy-MM-dd");',
          '  const sourceData = sourceSheet.getDataRange().getValues();',
          '  ',
          '  // Agregar fecha_snapshot a cada fila',
          '  const snapshotData = sourceData.slice(1).map(row => [today, ...row]);',
          '  ',
          '  // Append a la hoja de snapshots',
          '  if (snapshotData.length > 0) {',
          '    snapshotSheet.getRange(snapshotSheet.getLastRow() + 1, 1, snapshotData.length, snapshotData[0].length)',
          '      .setValues(snapshotData);',
          '  }',
          '}',
          '',
          '3. Configura un trigger diario (Reloj) para ejecutarlo automáticamente'
        ]
      },
      googleAppsScript: `
function guardarSnapshotDiario() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName("2025");
  const snapshotSheet = ss.getSheetByName("Snapshots_Diarios");
  
  const today = Utilities.formatDate(new Date(), "GMT-6", "yyyy-MM-dd");
  
  // Verificar si ya existe snapshot de hoy
  const existingDates = snapshotSheet.getRange("A:A").getValues().flat();
  if (existingDates.includes(today)) {
    Logger.log("Ya existe snapshot para " + today);
    return;
  }
  
  const sourceData = sourceSheet.getDataRange().getValues();
  const headers = sourceData[0];
  const dataRows = sourceData.slice(1);
  
  // Agregar fecha_snapshot a cada fila
  const snapshotData = dataRows.map(row => [today, ...row]);
  
  // Si es el primer snapshot, agregar headers
  if (snapshotSheet.getLastRow() === 0) {
    snapshotSheet.appendRow(["fecha_snapshot", ...headers]);
  }
  
  // Append datos
  if (snapshotData.length > 0) {
    snapshotSheet.getRange(snapshotSheet.getLastRow() + 1, 1, snapshotData.length, snapshotData[0].length)
      .setValues(snapshotData);
  }
  
  Logger.log("Snapshot guardado: " + snapshotData.length + " empresas");
}
      `.trim()
    });
    
  } catch (error) {
    console.error('Error guardando snapshot:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
