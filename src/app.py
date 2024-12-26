from flask import Flask, render_template, request, jsonify
from kbc import question, levels, money

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', questions=question, levels=levels)

@app.route('/api/answer', methods=['POST'])
def answer():
    data = request.json
    question_index = data['question_index']
    selected_answer = data['selected_answer']
    
    correct_answer_index = question[question_index][5]
    is_correct = selected_answer == correct_answer_index
    
    if is_correct:
        global money
        money = levels[question_index]
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