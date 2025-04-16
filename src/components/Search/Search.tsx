"use client";

import { Search as LucideSearch } from "lucide-react";
import { fetchShows } from "../../lib/api.ts";
import { useState } from "react";
import Link from "next/link";
import React from "react";
import { AnimatePresence, motion } from "motion/react";

export default function Search({ onFocus = null, onBlur = null }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<
    {
      id: string;
      title: string;
      url: string;
      image: string;
      duration: string;
      watchList: string;
      japaneseTitle: string;
      type: string;
      nsfw: boolean;
      sub: number;
      dub: number;
      episodes: number;
    }[]
  >([]);

  async function updateSuggestions(event: React.ChangeEvent) {
    const result = await fetchShows(event.target.value);
    if (typeof result === typeof Error) {
      console.log(result.message);
      setSuggestions([]);
    } else {
      setSuggestions(result);
    }

    setShowDropdown(suggestions && suggestions.length > 0);
  }

  function closeSuggestions() {
    setShowDropdown(false);
  }

  return (
    <div className="relative">
      <div className="flex items-center bg-off-white rounded-full px-4 py-2 w-[45vw] lg:w-[35vw] xl:w-[25vw]">
        <LucideSearch className="text-black w-4 h-4 mr-3" />
        <input
          type="search"
          placeholder="Search shows"
          aria-label="Search for shows"
          list="search-suggestions"
          onChange={updateSuggestions}
          onFocus={(e) => {
            if (onFocus) onFocus();
            updateSuggestions(e);
          }}
          onBlur={() => {
            setTimeout(() => {
              if (onBlur) onBlur();
              closeSuggestions();
            }, 200);
          }}
          className="bg-transparent outline-none w-full placeholder:text-gray text-black"
          onClick={updateSuggestions}
        />
      </div>
      <AnimatePresence>
        {showDropdown && (
          <>
            <div
              className="fixed inset-0 left-0 top-0 w-full h-full z-90"
              onClick={closeSuggestions}
            />
            <motion.ul
              className="absolute z-100 w-[45vw] lg:w-[35vw] xl:w-[25vw] mt-1 bg-midtone rounded-[1.5rem] shadow-lg overflow-y-auto my-4"
              layout
              initial={{ maxHeight: 0 }}
              animate={{ maxHeight: "53vh" }}
              exit={{ maxHeight: 0 }}
            >
              {suggestions &&
                suggestions.length > 0 &&
                suggestions.map((item, index) => (
                  <li
                    key={index}
                    className="flex flex-row gap-4 items-center p-2 hover:shadow-2xl hover:bg-foreground/80 transition-all duration-100 border-y-2 border-foreground"
                  >
                    <Link
                      href={`/show/${item.id}`}
                      className="block p-2 flex gap-4 items-center"
                    >
                      <img
                        src={item.image}
                        className="h-[6rem] w-[4rem] rounded-[1rem] object-cover"
                      />
                      {item.title}
                    </Link>
                  </li>
                ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
