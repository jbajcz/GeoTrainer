'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Landing() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/background.png" 
          alt="Landing Page Background"
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>

      <div className="z-10 text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">
          Welcome to Street View Explorer
        </h1>
        <p className="text-xl text-gray-200 mb-8">
          Discover random places around the world
        </p>
        <button
          onClick={() => router.push('/home')}
          className="px-6 py-3 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transition-colors"
        >
          Start Exploring
        </button>
      </div>
    </div>
  );
}
