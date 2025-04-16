import React from "react";

export default function Loading({
  width,
  height,
  color,
}: {
  width: string;
  height: string;
  color?: string;
}) {
  return (
    <div
      className={`rounded-[1.5rem] bg-${
        color ? color : "foreground"
      } animate-pulse`}
      style={{ width, height }}
    />
  );
}
