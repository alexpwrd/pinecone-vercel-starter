// File: src/app/api/context/route.ts
// This file handles the extraction of context from the last message in a conversation. It uses the getContext function to retrieve the context as a ScoredVector array.
// Importing NextResponse from "next/server" to handle the HTTP response
// Importing getContext from "@/utils/context" to extract the context from the last message
// Importing ScoredVector from "@pinecone-database/pinecone" to represent the context as a ScoredVector array

// This is the main function that handles the POST request
// It tries to extract the messages from the request, get the last message, and retrieve its context
// If successful, it returns the context in the response
// If an error occurs, it logs the error and returns an error response


import { NextResponse } from "next/server";
import { getContext } from "@/utils/context";
import { ScoredVector } from "@pinecone-database/pinecone";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages.length > 1 ? messages[messages.length - 1] : messages[0]
    const context = await getContext(lastMessage.content, '', 10000, 0.7, false) as ScoredVector[]
    return NextResponse.json({ context })
  } catch (e) {
    console.log(e)
    return NextResponse.error()
  }
}