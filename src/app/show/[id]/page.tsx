"use client";

import React from "react";
import Play from "../../../components/Play/Play.tsx";
import Header from "../../../components/Header/Header.tsx";
import Footer from "../../../components/Footer/Footer.tsx";

export default function ShowPage() {
  return (
    <div className="flex flex-col gap-4 shadow-xl justify-center align-center items-center bg-background">
      <Header />
      <Play />
      <Footer />
    </div>
  );
}
