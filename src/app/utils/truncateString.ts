// File Path: pinecone-vercel-starter/src/app/utils/truncateString.ts
// This file contains a utility function for truncating a string by a specified number of bytes.
// The function `truncateStringByBytes` takes a string and a number of bytes as input.
// It creates a new TextEncoder, encodes the input string, slices the encoded string up to the specified number of bytes,
// decodes the sliced string using a new TextDecoder with "utf-8" encoding, and returns the result.

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};