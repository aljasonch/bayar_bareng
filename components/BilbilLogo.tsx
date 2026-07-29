import React from 'react'

export default function BilbilLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Left half of the torn receipt */}
      <path d="M3 2v18l2-2 2 2 2-2 2 2V2Z" />
      <line x1="6" y1="7" x2="8" y2="7" />
      <line x1="6" y1="11" x2="8" y2="11" />

      {/* Right half of the torn receipt */}
      <path d="M13 2v18l2-2 2 2 2-2 2 2V2Z" />
      <line x1="16" y1="7" x2="18" y2="7" />
      <line x1="16" y1="11" x2="18" y2="11" />
      
      {/* Scissor icon in the middle? No, keep it minimal */}
    </svg>
  )
}
