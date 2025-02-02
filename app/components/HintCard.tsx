import Image from 'next/image';

interface HintCardProps {
  imageUrl: string;
  description: string;
}

export default function HintCard({ imageUrl, description }: HintCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden mb-4 w-[300px]">
      <div className="relative h-[150px]">
        <Image
          src={imageUrl}
          alt="Location hint"
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <p className="text-white text-sm">{description}</p>
      </div>
    </div>
  );
} 