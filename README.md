**Rate My Professor AI Assistant
**

This project is an AI-powered assistant for Rate My Professor, designed to help users retrieve information about professors and courses through natural language queries.

Technologies Used
Next.js 14
React 18
TypeScript
Material-UI (MUI)
Tailwind CSS
OpenAI API
Pinecone Vector Database
Python 3.12+
Features
Chat-based interface for querying professor and course information
AI-powered responses leveraging OpenAI's language models
Vector search capabilities using Pinecone for efficient information retrieval
Responsive design compatible with various screen sizes
Project Structure
The project is divided into two main parts:

Frontend (Next.js Application)

Main chat interface: src/app/page.tsx
Custom theme configuration: src/app/theme.ts
Global styles: src/app/globals.css
Backend (Python Scripts for Data Processing and RAG Setup)

setup_rag.py: Script to create Pinecone index and process review data for Retrieval-Augmented Generation (RAG).
Setup and Installation
Clone the Repository

Clone the repository
Navigate to the repository directory
Install Frontend Dependencies

Run npm install
Set Up the Python Environment for the Backend

Ensure you have Python 3.12+ installed.
Set up your Python virtual environment:
Create a virtual environment
Activate it
Install dependencies from requirements.txt
Set Up Environment Variables

Create a .env file in the root directory.
Add the following variables:
OPENAI_API_KEY=<your_openai_api_key>
PINECONE_API_KEY=<your_pinecone_api_key>
Run the RAG Setup Script

Run the script to set up the Pinecone index.
Start the Development Server

Run npm run dev
Usage
Once the application is running, users can interact with the AI assistant through the chat interface. They can ask questions related to professors, courses, and ratings, and the assistant will provide relevant information based on the Pinecone-indexed data.

Key Components
Chat Interface

The main chat interface is implemented in src/app/page.tsx. It includes:

- A message display area
- An input field for user queries
- A send button for submitting messages
- Theme Configuration

The application uses a custom Material-UI theme, which is defined in src/app/theme.ts.

**RAG Setup
**

The setup_rag.py script handles the creation of the Pinecone index and processes review data, enabling efficient vector search capabilities.

Contributing
Contributions to improve the AI assistant or add new features are welcome. To contribute:

Fork the repository.
Create a new branch for your feature.
Commit your changes.
Push to your branch.
Create a pull request.
License
This project is licensed under the MIT License.

