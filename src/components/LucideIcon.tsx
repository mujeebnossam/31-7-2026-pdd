import React from 'react';
import * as Icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export default function LucideIcon({ name, className = '', size = 20, style }: LucideIconProps) {
  // Safe dynamic lookup with fallback to AlertCircle icon
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent) {
    return <Icons.AlertCircle className={className} size={size} style={style} />;
  }
  
  return <IconComponent className={className} size={size} style={style} />;
}
