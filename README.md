Rate My Professor AI Assistant

This project is an AI‑powered assistant for Rate My Professor. It lets users retrieve professor and course information with natural‑language questions.
Technologies Used

Next.js 14
React 18
TypeScript
Material‑UI (MUI)
Tailwind CSS
OpenAI API
Pinecone Vector Database
Python 3.12 +
Features

Chat‑based interface for querying professor and course data
AI‑powered answers (OpenAI language models)
Vector search via Pinecone for fast retrieval
Responsive layout for all screen sizes
Project Structure

The codebase is split into two parts.
Frontend (Next.js app)
• Main chat page: src/app/page.tsx
• Custom MUI theme: src/app/theme.ts
• Global styles: src/app/globals.css
Backend (Python, RAG setup)
• setup_rag.py – creates the Pinecone index and processes review data for Retrieval‑Augmented Generation (RAG)
Setup and Installation

Clone the repository and open the project folder.
Install frontend dependencies
npm install
Prepare the Python environment (Python 3.12+)
– Create and activate a virtual environment
– pip install -r requirements.txt
Create a .env file in the root folder and add
OPENAI_API_KEY=<your_openai_api_key>
PINECONE_API_KEY=<your_pinecone_api_key>
Build the Pinecone index
python setup_rag.py
Start the development server
npm run dev
Usage

With the server running, open the chat page in your browser and ask about professors, courses, or ratings. The assistant returns answers sourced from the Pinecone‑indexed data.
Key Components

Chat interface (src/app/page.tsx)
• Message display area
• Input field
• Send button
Theme configuration is in src/app/theme.ts.
RAG Setup

setup_rag.py builds or updates the Pinecone index from review data, enabling efficient vector search.
Contributing

Fork the repository.
Create a new branch for your feature.
Commit and push your changes.
Open a pull request.