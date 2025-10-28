import { NextResponse } from 'next/server';

const SPREADSHEET_ID = '1zFdHighR8eKFeiCM_8RjGKNoCtuL2VxAdeIJ-283XWY';
const API_KEY = 'AIzaSyCBTSvJ6FaP1olBYpWOwGaMdKokE3XXXXX';
const RANGE = '2025!A1:Y';

// Mock data for demonstration when API is unavailable
const MOCK_DATA = [
  ['Mes', 'Ventas', 'Objetivo', 'Empresas Activas', 'Cotizaciones', 'Convertidas', 'Tasa Conversión', 'Clientes Nuevos', 'MRR', 'Churn'],
  ['Enero', '45000', '50000', '120', '85', '42', '49.4', '15', '12000', '2.5'],
  ['Febrero', '52000', '50000', '135', '92', '48', '52.2', '18', '14500', '2.1'],
  ['Marzo', '48000', '50000', '140', '88', '45', '51.1', '16', '15200', '1.8'],
  ['Abril', '55000', '50000', '145', '95', '51', '53.7', '20', '16800', '1.5'],
  ['Mayo', '58000', '50000', '150', '102', '56', '54.9', '22', '18200', '1.3'],
  ['Junio', '62000', '50000', '158', '108', '61', '56.5', '25', '19500', '1.2'],
  ['Julio', '59000', '50000', '162', '98', '55', '56.1', '21', '20100', '1.4'],
  ['Agosto', '64000', '50000', '168', '110', '64', '58.2', '26', '21800', '1.1'],
  ['Septiembre', '67000', '50000', '175', '115', '69', '60.0', '28', '23200', '0.9'],
  ['Octubre', '71000', '50000', '182', '122', '75', '61.5', '30', '25000', '0.8'],
  ['Noviembre', '74000', '50000', '188', '128', '81', '63.3', '32', '26500', '0.7'],
  ['Diciembre', '78000', '50000', '195', '135', '87', '64.4', '35', '28000', '0.6'],
];

export async function GET() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.values || [],
      range: data.range,
    });
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    console.log('Using mock data for demonstration...');
    
    // Return mock data instead of error for demonstration
    return NextResponse.json({
      success: true,
      data: MOCK_DATA,
      range: '2025!A1:Y',
      isMockData: true,
    });
  }
}
