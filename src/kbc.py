import openai

# Set your OpenAI API key
openai.api_key = "your-actual-api-key"

def generate_mcq(topic, num_questions=5):
    prompt = f"""
    Generate {num_questions} multiple-choice questions (MCQs) on the topic "{topic}".
    Each question should have 4 options (A, B, C, D) and indicate the correct option.
    Format the response like this:
    
    1. Question text
       A. Option 1
       B. Option 2
       C. Option 3
       D. Option 4
       Correct answer: X
    """
    
    try:
        # Generate the questions using OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.7,
        )
        
        # Extract and return the generated text
        generated_text = response.choices[0].message['content'].strip()
        return generated_text
    except openai.error.OpenAIError as e:
        return f"An error occurred: {e}"

levels = [1000, 2000, 3000, 4000, 5000, 10000, 20000, 30000, 40000, 50000, 100000, 500000, 10000000]
money = 0

# Example usage
if __name__ == "__main__":
    topic = "Photosynthesis"
    mcqs = generate_mcq(topic)
    print(mcqs)