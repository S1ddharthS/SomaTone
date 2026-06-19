import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';

/**
 * UserMenu — Profile avatar with sign-out dropdown.
 *
 * Shows the user's OAuth avatar or a monogram fallback,
 * with a glass-panel dropdown menu.
 */
export default function UserMenu({ profile, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const avatarUrl = profile?.avatar_url;
  const name = profile?.full_name || profile?.email || 'User';
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef} id="user-menu">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 flex-shrink-0"
        id="user-avatar-btn"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center">
            <span className="text-label text-text-muted">{initials}</span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 glass-panel-dense rounded-xl overflow-hidden animate-fade-in z-50">
          {/* Profile Info */}
          <div className="px-4 py-3 border-b border-white/[0.04]">
            <p className="text-body-sm text-text-primary truncate">{name}</p>
            {profile?.email && (
              <p className="text-label text-text-muted truncate">{profile.email}</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm text-text-secondary hover:bg-white/[0.04] transition-colors"
              id="sign-out-btn"
            >
              <LogOut size={14} className="text-text-muted" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
