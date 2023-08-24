import { OpenAIApi, Configuration } from "openai-edge";
import { delay } from 'bluebird';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export async function getEmbeddings(input: string) {

  let retries = 5;
  while (retries > 0) {
    try {
      const response = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: input.replace(/\n/g, ' ')
      })

      const result = await response.json();

      return result.data[0].embedding as number[]

    } catch (e) {
      if (e.message.includes('rate limit')) {
        console.log('Rate limit hit, retrying...'); // Log the rate limit error
        await delay(Math.pow(2, 5 - retries) * 1000); // Exponential backoff
        retries--;
      } else {
        console.log("Error calling OpenAI embedding API: ", e);
        throw new Error(`Error calling OpenAI embedding API: ${e}`);
      }
    }
  }
  throw new Error('Rate limit exceeded');
}