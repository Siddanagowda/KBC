from flask import Flask, render_template, request, jsonify
from kbc import generate_mcq, levels, money

app = Flask(__name__)

@app.route('/')
def index():
    topic = "General Knowledge"  # You can change the topic as needed
    mcqs = generate_mcq(topic, num_questions=1)
    
    # Check if an error occurred
    if "An error occurred" in mcqs:
        return mcqs
    
    # Parse the generated MCQ
    lines = mcqs.split('\n')
    if len(lines) < 6:
        return f"An error occurred: The generated response does not have enough lines. Response: {mcqs}"
    
    question = lines[0].strip()
    options = [lines[1][3:].strip(), lines[2][3:].strip(), lines[3][3:].strip(), lines[4][3:].strip()]
    correct_option = lines[5].split(': ')[1].strip()
    
    return render_template('index.html', question=question, options=options, correct_option=correct_option, levels=levels)

@app.route('/api/answer', methods=['POST'])
def answer():
    data = request.json
    selected_answer = data['selected_answer']
    correct_option = data['correct_option']
    
    is_correct = selected_answer == correct_option
    
    if is_correct:
        global money
        money += levels[data['question_index']]
        return jsonify({'result': 'correct', 'money': money})
    else:
        return jsonify({'result': 'incorrect', 'money': money})

@app.route('/api/restart', methods=['POST'])
def restart():
    global money
    money = 0
    return jsonify({'result': 'restarted', 'money': money})

if __name__ == '__main__':
    app.run(debug=True)