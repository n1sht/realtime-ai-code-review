"use client";

import { useEffect } from "react";

type AlertProps = {
  type: "error" | "success";
  message: string;
  onClose: () => void;
};

export default function Alert({ type, message, onClose }: AlertProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div className="alert-box" onClick={(e) => e.stopPropagation()}>
        <p className={`alert-title ${type}`}>
          {type === "error" ? "Something went wrong" : "Success"}
        </p>
        <p className="alert-msg">{message}</p>
        <div className="alert-actions">
          <button
            className={`btn btn-sm ${type === "error" ? "btn-danger" : "btn-primary"}`}
            onClick={onClose}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
