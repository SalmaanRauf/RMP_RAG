from dotenv import load_dotenv
load_dotenv('.env.local')
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
import os
import json

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Create a Pinecone index
try:
    pc.create_index(
        name="course-advisor",
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    print("Index created successfully")
except Exception as e:
    print(f"Index may already exist: {e}")

# Load the course data
with open("courses.json", "r") as f:
    data = json.load(f)

processed_data = []
client = OpenAI()

# Create embeddings for each course
for course in data["courses"]:
    # Create a rich text representation of the course for embedding
    course_text = f"""
    Course: {course['code']} - {course['title']}
    Units: {course['units']}
    Year: {course['year']}
    Category: {course['category']}
    Description: {course['description']}
    Prerequisites: {', '.join(course['prerequisites']) if course['prerequisites'] else 'None'}
    Semester: {course['semester']}
    """
    
    # Generate embedding
    response = client.embeddings.create(
        input=course_text, 
        model="text-embedding-3-small"
    )
    embedding = response.data[0].embedding
    
    # Prepare metadata
    processed_data.append(
        {
            "values": embedding,
            "id": course["code"],
            "metadata": {
                "code": course["code"],
                "title": course["title"],
                "units": course["units"],
                "year": course["year"],
                "category": course["category"],
                "description": course["description"],
                "prerequisites": course["prerequisites"],
                "semester": course["semester"]
            }
        }
    )
    print(f"Processed {course['code']}")

# Insert the embeddings into the Pinecone index
index = pc.Index("course-advisor")
upsert_response = index.upsert(
    vectors=processed_data,
    namespace="courses",
)
print(f"Upserted count: {upsert_response['upserted_count']}")

# Print index statistics
print(index.describe_index_stats()) 