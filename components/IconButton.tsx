import React from 'react';

interface IconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'toggled' | 'primary';
  className?: string;
  tooltip: string;
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, children, variant = 'default', className = '', tooltip }) => {
  const baseClasses = 'relative group p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';

  const variantClasses = {
    default: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    toggled: 'bg-gray-500 text-white',
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
  };
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
      <div className="absolute bottom-full mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {tooltip}
      </div>
    </button>
  );
};

export default IconButton;