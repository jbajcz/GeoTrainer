'use client';
import { useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface HintSelectorProps {
  panoramaRef: React.RefObject<google.maps.StreetViewPanorama | null>;
  onNewHint: (hint: { imageUrl: string; description: string; context: string }) => void;
}

const CONTEXTS = [
  'architecture',
  'vegetation', 
  'road signs',
  'vehicles',
  'climate',
  'population',
];

export default function HintSelector({ panoramaRef, onNewHint }: HintSelectorProps) {
  const [selectedContext, setSelectedContext] = useState(CONTEXTS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState<string | null>(null);

  const captureAndAnalyze = async (context: string) => {
    if (!panoramaRef.current) return;
    setIsLoading(true);
    setLoadingContext(context);

    try {
      // Get current view
      const pov = panoramaRef.current.getPov();
      const location = panoramaRef.current.getPosition();
      const zoom = panoramaRef.current.getZoom();
      
      // Calculate FOV based on zoom level
      // Street View zoom is typically 0-5, where 0 is widest FOV and 5 is most zoomed
      const fov = 180 / Math.pow(2, zoom || 1); // Default to zoom 1 if undefined
      
      // Construct Street View image URL
      const imageUrl = `https://maps.googleapis.com/maps/api/streetview?`
        + `size=640x480`
        + `&location=${location?.lat()},${location?.lng()}`
        + `&heading=${pov.heading}`
        + `&pitch=${pov.pitch}`
        + `&fov=${fov}`
        + `&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Convert blob to base64
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Then analyze the image
      const formData = new FormData();
      formData.append('file', blob, 'streetview.jpg');
      formData.append('context', context);

      const analysisResponse = await fetch('http://localhost:5000/analyze-image', {
        method: 'POST',
        body: formData,
      });

      const { description } = await analysisResponse.json();
      console.log('description', description)
      
      if (description?.trim().toUpperCase() === 'INVALID') {
        toast.error(`No ${context} features detected. Try looking around for a better view!`, {
          duration: 4000,
          position: 'bottom-center',
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
          },
        });
        return;
      }
      
      if (description) {
        onNewHint({
          imageUrl: base64Data,
          description: description,
          context: context
        });
      }

    } catch (error) {
      console.error('Error analyzing view:', error);
      toast.error('Failed to analyze view. Please try again.', {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
        },
      });
    } finally {
      setIsLoading(false);
      setLoadingContext(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {CONTEXTS.map((context) => (
        <button
          key={context}
          onClick={() => captureAndAnalyze(context)}
          disabled={isLoading}
          className={`
            px-3 py-2 rounded text-white transition-colors
            ${loadingContext === context 
              ? 'bg-blue-600' 
              : 'bg-white/10 hover:bg-white/20 border border-white/20'
            }
            disabled:opacity-50 flex items-center gap-2
          `}
        >
          {loadingContext === context ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FaCamera className="w-4 h-4" />
          )}
          {context.charAt(0).toUpperCase() + context.slice(1)}
        </button>
      ))}
    </div>
  );
}