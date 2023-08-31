import { Document, TextSplitter } from "@pinecone-database/doc-splitter";
import logger from "./logger.ts";

export class TokenLimitSplitter extends TextSplitter {
  private maxTokens: number;

  constructor(maxTokens: number) {
    super();
    this.maxTokens = maxTokens;
    logger.info(`TokenLimitSplitter initialized with maxTokens: ${maxTokens}`);
  }

  async splitText(text: string, overlap: number = 0): Promise<string[]> {
    try {
      let tokens: string[] = text.split(' '); // Assuming words are separated by spaces
      let chunks: string[] = [];
      let chunk: string[] = [];

      logger.info(`Starting to split text into chunks. Total tokens in text: ${tokens.length}`);

      for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (chunk.length + token.length > this.maxTokens) {
          chunks.push(chunk.join(' '));
          chunk = tokens.slice(i - overlap, i + 1); // Start the new chunk with an overlap
          logger.info(`Chunk exceeded maxTokens. New chunk started with token: ${token}`);
        } else {
          chunk.push(token);
        }
      }
      chunks.push(chunk.join(' ')); // Add the last chunk
      logger.info(`Final chunk added. Total chunks: ${chunks.length}`);

      return chunks;
    } catch (error: any) {
      logger.error(`Error in splitText: ${error.message}. Text: ${text}`);
      throw error; // Re-throw the error after logging it
    }
  }
}