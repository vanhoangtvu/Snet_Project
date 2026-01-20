import { GiMonkey } from 'react-icons/gi';

export const SnetIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <GiMonkey size={size} className={className} />
);

export const SnetIconLarge = ({ size = 96, className = '' }: { size?: number; className?: string }) => (
  <GiMonkey size={size} className={className} />
);

export const SnetLogo = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-4xl' }
  };
  
  const { icon, text } = sizes[size];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <GiMonkey size={icon} />
      <span className={`font-bold ${text}`}>Snet</span>
    </div>
  );
};
