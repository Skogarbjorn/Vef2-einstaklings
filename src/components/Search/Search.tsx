"use client";

import { fetchShows } from "../../lib/api.ts";
import { useState } from "react";
import Link from "next/link";

export default function Search() {
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

  return (
    <div>
      <input
        type="search"
        placeholder="Search..."
        aria-label="Search through site content"
        list="search-suggestions"
        onChange={updateSuggestions}
      />
      {showDropdown && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
          {suggestions &&
            suggestions.length > 0 &&
            suggestions.map((item, index) => (
              <li key={index}>
                <Link
                  href={`show/${item.id}`}
                  className="block p-2 hover:bg-gray-100"
                >
                  {item.title}
                </Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
