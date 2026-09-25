import React, { useRef, useState, useEffect } from 'react';

interface MobileControlsProps {
  onJoystickMove: (vector: { x: number; y: number }) => void;
  onJump: () => void;
  onToggleSprint: (sprint: boolean) => void;
  isSprinting: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onJoystickMove,
  onJump,
  onToggleSprint,
  isSprinting,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const activeTouchId = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!joystickBaseRef.current || activeTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    setIsDragging(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickBaseRef.current || activeTouchId.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId.current) {
        const rect = joystickBaseRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const maxRadius = rect.width / 2;

        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const distance = Math.hypot(dx, dy);

        if (distance === 0) {
          setKnobPos({ x: 0, y: 0 });
          onJoystickMove({ x: 0, y: 0 });
        } else {
          const clampedDist = Math.min(distance, maxRadius);
          const angle = Math.atan2(dy, dx);
          const nx = Math.cos(angle) * (clampedDist / maxRadius);
          const ny = Math.sin(angle) * (clampedDist / maxRadius);

          setKnobPos({
            x: Math.cos(angle) * clampedDist,
            y: Math.sin(angle) * clampedDist,
          });
          onJoystickMove({ x: nx, y: ny });
        }
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        activeTouchId.current = null;
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        onJoystickMove({ x: 0, y: 0 });
        break;
      }
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 pointer-events-none z-30 select-none md:hidden flex justify-between items-end p-6">
      {/* Virtual Joystick */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="pointer-events-auto relative w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center touch-none shadow-xl"
      >
        <div
          className={`w-12 h-12 rounded-full border border-white/30 transition-transform ${
            isDragging ? 'bg-amber-400/80 shadow-[0_0_12px_#fbbf24]' : 'bg-white/30'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
      </div>

      {/* Action Buttons: Jump & Sprint */}
      <div className="pointer-events-auto flex flex-col gap-3">
        <button
          onTouchStart={() => onToggleSprint(!isSprinting)}
          className={`w-14 h-14 rounded-full border flex items-center justify-center text-xs font-black shadow-lg transition active:scale-95 ${
            isSprinting
              ? 'bg-purple-600 border-purple-400 text-white shadow-purple-600/40'
              : 'bg-white/10 border-white/20 text-zinc-300'
          }`}
        >
          RUN
        </button>

        <button
          onTouchStart={onJump}
          className="w-16 h-16 rounded-full bg-amber-500 border border-amber-400 text-black flex items-center justify-center text-xs font-black shadow-lg shadow-amber-500/30 transition active:scale-90"
        >
          JUMP
        </button>
      </div>
    </div>
  );
};
