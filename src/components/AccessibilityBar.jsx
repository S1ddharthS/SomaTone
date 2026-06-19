import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Waves, HandMetal, Settings2, X } from 'lucide-react';

/**
 * SensoryRoutingPanel — Premium popover for sensory accessibility controls.
 */
export default function AccessibilityBar({ modes, onToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const cards = [
    {
      key: 'earcon',
      icon: Volume2,
      label: 'Spatial Earcons',
      description: 'Audio spatialization cues for visually impaired users. Hands trigger positioning tones.',
      color: 'from-blue-500/20 to-blue-500/0',
      border: 'border-blue-500/30',
      activeBg: 'bg-blue-500/10',
      textActive: 'text-blue-400',
    },
    {
      key: 'haptic',
      icon: Waves,
      label: 'Haptic Resonance',
      description: 'Visualizes audio frequencies as haptic waves for deaf or hard of hearing users.',
      color: 'from-emerald-500/20 to-emerald-500/0',
      border: 'border-emerald-500/30',
      activeBg: 'bg-emerald-500/10',
      textActive: 'text-emerald-400',
    },
    {
      key: 'gestureMacro',
      icon: HandMetal,
      label: 'Gesture Macros',
      description: 'Enables ASL-inspired gesture sequences for non-verbal emotional expression.',
      color: 'from-purple-500/20 to-purple-500/0',
      border: 'border-purple-500/30',
      activeBg: 'bg-purple-500/10',
      textActive: 'text-purple-400',
    },
  ];

  return (
    <div className="relative" ref={menuRef} id="accessibility-bar">
      {/* Trigger Button */}
      <button
        onClick={toggleMenu}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 border ${
          isOpen
            ? 'bg-white/[0.08] border-white/[0.15] text-text-primary'
            : 'bg-white/[0.03] border-white/[0.06] text-text-muted hover:text-text-secondary hover:bg-white/[0.06]'
        }`}
        title="Sensory Routing & Accessibility"
      >
        <Settings2 size={14} />
        <span className="text-body-sm font-medium tracking-wide hidden md:inline">Sensory Routing</span>
        
        {/* Indicator dot if any mode is active */}
        {Object.values(modes).some(v => v) && (
          <span className="flex h-2 w-2 relative ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sage"></span>
          </span>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl p-5 shadow-2xl animate-scale-in origin-top-right z-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-heading-sm text-text-primary">Sensory Routing</h3>
              <p className="text-label text-text-muted mt-0.5">Adapt SomaTone to your sensory needs</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {cards.map(({ key, icon: Icon, label, description, color, border, activeBg, textActive }) => {
              const isActive = modes[key];
              return (
                <button
                  key={key}
                  onClick={() => onToggle(key)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                    isActive
                      ? `${activeBg} ${border} shadow-[0_0_15px_rgba(255,255,255,0.05)]`
                      : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08]'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${isActive ? `bg-gradient-to-b ${color}` : 'bg-white/[0.05]'}`}>
                    <Icon size={16} className={isActive ? textActive : 'text-text-muted'} />
                  </div>
                  <div>
                    <h4 className={`text-body-sm font-medium mb-1 ${isActive ? textActive : 'text-text-secondary'}`}>
                      {label}
                    </h4>
                    <p className="text-[0.65rem] leading-relaxed text-text-muted/70">
                      {description}
                    </p>
                  </div>
                  <div className="ml-auto mt-1 flex-shrink-0">
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${isActive ? 'bg-sage' : 'bg-white/[0.1]'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
