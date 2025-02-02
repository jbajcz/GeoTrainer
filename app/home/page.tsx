/// <reference types="@types/google.maps" />
'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Loader } from '@googlemaps/js-api-loader';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);

  // Initialize Google Maps loader
  const loader = new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    version: 'weekly',
    libraries: ['streetView']
  });

  useEffect(() => {
    loader.load().then((google) => {
      if (mapRef.current) {
        // Initialize with default location (e.g., New York City)
        panoramaRef.current = new google.maps.StreetViewPanorama(mapRef.current, {
          position: { lat: 40.7128, lng: -74.0060 },
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

      <div className="z-10">        
        <div className="relative w-[1200px] h-[800px] mb-4 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              Loading...
            </div>
          )}
          <div 
            ref={mapRef} 
            className="w-full h-full"
          />
        </div>

        <button
          onClick={getNewLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          Get New Location
        </button>
      </div>
    </div>
  );
}
