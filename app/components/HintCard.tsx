import Image from 'next/image';
import { JSX } from 'react';
import { 
  FaTree,          // vegetation
  FaRoad,          // road signs
  FaBuilding,      // architecture
  FaCar,           // vehicles
  FaPalette,       // building style
  FaCloudSun,      // climate features
  FaCity           // urban layout
} from 'react-icons/fa';

interface HintCardProps {
  imageUrl?: string;
  description: string;
  context: string;
}

const contextIcons: { [key: string]: JSX.Element } = {
  'vegetation': <FaTree className="w-5 h-5" />,
  'road signs': <FaRoad className="w-5 h-5" />,
  'architecture': <FaBuilding className="w-5 h-5" />,
  'vehicles': <FaCar className="w-5 h-5" />,
  'building style': <FaPalette className="w-5 h-5" />,
  'climate features': <FaCloudSun className="w-5 h-5" />,
  'urban layout': <FaCity className="w-5 h-5" />
};

export default function HintCard({ imageUrl, description, context }: HintCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden mb-4 w-[300px]">
      <div className="relative h-[150px] bg-gray-700">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Location hint"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50">
            No image available
          </div>
        )}
      </div>
      <div className="p-4">
        {/* Context with icon */}
        <div className="flex items-center gap-2 mb-2 text-white/70 text-sm">
          {contextIcons[context.toLowerCase()] || <FaBuilding className="w-5 h-5" />}
          <span className="capitalize">{context}</span>
        </div>
        
        {/* Description */}
        <p className="text-white text-sm">{description}</p>
      </div>
    </div>
  );
} 