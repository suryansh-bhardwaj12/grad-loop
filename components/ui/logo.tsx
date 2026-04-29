import React from "react";
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 100 100"
        className="w-8 h-8 md:w-10 md:h-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" /> {/* Red-500 */}
            <stop offset="100%" stopColor="#3B82F6" /> {/* Blue-500 */}
          </linearGradient>
        </defs>
        <path
          d="M30 50C30 41.7157 36.7157 35 45 35C53.2843 35 60 41.7157 60 50C60 58.2843 66.7157 65 75 65C83.2843 65 90 58.2843 90 50C90 41.7157 83.2843 35 75 35C66.7157 35 60 41.7157 60 50C60 58.2843 53.2843 65 45 65C36.7157 65 30 58.2843 30 50Z"
          stroke="url(#logo-gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
