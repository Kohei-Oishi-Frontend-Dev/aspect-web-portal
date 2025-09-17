import React from "react";
import edit from "../assets/edit.svg";

export type CardProps = React.PropsWithChildren<{
    title?: string;
    editable?: boolean;
    onEdit?: () => void;
    className?: string;
  }>

const Card: React.FC<CardProps> = ({
  title,
  editable = false,
  onEdit,
  className = "",
  children,
}) => {
  return (
    <div
      className={`p-6 flex flex-col gap-3 bg-white rounded-lg border-[0.5px] border-subtle ${className}`}
    >
      {/* Header (optional) */}
      {title && (
          <p className="text-sm font-bold text-primary">{title}</p>
      )}
      <div className={`h-full ${title ? "" : ""}`}>{children}</div>
      {/* Edit button (only when editable) */}
      {editable && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit"
          className="self-end"
        >
          <img src={edit} alt="Edit" className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Card;
