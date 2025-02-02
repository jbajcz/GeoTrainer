import fs from 'fs';
import path from 'path';
import html2canvas from 'html2canvas';

export const captureScreenshot = async (element: HTMLElement): Promise<string> => {
  try {
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Capture screenshot
    const canvas = await html2canvas(element);
    const base64Data = canvas.toDataURL('image/jpeg', 0.95).replace(/^data:image\/jpeg;base64,/, '');

    // Generate unique filename
    const filename = `screenshot_${Date.now()}.jpg`;
    const filepath = path.join(screenshotsDir, filename);

    // Save file
    fs.writeFileSync(filepath, base64Data, 'base64');

    return `/screenshots/${filename}`;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw error;
  }
};