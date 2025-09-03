import React from "react";

interface IconProps {
  name: string;
  size?: number | string;
  className?: string;
  color?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = "",
  color = "currentColor",
  onClick,
  style,
}) => {
  const iconId = `icon-${name}`;

  return (
    <svg
      width={size}
      height={size}
      className={className}
      style={{ color, ...style }}
      onClick={onClick}
      role="img"
      aria-label={name}
    >
      <use href={`#${iconId}`} />
    </svg>
  );
};

export default Icon;
