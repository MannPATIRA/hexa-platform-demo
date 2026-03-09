"use client";

interface IosIconMaskProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  backgroundColor?: string;
}

export default function IosIconMask({
  src,
  alt,
  size = 60,
  className = "",
  backgroundColor = "#8E8E93",
}: IosIconMaskProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "22.37%",
        backgroundColor,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
