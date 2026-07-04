/**
 * RunningText Component - Bottom ticker dengan marquee animation
 */

"use client";

interface RunningTextProps {
  messages: string[];
  speed?: number; // Duration in seconds, default 20s
}

export default function RunningText({
  messages,
  speed = 60, // 3x lebih lambat dari default 20s
}: RunningTextProps) {
  const displayText = messages.join(' • ');

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-64 z-30 bg-gradient-bgy text-white py-2 overflow-hidden">
      <div
        className="whitespace-nowrap inline-block animate-marquee"
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        <span className="text-sm font-medium px-4">{displayText}</span>
        {/* Duplicate for seamless loop */}
        <span className="text-sm font-medium px-4">{displayText}</span>
      </div>
    </div>
  );
}
