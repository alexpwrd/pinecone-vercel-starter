// File: src/app/api/clearIndex/route.ts
// This file handles the deletion of all items in the Pinecone index. It is used to clear the index when needed.

import { NextRequest, NextResponse } from "next/server";
import { getPineconeClient } from "@/utils/pinecone";

export async function POST(req: Request) {
  const pinecone = await getPineconeClient()
  const index = pinecone.Index(process.env.PINECONE_INDEX!)
  await index.delete1({
    deleteAll: true
  });
  return NextResponse.json({
    success: true
  })
}