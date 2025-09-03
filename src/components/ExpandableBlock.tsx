import React from "react";
import style from "./TeamWorks.module.scss";
import Icon from "./Icon";

interface ExpandableBlockProps {
  id: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

const ExpandableBlock: React.FC<ExpandableBlockProps> = ({
  id,
  isExpanded,
  onToggle,
  children,
  className = "",
}) => {
  return (
    <div
      className={`slide-up ${className} ${
        isExpanded ? "slide-up--expanded" : ""
      }`}
    >
      <button
        className={style["expand-button"]}
        onClick={() => {
          console.log(
            "Expand button clicked for:",
            id,
            "current state:",
            isExpanded
          );
          onToggle(id);
        }}
        title={isExpanded ? "Свернуть блок" : "Развернуть блок"}
        aria-label={isExpanded ? "Свернуть блок" : "Развернуть блок"}
      >
        {isExpanded ? (
          <Icon name="collapse" size={20} className={style["expand-icon"]} />
        ) : (
          <Icon name="expand" size={20} className={style["expand-icon"]} />
        )}
      </button>
      {children}
    </div>
  );
};

export default ExpandableBlock;
