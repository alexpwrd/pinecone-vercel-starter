/**
 * File: pinecone-vercel-starter/src/app/utils/embeddings.ts
 * 
 * This file contains utility functions for interacting with the OpenAI API to generate embeddings.
 * It includes the function `getEmbeddings` which takes an input string, calls the OpenAI API to generate embeddings,
 * and returns the embeddings as an array of numbers. It handles rate limit errors by implementing an exponential backoff strategy.
 */

import { OpenAIApi, Configuration } from "openai-edge";
import { delay } from 'bluebird';
import logger from './logger.ts';
import Queue from 'promise-queue';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

// Initialize a new queue with a maximum of 58 concurrent requests
const queue = new Queue(50, Infinity);

export async function getEmbeddings(input: string) {
  let retries = 5;
  let successfulCalls = 0;
  let failedCalls = 0;

  while (retries > 0) {
    try {
      // Add the request to the queue
      const result = await queue.add(() => openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: input.replace(/\n/g, ' ')
      }).then(response => response.json()));

      successfulCalls++;
      await delay(1000); // Pause for 0.17 seconds
      return result.data[0].embedding as number[];

    } catch (e) {
      failedCalls++;
      if (e.name === 'ConnectTimeoutError' || e.message.includes('rate limit')) {
        await delay(Math.pow(2, 5 - retries) * 1000); // Exponential backoff
        retries--;
      } else {
        throw new Error(`Error calling OpenAI embedding API: ${e}`);
      }
    }
  }

  logger.info(`Successful calls to OpenAI embedding API: ${successfulCalls}`);
  logger.info(`Failed calls to OpenAI embedding API: ${failedCalls}`);

  if (failedCalls > 0) {
    logger.error('Error occurred while calling OpenAI embedding API');
    throw new Error('Error occurred while calling OpenAI embedding API');
  }
}