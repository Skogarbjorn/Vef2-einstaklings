"use client";

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
    <div className="flex gap-16 bg-midtone p-10 rounded-[1.5rem]">
      {loading ? (
        <Loading width="20rem" height="30rem" />
      ) : (
        <div className="w-[50%] flex items-center justify-center">
          <img src={info.image} alt="image" className="rounded-[1rem] w-full" />
        </div>
      )}
      <div className="flex flex-col gap-16 pt-10 max-h-[30rem] w-[50%] justify-between">
        <div className="flex flex-col gap-2">
          {loading ? (
            <Loading width="20vw" height="5rem" />
          ) : (
            <h2 className="text-2xl sm:text-3xl text-white">{info.title}</h2>
          )}
          {loading ? (
            <Loading width="15vw" height="3rem" />
          ) : (
            <h2 className="text-xl sm:text-2xl text-off-white">
              {info.japaneseTitle}
            </h2>
          )}
        </div>
        {loading ? (
          <Loading width="20vw" height="100%" />
        ) : (
          <p className="flex-1 overflow-y-auto">{info?.description}</p>
        )}
      </div>
    </div>
  );
}
