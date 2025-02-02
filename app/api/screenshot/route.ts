import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { base64Data } = await request.json();

    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `screenshot_${Date.now()}.jpg`;
    const filepath = path.join(screenshotsDir, filename);

    // Save file
    fs.writeFileSync(filepath, base64Data, 'base64');

    return NextResponse.json({ path: `/screenshots/${filename}` });
  } catch (error) {
    console.error('Error saving screenshot:', error);
    return NextResponse.json({ error: 'Failed to save screenshot' }, { status: 500 });
  }
} 