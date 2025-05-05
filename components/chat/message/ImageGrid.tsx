/* eslint-disable @next/next/no-img-element */

'use client';

import React, { useState } from 'react';


interface ImageGridProps {
  images: string[];
}

const ImageGrid = ({ images }: ImageGridProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Handle grid layout based on number of images
  const getGridClassName = () => {
    switch (images.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2";
      case 4:
        return "grid-cols-2";
      default:
        return "grid-cols-3";
    }
  };

  // Handle image layout and sizing based on position and count
  const getImageClassName = (index: number) => {
    if (images.length === 1) {
      return "h-96 w-full object-cover";
    }
    if (images.length === 3 && index === 0) {
      return "col-span-2 h-48 w-full object-cover";
    }
    if (images.length === 4 && index < 2) {
      return "h-48 w-full object-cover";
    }
    return "h-48 w-full object-cover";
  };

  return (
    <div className="relative w-full max-w-2xl my-2">
      <div className={`grid ${getGridClassName()} gap-1`}>
        {images.slice(0, 6).map((image, index) => (
          <div 
            key={index} 
            className={`relative ${images.length === 3 && index === 0 ? 'col-span-2' : ''} 
              overflow-hidden rounded-lg cursor-pointer
              transition-transform duration-200 hover:opacity-90`}
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className={`${getImageClassName(index)} transition-transform duration-200 hover:scale-105`}
            />
            {images.length > 6 && index === 5 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xl font-medium">
                  +{images.length - 6}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button 
              className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGrid;