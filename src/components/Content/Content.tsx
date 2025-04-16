import React from "react";

export default function Content({ children }) {
  return (
    <div className="flex flex-col gap-8 max-w-[60rem] flex-1 min-w-0">
      {children}
    </div>
  );
}
