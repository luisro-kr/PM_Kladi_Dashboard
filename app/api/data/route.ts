import { NextResponse } from 'next/server';

const SPREADSHEET_ID = '1zFdHighR8eKFeiCM_8RjGKNoCtuL2VxAdeIJ-283XWY';
const API_KEY = 'AIzaSyCBTSvJ6FaP1olBYpWOwGaMdKokE3XXXXX';
const RANGE = '2025!A1:Y';

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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
