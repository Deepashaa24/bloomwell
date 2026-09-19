import { useState } from 'react';

const Avatar = ({ user, name, avatarUrl, size = 40, className = '', onClick, type = 'button' }) => {
  const displayName = name || user?.name || 'User';
  const source = avatarUrl || user?.avatarUrl || '';
  const [imageFailed, setImageFailed] = useState(false);

  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';
  const sharedClasses = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-[#800020] font-bold text-[#fff5f5] shadow-sm ${className}`;
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${Math.max(12, size * 0.42)}px`,
    cursor: onClick ? 'pointer' : 'default',
  };

  if (source && !imageFailed) {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`${sharedClasses} p-0`}
        style={style}
        aria-label={displayName}
      >
        <img
          src={source}
          alt={displayName}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={sharedClasses}
      style={style}
      aria-label={displayName}
    >
      {initial}
    </button>
  );
};

export default Avatar;
