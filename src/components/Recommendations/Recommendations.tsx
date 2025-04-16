"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IAnimeInfo } from "@consumet/extensions";
import Loading from "../Loading/Loading.tsx";

export default function Info({
  info,
}: {
  info: IAnimeInfo | null | undefined;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (info) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [info]);

  return (
    <div className="flex gap-16 bg-midtone p-10 rounded-[1rem]">
      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-2">
          {loading ? (
            <Loading width="30vw" height="5rem" />
          ) : (
            <h2 className="text-3xl text-white">Recommendations</h2>
          )}
        </div>
        <div className="flex flex-wrap gap-8 justify-between">
          {info?.recommendations?.map((recommendation, index) => (
            <div className="w-[45%] md:w-[28%] overflow-hidden relative" key={index}>
              <Link
                href={`/show/${recommendation.id}`}
                className="flex items-center p-8 justify-center absolute inset-0 w-full h-full bg-black/80 object-cover rounded-[1rem] opacity-0 hover:opacity-100 transition-all duration-200"
              >
                <p className="text-center">{recommendation.title}</p>
              </Link>
              <img
                src={recommendation.image}
                className="rounded-[1.5rem] object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
