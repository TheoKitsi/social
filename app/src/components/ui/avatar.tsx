"use client";

import { useState, useRef } from "react";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  onUpload?: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-20 h-20 text-xl",
};

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  src,
  name,
  size = "md",
  editable = false,
  onUpload,
  onRemove,
  className = "",
}: AvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Upload failed");
    } else {
      onUpload?.(data.url);
    }
    setUploading(false);
    // Reset input so same file can be re-selected
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleRemove() {
    setUploading(true);
    const res = await fetch("/api/profile/avatar", { method: "DELETE" });
    if (res.ok) {
      onRemove?.();
    }
    setUploading(false);
  }

  return (
    <div className={`relative inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold overflow-hidden ${
          src
            ? ""
            : "bg-primary/15 text-primary border border-primary/20"
        } ${editable ? "cursor-pointer group" : ""}`}
        onClick={editable ? () => fileRef.current?.click() : undefined}
      >
        {src ? (
          <img
            src={src}
            alt={name || "Avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          getInitials(name)
        )}

        {/* Upload overlay */}
        {editable && (
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
        )}
      </div>

      {editable && (
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {editable && src && !uploading && (
        <button
          onClick={handleRemove}
          className="text-[10px] text-on-surface-muted hover:text-error transition-colors"
        >
          Remove
        </button>
      )}

      {error && (
        <p className="text-[10px] text-error max-w-[120px] text-center">{error}</p>
      )}
    </div>
  );
}
