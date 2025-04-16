"use client";

import React, { useState } from "react";
import Search from "../components/Search/Search.tsx";
import { motion } from "motion/react";
import Header from "../components/Header/Header.tsx";

export default function Home() {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-4 shadow-xl justify-center align-center items-center bg-foreground w-[100vw] h-[100vh]">
      <div className="w-full z-10">
        <Header isSearch={false} />
      </div>
      <motion.div
        className="flex flex-col gap-4 justify-center align-center items-center bg-foreground w-[100vw] h-[100vh] z-0 pb-[15rem]"
        animate={{ y: focused ? -300 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <Search
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </motion.div>
    </div>
  );
}
