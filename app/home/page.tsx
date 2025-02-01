'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageKey, setImageKey] = useState(0); // Used to force image refresh

  const getNewImage = async () => {
    setIsLoading(true);
    // Force a new image fetch by updating the key
    setImageKey(prev => prev + 1);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Random Street View Explorer</h1>
      
      <div className="relative w-[600px] h-[400px] mb-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            Loading...
          </div>
        )}
        <Image
          key={imageKey}
          src="/api/random-street-view"
          alt="Random Street View"
          fill
          className="object-cover rounded-lg"
          priority
        />
      </div>

      <button
        onClick={getNewImage}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        disabled={isLoading}
      >
        Get New Location
      </button>
    </div>
  );
}
