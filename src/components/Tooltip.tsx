import React, { useState } from "react";

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <div className="absolute bottom-full mb-2 w-auto p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
