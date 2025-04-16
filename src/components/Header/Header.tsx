import React from "react";
import Search from "../Search/Search.tsx";
import Link from "next/link";
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwitcher.tsx";

export default function Header({ isSearch = true }: { isSearch: boolean }) {
  return (
    <div className="w-full h-[10rem] bg-foreground/80 flex flex-row items-center px-10 justify-between">
      <div className="flex gap-10">
        <div className="bg-accent rounded-[1rem] flex">
          <Link href="/" className="w-full h-full flex-1 p-10" />
        </div>
        {isSearch && (
          <div className="flex items-center min-w-sm">
            <Search />
          </div>
        )}
      </div>
      <div className="flex gap-10 items-center">
        <ThemeSwitcher />
      </div>
    </div>
  );
}
