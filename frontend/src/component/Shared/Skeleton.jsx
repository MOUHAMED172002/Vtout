import React from "react";

/**
 * Reusable Skeleton component with shimmer effect.
 * Usage: <Skeleton className="w-full h-40 rounded-3xl" />
 */
export const Skeleton = ({ className = "" }) => {
    return (
        <div
            className={`relative overflow-hidden bg-base-200 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent ${className}`}
        />
    );
};

/**
 * Specific Skeleton for Product Cards
 */
export const ProductSkeleton = () => {
    return (
        <div className="bg-base-100 rounded-[2.5rem] p-6 space-y-6 border border-base-200 shadow-sm">
            <Skeleton className="w-full aspect-square rounded-[2rem]" />
            <div className="space-y-3">
                <Skeleton className="w-1/3 h-3 rounded-full" />
                <Skeleton className="w-full h-5 rounded-full" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="w-24 h-8 rounded-full" />
                    <Skeleton className="w-10 h-10 rounded-xl" />
                </div>
            </div>
        </div>
    );
};

/**
 * Specific Skeleton for Category items
 */
export const CategorySkeleton = () => {
    return (
        <div className="flex flex-col items-center gap-3">
            <Skeleton className="w-20 h-20 rounded-3xl" />
            <Skeleton className="w-14 h-3 rounded-full" />
        </div>
    );
};
