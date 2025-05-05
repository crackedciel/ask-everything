/* eslint-disable @next/next/no-img-element */
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'away';
  className?: string;
  address?: string,
}

const ProfileAvatar = ({
  src,
  alt = 'Profile picture',
  size = 'md',
  status,
  className,
  address,
}: ProfileAvatarProps) => {
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
  };

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

      const generatePixelPattern = useMemo(() => {
    if ((!address) || src) return null;

    const PIXEL_SIZE = 16;
    const GRID_SIZE = 8;
    const canvas = document.createElement('canvas');
    canvas.width = GRID_SIZE * PIXEL_SIZE;
    canvas.height = GRID_SIZE * PIXEL_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const hash = Array.from(address).reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const hue = Math.abs(hash % 360);
    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
    ctx.imageSmoothingEnabled = false;
    
    const pattern = [];
    for (let i = 0; i < Math.floor(GRID_SIZE * GRID_SIZE / 2); i++) {
      pattern.push(((hash >> i) & 1) === 1);
    }

    // Draw left half
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < Math.floor(GRID_SIZE / 2); x++) {
        if (pattern[y * Math.floor(GRID_SIZE / 2) + x]) {
          ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    }

    // Mirror to right half
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < Math.floor(GRID_SIZE / 2); x++) {
        if (pattern[y * Math.floor(GRID_SIZE / 2) + x]) {
          ctx.fillRect((GRID_SIZE - 1 - x) * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    }

    return canvas.toDataURL();
  }, [src, address]);

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden bg-gray-700/30 flex items-center justify-center',
          sizeClasses[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : generatePixelPattern ? (
          <img
            src={generatePixelPattern}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <svg
              className={cn(
                'w-1/2 h-1/2',
                size === 'sm' ? 'scale-75' : 'scale-100'
              )}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>
      {status && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-gray-900',
            statusColors[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
};

export default ProfileAvatar;