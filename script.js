let colorA, colorB;
let results = [];

document.getElementById("continue").addEventListener("click", function() {
    // Fade to black
    document.body.style.backgroundColor = "black";
    document.getElementById("content").style.display = "none";
    document.getElementById("waitingMessage").style.display = "block"; // Show waiting message
    let counter = 8;
    document.getElementById("countdown").textContent = counter;
    const interval = setInterval(() => {
        counter--;
        document.getElementById("countdown").textContent = counter;
        if (counter < 0) {
            clearInterval(interval);
        }
    }, 1000);

    setTimeout(function() {
        document.getElementById("waitingMessage").style.display = "none"; // Hide waiting message
        const random = Math.random();
        const chosenColor = random > 0.5 ? colorA : colorB;
        document.getElementById("testColor").querySelector(".color").style.backgroundColor = `hsl(${chosenColor[0]}, ${chosenColor[1]}%, ${chosenColor[2]}%)`;
        document.getElementById("choiceScreen").style.display = "block";
        document.body.style.backgroundColor = "#111"; // change background to dark grey

        // Store the chosenColor directly, not just its visual representation
        if (random > 0.5) {
            document.getElementById("testColor").chosenColor = colorA;
        } else {
            document.getElementById("testColor").chosenColor = colorB;
        }
    }, 8000);
});

document.getElementById("chooseA").addEventListener("click", function() {
    checkChoice("a");
});

document.getElementById("chooseB").addEventListener("click", function() {
    checkChoice("b");
});

document.getElementById("download").addEventListener("click", function() {
    let csv = "A Hue, A Saturation, A Value, B Hue, B Saturation, B Value, Choice, Is Correct\n";
    results.forEach(res => {
        csv += `${res.goodHue}, ${res.goodSaturation}, ${res.goodValue}, ${res.badHue}, ${res.badSaturation}, ${res.badValue}, ${res.choice}, ${res.isCorrect}\n`;
    });
    const blob = new Blob([csv], {type: "text/csv"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "results.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

function randomHsv() {
    return [Math.floor(Math.random() * 360), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)];
}

function setColors() {
    colorA = randomHsv();
    colorB = randomHsv();
    document.getElementById("a").querySelector(".color").style.backgroundColor = `hsl(${colorA[0]}, ${colorA[1]}%, ${colorA[2]}%)`;
    document.getElementById("b").querySelector(".color").style.backgroundColor = `hsl(${colorB[0]}, ${colorB[1]}%, ${colorB[2]}%)`;
}

function checkChoice(choice) {
    const testColor = document.getElementById("testColor").chosenColor;
    const isCorrect = (choice === "a" && arraysEqual(colorA, testColor)) || 
                      (choice === "b" && arraysEqual(colorB, testColor));

    results.push({
        goodHue: colorA[0],
        goodSaturation: colorA[1],
        goodValue: colorA[2],
        badHue: colorB[0],
        badSaturation: colorB[1],
        badValue: colorB[2],
        choice: choice,
        isCorrect: isCorrect
    });

    // Reset to main screen
    document.getElementById("choiceScreen").style.display = "none";
    document.getElementById("content").style.display = "block";  // make the main content visible again
    setColors();
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// Initialize
setColors();
