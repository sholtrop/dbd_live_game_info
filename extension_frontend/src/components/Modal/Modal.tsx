import React from "react";
import "./Modal.css";

interface Props {
  open: boolean;
  onClickOutside: () => void;
  className?: string;
}

const Modal: React.FC<Props> = ({
  open = true,
  onClickOutside,
  children,
  className,
}) => {
  if (!open) return null;
  return (
    <div id="modal" onClick={onClickOutside}>
      <div
        className={"modal-content " + (className ?? "")}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
