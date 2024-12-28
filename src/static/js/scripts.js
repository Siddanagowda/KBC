document.addEventListener('DOMContentLoaded', function() {
    let currentQuestionIndex = 0;
    let money = 0;

    function loadQuestion() {
        fetch('/')
            .then(response => response.json())
            .then(data => {
                document.getElementById('question').innerText = data.question;
                const options = document.querySelectorAll('.option');
                for (let i = 0; i < options.length; i++) {
                    options[i].innerText = `${i + 1}. ${data.options[i]}`;
                }
                correctOption = data.correct_option;
            });
    }

    window.selectOption = function(optionIndex) {
        const selectedAnswer = optionIndex;
        fetch('/api/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question_index: currentQuestionIndex,
                selected_answer: selectedAnswer,
                correct_option: correctOption
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'correct') {
                money = data.money;
                document.getElementById('money').innerText = money;
                currentQuestionIndex++;
                loadQuestion();
            } else {
                document.getElementById('question-container').innerHTML = `<h2>Incorrect answer. Game over. You won ${money}.</h2>`;
                document.getElementById('score').innerHTML += `<button onclick="restartGame()">Restart Game</button>`;
            }
        });
    };

    window.restartGame = function() {
        fetch('/api/restart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            money = data.money;
            currentQuestionIndex = 0;
            document.getElementById('money').innerText = money;
            document.getElementById('question-container').innerHTML = `
                <h2 id="question"></h2>
                <div id="options">
                    <button class="option" onclick="selectOption(1)">1.</button>
                    <button class="option" onclick="selectOption(2)">2.</button>
                    <button class="option" onclick="selectOption(3)">3.</button>
                    <button class="option" onclick="selectOption(4)">4.</button>
                </div>
            `;
            document.getElementById('score').innerHTML = `<h3>Your Money: <span id="money">0</span></h3>`;
            loadQuestion();
        });
    };

    loadQuestion();
});