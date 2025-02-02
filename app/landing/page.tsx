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

      <div className="frame">
        <div className="div">
          <div className="text-wrapper">Welcome to GEOTRAINER</div>

            <p className="p">Discover random places Around the World. </p>
          </div>

          <button 
            className="button transition-transform hover:scale-105" 
            onClick={() => router.push('/home')}
          >
            <div className="overlap-group">
              <div className="rectangle hover:bg-[#2a3878] transition-colors" />
              <div className="text-wrapper-2">Start Exploring</div>
            </div>
          </button>
      </div>
    </div>
  );
}
