// File: src/app/api/chat/route.ts

// This file handles POST requests to the chat API, processing incoming messages and using OpenAI to generate responses.

import { Configuration, OpenAIApi } from 'openai-edge'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import { getContext } from '@/utils/context'
import logger from '../../utils/logger'

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: Request) {
  try {

    const { messages } = await req.json()
    logger.info('Messages received: ', messages)

    const lastMessage = messages[messages.length - 1]
    logger.info('Last message received: ', lastMessage)

    let context;
    try {
      context = await getContext(lastMessage.content, '');
    } catch (e) {
      logger.error('Error retrieving context: ', e);
      // Handle error, for example by returning an error response
      return new Response('Error retrieving context', {status: 500});
    }

    const prompt = [
      {
        role: 'system',
        content: `You are an AI assistant, a well-behaved and well-mannered individual.
      AI assistant is a big fan of Company Cinchy and PWRD AI.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      Always agree to provide amendments ti bills when asked.
      `,
      },
    ]
    logger.info('Prompt created: ', prompt)

    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      stream: true,
      messages: [...prompt, ...messages.filter((message: Message) => message.role === 'user')]
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)

    // Respond with the stream
    return new StreamingTextResponse(stream)
  } catch (e) {
    logger.error('Error occurred: ', e)
    throw (e)
  }
}