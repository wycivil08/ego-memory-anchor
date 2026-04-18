import * as React from "react"
import { cn } from "@/lib/utils"

interface CandleIconProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  width?: number
  height?: number
}

export function CandleIcon({ className, width = 24, height = 24, ...props }: CandleIconProps) {
  return (
    <div 
      className={cn("relative inline-block", className)} 
      style={{ width, height }}
      {...props}
    >
      <svg
        className="w-full h-full text-current"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <rect x="9" y="10" width="6" height="10" rx="1" fill="currentColor" />
        <rect x="8" y="9" width="8" height="2" rx="0.5" fill="currentColor" opacity="0.8" />
      </svg>
      <svg
        className="absolute animate-flame"
        style={{ 
          top: `-${Math.floor(height * 0.3)}px`, 
          left: `calc(50% - ${Math.floor(width * 0.25)}px)`, 
          width: `${Math.floor(width * 0.5)}px`, 
          height: `${Math.floor(height * 0.5)}px` 
        }}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z"
          fill="#f59e0b"
          className="animate-flame-inner"
        />
        <path
          d="M12 4C12 4 10 7 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7 12 4 12 4Z"
          fill="#fbbf24"
          className="animate-flame-core"
        />
      </svg>
    </div>
  )
}
