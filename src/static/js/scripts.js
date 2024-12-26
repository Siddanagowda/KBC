document.addEventListener('DOMContentLoaded', function() {
    let currentQuestionIndex = 0;
    let money = 0;

    function loadQuestion() {
        const question = questions[currentQuestionIndex];
        document.getElementById('question').innerText = question[0];
        const options = document.querySelectorAll('.option');
        for (let i = 0; i < options.length; i++) {
            options[i].innerText = question[i + 1];
        }
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
                selected_answer: selectedAnswer
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'correct') {
                money += levels[currentQuestionIndex];
                document.getElementById('money').innerText = money;
                currentQuestionIndex++;
                if (currentQuestionIndex < questions.length) {
                    loadQuestion();
                } else {
                    alert('Congratulations! You have completed the game.');
                }
            } else {
                alert('Incorrect answer. Game over.');
            }
        });
    };

    loadQuestion();
});