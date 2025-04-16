"use client";

import React, { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [color, setColor] = useState();

  useEffect(() => {
    setColor(document.documentElement.className);
  }, []);

  const toggleTheme = () => {
    setColor(color == "red" ? "green" : "red");
    setIsTransitioning(true);

    setTimeout(() => {
      changeTheme();

      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  };

  function changeTheme() {
    let curr = document.documentElement.className;
    switch (curr) {
      case "":
        curr = "red";
        break;
      case "red":
        curr = "";
        break;
      default:
        break;
    }

    document.documentElement.className = curr;
  }

  return (
    <>
      <div
        className={`
        fixed inset-0 z-60 pointer-events-none
        ${
          color === "red"
            ? "bg-[var(--red_accent)]"
            : "bg-[var(--green_accent)]"
        } transition-all duration-300 ease-in-out
        ${isTransitioning ? "translate-y-0" : "translate-y-[-100vh]"}
      `}
      />

      <div className="relative z-10">
        <div onClick={toggleTheme} className="bg-accent p-4 rounded-full"></div>
      </div>
    </>
  );
}
