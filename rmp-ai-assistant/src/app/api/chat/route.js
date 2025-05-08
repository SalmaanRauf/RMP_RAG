import { NextResponse } from 'next/server'
import { Pinecone } from "@pinecone-database/pinecone"
import OpenAI from 'openai'
import { TextEncoder } from 'util'

// this tells the ai how to act as a course advisor
const systemPrompt = `
You are a helpful course advisor for computer science students. Your goal is to provide personalized course recommendations based on the student's major, interests, academic year, and semester. Use the course information in your knowledge base to suggest appropriate courses that align with their academic progression and interests.

When making recommendations:
1. Consider prerequisite requirements and course sequencing
2. Balance core requirements with electives based on student interests
3. Suggest appropriate course loads (typically 12-15 units per semester)
4. Highlight courses that match the student's stated interests or career goals
5. Provide brief descriptions of why each course is recommended

If asked about specific courses, provide details about content, difficulty level, and how they fit into the overall curriculum. Always be encouraging and supportive of students' academic journeys.
`

export async function POST(req) {
  try {
    // grab the chat history from the request
    const data = await req.json()

    // setup pinecone and openai - need these for the rag system
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const index = pinecone.Index('course-advisor');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // get the user's last message and make an embedding
    const userMessage = data[data.length - 1].content
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small', // smaller model = cheaper + faster
      input: userMessage,
    })
    const embedding = embeddingResponse.data[0].embedding

    // search pinecone for similar course vectors
    const queryResponse = await index.query({
      topK: 5, // just get top 5 matches
      includeMetadata: true, // need the actual course info
      vector: embedding,
      namespace: "courses",
    })

    // format the results into a nice text block for the ai
    let resultString = 'Here are the most relevant courses based on your query:\n\n'
    queryResponse.matches.forEach((match, index) => {
      const course = match.metadata;
      resultString += `Course ${index + 1}:
Code: ${course.code}
Title: ${course.title}
Units: ${course.units}
Year: ${course.year}
Category: ${course.category}
Description: ${course.description}
Prerequisites: ${course.prerequisites.length > 0 ? course.prerequisites.join(', ') : 'None'}
Semester: ${course.semester}
\n\n`
    })

    // combine the user's question with the course data
    const lastMessage = data[data.length - 1]
    const combinedMessage = `${lastMessage.content}\n\n${resultString}`
    const previousMessages = data.slice(0, data.length - 1)

    // ask gpt to respond based on the course data
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // using the good model for better answers
      messages: [
        { role: 'system', content: systemPrompt },
        ...previousMessages,
        { role: 'user', content: combinedMessage },
      ],
      stream: true, // stream the response for better ux
    })

    // setup the streaming response back to the frontend
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        // send each chunk as it comes in
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
    // oops something went wrong
    console.error('Error in course advisor API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}