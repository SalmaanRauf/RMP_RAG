from dotenv import load_dotenv
load_dotenv('.env.local')
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
import os
import json

# get our api keys from .env file
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# try to make a new pinecone index (if it doesn't exist already)
try:
    pc.create_index(
        name="course-advisor",
        dimension=1536, # openai embeddings are 1536 dims
        metric="cosine", # cosine similarity is good for text
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    print("Index created successfully")
except Exception as e:
    print(f"Index may already exist: {e}")

# load all our course data from json
with open("courses.json", "r") as f:
    data = json.load(f)

processed_data = []
client = OpenAI()

# loop through each course and create embeddings
for course in data["courses"]:
    # make a text blob with all the course info
    course_text = f"""
    Course: {course['code']} - {course['title']}
    Units: {course['units']}
    Year: {course['year']}
    Category: {course['category']}
    Description: {course['description']}
    Prerequisites: {', '.join(course['prerequisites']) if course['prerequisites'] else 'None'}
    Semester: {course['semester']}
    """
    
    # get embedding from openai
    response = client.embeddings.create(
        input=course_text, 
        model="text-embedding-3-small" # cheaper model is fine for this
    )
    embedding = response.data[0].embedding
    
    # save the embedding and all the course metadata
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

# upload everything to pinecone
index = pc.Index("course-advisor")
upsert_response = index.upsert(
    vectors=processed_data,
    namespace="courses",
)
print(f"Upserted count: {upsert_response['upserted_count']}")

# check if it worked
print(index.describe_index_stats()) 