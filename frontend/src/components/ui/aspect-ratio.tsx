"use client";

import * as React from "react";

interface AspectRatioProps {
  ratio?: number;
  children?: React.ReactNode;
  className?: string;
}

function AspectRatio({ ratio = 16 / 9, children, className, ...props }: AspectRatioProps) {
  return (
    <div 
      data-slot="aspect-ratio" 
      className={className}
      style={{ 
        position: 'relative',
        width: '100%',
        paddingBottom: `${(1 / ratio) * 100}%`
      }}
      {...props}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}>
        {children}
      </div>
    </div>
  );
}

export { AspectRatio };
