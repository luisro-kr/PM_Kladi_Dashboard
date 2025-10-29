import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { evento, empresaId, empresaNombre, email, data, ruta } = body;

    // Configurar autenticación de Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Preparar datos para insertar
    const timestamp = new Date().toISOString();
    const dataJson = typeof data === 'object' ? JSON.stringify(data) : String(data || '');

    const values = [[
      timestamp,
      evento,
      empresaId || '',
      empresaNombre || '',
      email || '',
      dataJson,
      ruta || ''
    ]];

    // Insertar en Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Eventos!A:G', // Asegúrate de tener una hoja llamada "Eventos"
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Evento registrado exitosamente' 
    });

  } catch (error) {
    console.error('Error al registrar evento:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar evento' },
      { status: 500 }
    );
  }
}
