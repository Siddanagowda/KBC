let currentMoney = 0;
const moneyLevels = [1000, 2000, 3000, 5000, 10000, 20000, 40000, 80000, 160000, 320000, 640000, 1250000, 2500000, 5000000, 10000000];
let currentLevel = 0;

function selectOption(optionNumber) {
    const options = ['A', 'B', 'C', 'D'];
    const selectedAnswer = options[optionNumber - 1];
    
    fetch('/api/answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedAnswer, correctOption })
    })
    .then(response => response.json())
    .then(data => {
        const buttons = document.querySelectorAll('.option');
        buttons.forEach(button => button.disabled = true);
        
        if (data.result === 'correct') {
            currentMoney = moneyLevels[currentLevel];
            document.getElementById('money').textContent = currentMoney.toLocaleString();
            currentLevel++;
            
            setTimeout(() => {
                alert('Correct! You won ₹' + currentMoney);
                if (currentLevel < moneyLevels.length) {
                    location.reload();
                } else {
                    alert('Congratulations! You\'ve won the game!');
                    restartGame();
                }
            }, 1000);
        } else {
            setTimeout(() => {
                alert('Sorry, that\'s incorrect. Game Over! You won ₹' + currentMoney);
                restartGame();
            }, 1000);
        }
    });
}

function restartGame() {
    fetch('/api/restart', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        currentMoney = 0;
        currentLevel = 0;
        location.reload();
    });
}