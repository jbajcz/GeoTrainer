'use client';
import { useEffect, useRef, useState } from 'react';

interface MiniMapProps {
  position: google.maps.LatLng;
  expanded: boolean;
  getNewLocation: () => void;
}

export default function MiniMap({ position, expanded, getNewLocation }: MiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);  // Track all markers
  const [actualMarker, setActualMarker] = useState<google.maps.Marker | null>(null);
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Function to clear all user markers
  const clearAllMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: new google.maps.LatLng(0, 0),
        zoom: 1,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        clickableIcons: false,
      });

      // Add click listener to map
      mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (submitted) return;
        
        const clickedPosition = e.latLng;
        if (!clickedPosition) return;

        clearAllMarkers();

        const newMarker = new google.maps.Marker({
          position: clickedPosition,
          map: mapInstanceRef.current,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          }
        });

        markersRef.current.push(newMarker);
      });
    }

    // Remove cleanup function to maintain markers when collapsed
  }, [position]); // Remove expanded from dependencies

  const handleSubmit = () => {
    if (markersRef.current.length === 0 || !mapInstanceRef.current) return;
    const userMarker = markersRef.current[markersRef.current.length - 1];

    // Show actual position marker
    const actualPositionMarker = new google.maps.Marker({
      position: position,
      map: mapInstanceRef.current,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    });
    setActualMarker(actualPositionMarker);

    // Draw line between markers
    const newPolyline = new google.maps.Polyline({
      path: [
        userMarker.getPosition()!,
        position
      ],
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: mapInstanceRef.current
    });
    setPolyline(newPolyline);

    // Calculate score based on distance
    const userPos = userMarker.getPosition()!;
    const dx = userPos.lat() - position.lat();
    const dy = userPos.lng() - position.lng();
    // Convert lat/lng distance to kilometers using Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = (dx * Math.PI) / 180;
    const dLon = (dy * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((position.lat() * Math.PI) / 180) *
      Math.cos((userPos.lat() * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Score calculation: 100% if distance is 0km, 0% if distance >= 2000km
    const calculatedScore = Math.max(0, Math.round((1 - distance/10000) * 100));
    setScore(calculatedScore);
    setSubmitted(true);
  };

  const resetGame = () => {
    clearAllMarkers();
    if (actualMarker) {
      actualMarker.setMap(null);
      setActualMarker(null);
    }
    if (polyline) {
      polyline.setMap(null);
      setPolyline(null);
    }
    setSubmitted(false);
    setScore(null);
    getNewLocation();
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={mapRef} 
        className={`
          transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-2 border-white shadow-lg
          ${expanded ? 'w-[600px] h-[400px]' : 'w-[150px] h-[150px]'}
        `}
      />
      {expanded && !submitted && (
        <button
          onClick={handleSubmit}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-[600px]"
        >
          Submit Guess
        </button>
      )}
      {expanded && submitted && (
        <div className="mt-2 text-center w-[600px]">
          <div className="text-xl font-bold text-white bg-[#627ec2] border-2 border-[#19224f] rounded-lg py-2">
            Score: {score}%
          </div>
          <button
            onClick={resetGame}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors w-full"
          >
            Next Location
          </button>
        </div>
      )}
    </div>
  );
}