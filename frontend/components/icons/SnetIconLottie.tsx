import Lottie from 'lottie-react';

// Sử dụng Lottie animation từ LottieFiles
export const SnetIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => {
  // URL animation khỉ từ LottieFiles
  const monkeyAnimation = 'https://lottie.host/4d3c5e8a-8f4a-4c5e-9c5a-8f4a4c5e9c5a/xyz.json';
  
  return (
    <div style={{ width: size, height: size }} className={className}>
      <Lottie 
        animationData={monkeyAnimation}
        loop={true}
        autoplay={true}
      />
    </div>
  );
};

export const SnetIconLarge = ({ size = 96, className = '' }: { size?: number; className?: string }) => {
  const monkeyAnimation = 'https://lottie.host/4d3c5e8a-8f4a-4c5e-9c5a-8f4a4c5e9c5a/xyz.json';
  
  return (
    <div style={{ width: size, height: size }} className={className}>
      <Lottie 
        animationData={monkeyAnimation}
        loop={true}
        autoplay={true}
      />
    </div>
  );
};
