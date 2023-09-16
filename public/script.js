function randomHsvColor() {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 100);
    const v = Math.floor(Math.random() * 100);
    return `hsl(${h}, ${s}%, ${v}%)`;
}

function startGame() {
    const color1 = randomHsvColor();
    const color2 = randomHsvColor();
    const body = document.getElementById('body');

    setTimeout(() => {
        body.style.backgroundColor = color1; // You can modify this to randomly pick color1 or color2
        const userResponse = prompt("Is this color 'Good' or 'Bad'?");
        
        // Record the results
        fetch('/record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                color1,
                color2,
                correctAnswer: 'Good', // You can modify this according to your logic
                userResponse
            })
        });
        
        body.style.backgroundColor = 'black';
    }, 8000);
}