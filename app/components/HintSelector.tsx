'use client';
import { useState } from 'react';
import { FaCamera } from 'react-icons/fa';

interface HintSelectorProps {
  panoramaRef: React.RefObject<google.maps.StreetViewPanorama | null>;
  onNewHint: (hint: { imageUrl: string; description: string }) => void;
}

const CONTEXTS = [
  'architecture',
  'vegetation',
  'road signs',
  'vehicles',
  'building style',
  'climate features',
  'urban layout'
];

export default function HintSelector({ panoramaRef, onNewHint }: HintSelectorProps) {
  const [selectedContext, setSelectedContext] = useState(CONTEXTS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const captureAndAnalyze = async () => {
    if (!panoramaRef.current) return;
    setIsLoading(true);

    try {
      // Get current view
      const pov = panoramaRef.current.getPov();
      const location = panoramaRef.current.getPosition();
      
      // Construct Street View image URL
      const imageUrl = `https://maps.googleapis.com/maps/api/streetview?`
        + `size=640x480`
        + `&location=${location?.lat()},${location?.lng()}`
        + `&heading=${pov.heading}`
        + `&pitch=${pov.pitch}`
        + `&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Save image first
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });

      const saveResponse = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Data }),
      });

      const { path: screenshotPath } = await saveResponse.json();

      // Then analyze the image
      const formData = new FormData();
      formData.append('file', blob, 'streetview.jpg');
      formData.append('context', selectedContext);

      const analysisResponse = await fetch('http://localhost:5000/analyze-image', {
        method: 'POST',
        body: formData,
      });

      const { description } = await analysisResponse.json();
      
      if (description) {
        onNewHint({
          imageUrl: screenshotPath,
          description: description
        });
      }

    } catch (error) {
      console.error('Error analyzing view:', error);
      onNewHint({
        imageUrl: '',
        description: 'Failed to analyze view'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <select
        value={selectedContext}
        onChange={(e) => setSelectedContext(e.target.value)}
        className="px-3 py-2 rounded bg-white/10 text-white border border-white/20"
      >
        {CONTEXTS.map((context) => (
          <option key={context} value={context} className="text-black">
            {context.charAt(0).toUpperCase() + context.slice(1)}
          </option>
        ))}
      </select>

      <button
        onClick={captureAndAnalyze}
        disabled={isLoading}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <FaCamera className="w-6 h-6" />
        )}
      </button>
    </div>
  );
} 