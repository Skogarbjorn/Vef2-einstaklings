import { fetchState } from "../helpers.ts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const req_json = await request.json();
  const result = req_json.result;
  const currentResult = req_json.currentResult;

  const state = await fetchState(result, currentResult);
  return NextResponse.json(
    { success: true, state },
    {
      status: 200,
    },
  );
}
