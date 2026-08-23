import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  mode?: 'grid' | 'list';
  gridCols?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 6,
  mode = 'grid',
  gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
}) => {
  return (
    <div
      className={
        mode === 'grid'
          ? `grid ${gridCols} gap-3`
          : 'space-y-2'
      }
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={
            mode === 'grid'
              ? 'h-36 rounded-xl glass-card border border-white/5 animate-pulse bg-white/5'
              : 'h-14 rounded-xl glass-card border border-white/5 animate-pulse bg-white/5'
          }
        />
      ))}
    </div>
  );
};
