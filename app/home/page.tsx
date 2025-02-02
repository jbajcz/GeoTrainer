/// <reference types="@types/google.maps" />
'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Loader } from '@googlemaps/js-api-loader';
import MiniMap from '@/app/components/MiniMap';
import HintCard from '@/app/components/HintCard';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng | null>(null);
  const [selection, setSelection] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Google Maps loader
  const loader = new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    version: 'weekly',
    libraries: ['streetView']
  });

  useEffect(() => {
    loader.load().then((google) => {
      if (mapRef.current) {
        const initialPosition = new google.maps.LatLng(40.7128, -74.0060);
        setCurrentPosition(initialPosition);
        panoramaRef.current = new google.maps.StreetViewPanorama(mapRef.current, {
          position: initialPosition,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          addressControl: false,
          showRoadLabels: false,
          fullscreenControl: false,
        });
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
    // Clear any existing selection
    setSelection(null);
    try {
      const google = await loader.load();
      const streetViewService = new google.maps.StreetViewService();

      const findValidLocation = async () => {
        const { lat, lng } = getRandomCoordinates();
        const location = new google.maps.LatLng(lat, lng);

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

  const hints = [
    {
      imageUrl: '/assets/hints/architecture.jpg',
      description: 'Look for distinctive architectural styles in the region'
    },
    {
      imageUrl: '/assets/hints/vegetation.jpg',
      description: 'Notice the local vegetation and climate indicators'
    },
    {
      imageUrl: '/assets/hints/signage.jpg',
      description: 'Pay attention to road signs and local language'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/background.png"
          alt="Random Street View Background"
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>

      <div className="z-10 flex gap-8">        
        {/* Left side - Street View */}
        <div className="flex flex-col items-center">
          <div className="relative w-[800px] h-[600px] rounded-lg overflow-hidden">
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
                  setSelection={setSelection}
                  getNewLocation={getNewLocation}
                />
              </div>
            )}
          </div>

          <button
            onClick={getNewLocation}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            Get New Location
          </button>
        </div>

        {/* Right side - Hint Cards */}
        <div className="w-[300px] space-y-4">
          <h2 className="text-white text-xl font-bold mb-4">Location Hints</h2>
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
