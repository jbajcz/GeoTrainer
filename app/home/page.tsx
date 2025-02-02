  /// <reference types="@types/google.maps" />
'use client';
import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import MiniMap from '@/app/components/MiniMap';
import HintCard from '@/app/components/HintCard';
import HintSelector from '@/app/components/HintSelector';

interface Hint {
  imageUrl: string;
  description: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng | null>(null);
  const [hints, setHints] = useState<Hint[]>([]);

  // Initialize Google Maps loader
  const loader = new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    version: 'weekly',
    libraries: ['streetView']
  });

  useEffect(() => {
    loader.load().then(async (google) => {
      if (mapRef.current) {
        // Start with a temporary position
        const tempPosition = new google.maps.LatLng(0, 0);
        panoramaRef.current = new google.maps.StreetViewPanorama(mapRef.current, {
          position: tempPosition,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          addressControl: false,
          showRoadLabels: false,
          fullscreenControl: false,
          panControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
          }
        });
        
        // Get first random location
        await getNewLocation();
      }
    });
  }, []);

  const getRandomCoordinates = () => {
    // Generate random latitude between -60 and 75 (most populated areas)
    const lat = Math.random() * 135 - 60;
    // Generate random longitude between -180 and 180
    const lng = Math.random() * 360 - 180;
    return { lat, lng };
  };

  const getNewLocation = async () => {
    setIsLoading(true);
    setHints([]); // Clear hints array

    // Rest of the existing getNewLocation function...
    try {
      const google = await loader.load();
      const streetViewService = new google.maps.StreetViewService();

      const findValidLocation = async () => {
        const { lat, lng } = getRandomCoordinates();

        try {
          const result = await streetViewService.getPanorama({
            location: { lat, lng },
            radius: 50000, // Search radius in meters
            source: google.maps.StreetViewSource.OUTDOOR
          });

          const location = result.data.location;
          if (location?.latLng && panoramaRef.current) {
            setCurrentPosition(location.latLng);
            panoramaRef.current.setPosition(location.latLng);
            panoramaRef.current.setPov({ heading: 0, pitch: 0 });
          }
        } catch (error) {
          // No street view found at this location, try again
          return findValidLocation();
        }
      };

      await findValidLocation();
    } catch (error) {
      console.error('Error fetching street view:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addHint = (hint: Hint) => {
    setHints(prev => [hint, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#19224F]">
      <div className="z-10 flex gap-8">        
        {/* Left side - Street View and Hints */}
        <div className="flex flex-col">
          <div className="relative w-[1000px] h-[600px] rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                Loading...
              </div>
            )}
            <div 
              ref={mapRef} 
              className="w-full h-full"
            />
            {currentPosition && (
              <div 
                className="absolute bottom-4 right-4 z-10 transition-all duration-300 ease-in-out"
                onMouseEnter={() => setShowMap(true)}
                onMouseLeave={() => setShowMap(false)}
              >
                <MiniMap 
                  position={currentPosition} 
                  expanded={showMap}
                  getNewLocation={getNewLocation}
                />
              </div>
            )}
          </div>

          {/* Location Hints Section */}
          <div className="mt-4 w-[1000px] bg-black/30 backdrop-blur-sm rounded-lg p-3">
            <div className="flex flex-col items-center gap-3">
              <h3 className="text-white text-lg font-semibold">Location Hints</h3>
              <HintSelector 
                panoramaRef={panoramaRef}
                onNewHint={addHint}
              />
            </div>
          </div>
        </div>

        {/* Right side - Hint Cards */}
        <div className="w-[300px] space-y-4">
          <h2 className="text-white text-xl font-bold">Regional Features</h2>
          {hints.map((hint, index) => (
            <HintCard
              key={index}
              imageUrl={hint.imageUrl}
              description={hint.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
