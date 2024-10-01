// app/api/chat/route.js

import { NextResponse } from 'next/server'
import { Pinecone } from "@pinecone-database/pinecone"
import OpenAI from 'openai'

// Step 2: Define the system prompt
const systemPrompt = `
You are a Rate My Professor agent to help students find classes. You take in user questions and answer them.
For every user question, the top 3 professors that match the user question are returned.
Use them to answer the question if needed.
`

export async function POST(req) {
  try {
    // Step 3: Handle incoming POST request
    const data = await req.json()

    // Step 4: Initialize Pinecone and OpenAI
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const index = pinecone.Index('rmp-ai-assistant');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Step 5: Process the user's query and create an embedding
    const userMessage = data[data.length - 1].content
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: userMessage,
    })
    const embedding = embeddingResponse.data[0].embedding

    // Step 6: Query Pinecone for similar professor reviews
    const queryResponse = await index.query({
      topK: 5,
      includeMetadata: true,
      vector: embedding,
    })

    // Step 7: Format the Pinecone results
    let resultString = 'Here are the top matching professors based on your query:\n\n'
    queryResponse.matches.forEach((match, index) => {
      resultString += `Result ${index + 1}:
Professor: ${match.id}
Subject: ${match.metadata.subject}
Review: ${match.metadata.review}
Stars: ${match.metadata.stars} ⭐
\n\n`
    })

    // Step 8: Prepare the OpenAI request by combining user query with results
    const lastMessage = data[data.length - 1]
    const combinedMessage = `${lastMessage.content}\n\n${resultString}`
    const previousMessages = data.slice(0, data.length - 1)

    // Step 9: Send request to OpenAI for chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...previousMessages,
        { role: 'user', content: combinedMessage },
      ],
      stream: true,
    })

    // Step 10: Set up streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(encoder.encode(content))
          }
        }

        controller.close()
      },
    })

    return new NextResponse(stream)
  } catch (error) {
    console.error('Error in POST /api/chat/route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
