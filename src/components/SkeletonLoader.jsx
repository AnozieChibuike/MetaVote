import React from "react";

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`}></div>
  );
};

export const CardSkeleton = () => (
  <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    ))}
  </div>
);

export const CandidateGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl flex items-center gap-4"
      >
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    ))}
  </div>
);

export const ResultsSkeleton = () => (
  <div className="space-y-8">
    {[1, 2].map((i) => (
      <div
        key={i}
        className="bg-slate-800/50 border border-slate-700 rounded-3xl overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-700 flex justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="p-8 space-y-6">
          {[1, 2, 3].map((j) => (
            <div key={j} className="space-y-2">
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-40" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-4 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
