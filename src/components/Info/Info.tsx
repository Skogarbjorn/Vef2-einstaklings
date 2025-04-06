"use client";

import { useParams } from "next/navigation";
import React from "react";

export default function Info({ info }) {
  return (
    <div>
      <h2>{info.title}</h2>
      <img src={info.image} alt="image" />
      <p>{info.description}</p>
    </div>
  );
}
