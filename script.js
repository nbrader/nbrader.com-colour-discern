let goodColor, badColor;
let results = [];

document.getElementById("continue").addEventListener("click", function() {
    // Fade to black
    document.body.style.backgroundColor = "black";
    document.getElementById("content").style.display = "none";

    setTimeout(function() {
        const random = Math.random();
        const chosenColor = random > 0.5 ? goodColor : badColor;
        document.getElementById("testColor").querySelector(".color").style.backgroundColor = `hsl(${chosenColor[0]}, ${chosenColor[1]}%, ${chosenColor[2]}%)`;

        document.getElementById("choiceScreen").style.display = "block";
        document.body.style.backgroundColor = "#111"; // change background to dark grey
    }, 8000);
});

document.getElementById("chooseGood").addEventListener("click", function() {
    checkChoice("good");
});

document.getElementById("chooseBad").addEventListener("click", function() {
    checkChoice("bad");
});

document.getElementById("download").addEventListener("click", function() {
    let csv = "Good Hue, Good Saturation, Good Value, Bad Hue, Bad Saturation, Bad Value, Choice\n";
    results.forEach(res => {
        csv += `${res.goodHue}, ${res.goodSaturation}, ${res.goodValue}, ${res.badHue}, ${res.badSaturation}, ${res.badValue}, ${res.choice}\n`;
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
    goodColor = randomHsv();
    badColor = randomHsv();
    document.getElementById("good").querySelector(".color").style.backgroundColor = `hsl(${goodColor[0]}, ${goodColor[1]}%, ${goodColor[2]}%)`;
    document.getElementById("bad").querySelector(".color").style.backgroundColor = `hsl(${badColor[0]}, ${badColor[1]}%, ${badColor[2]}%)`;
}

function checkChoice(choice) {
    const isCorrect = (choice === "good" && arraysEqual(goodColor, testColor)) || (choice === "bad" && arraysEqual(badColor, testColor));
    
    results.push({
        goodHue: goodColor[0],
        goodSaturation: goodColor[1],
        goodValue: goodColor[2],
        badHue: badColor[0],
        badSaturation: badColor[1],
        badValue: badColor[2],
        choice: choice
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
