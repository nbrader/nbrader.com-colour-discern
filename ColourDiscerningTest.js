let colorA, colorB;
let results = [];
let currentName, currentDeviation;

document.getElementById("start").addEventListener("click", function() {
    currentName = document.getElementById("name").value;
    if (!currentName) {
        alert("Please enter your name.");
        return;
    }

    currentDeviation = document.getElementById("deviation").value;

    // Disable name and deviation inputs
    document.getElementById("name").disabled = true;
    document.getElementById("deviation").disabled = true;

    // Hide the instructions
    document.getElementById("instructions").style.display = "none";
    
    // Show the content
    document.getElementById("content").style.display = "block";
    setColors();
});

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

// Three.js setup
let scene, camera, renderer;

function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("resultsCanvas").appendChild(renderer.domElement);

    // Add controls to allow the cube to be rotated
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
}

// Helper function: Convert HSV to RGB
function hsvToRgb(h, s, v) {
    let r, g, b;
    let i;
    let f, p, q, t;

    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    s /= 100;
    v /= 100;

    if(s == 0) {
        r = g = b = v;
        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }

    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        default: // case 5:
            r = v;
            g = p;
            b = q;
    }

    return new THREE.Color(r, g, b);
}

function visualizeResults() {
    const incorrectResults = results.filter(r => !r.isCorrect);
    
    // Clear previous lines in the scene
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }

    // Add lines for every incorrect result
    incorrectResults.forEach(res => {
        const geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(res.aHue, res.aSaturation, res.aValue));
        geometry.vertices.push(new THREE.Vector3(res.bHue, res.bSaturation, res.bValue));
        const material = new THREE.LineBasicMaterial({color: 0xff0000});
        const line = new THREE.Line(geometry, material);
        scene.add(line);
    });

    // Create a 3D grid of dots with HSV colors
    const step = 10;
    for (let h = 0; h <= 360; h += step) {
        for (let s = 0; s <= 100; s += step) {
            for (let v = 0; v <= 100; v += step) {
                const dotGeometry = new THREE.Geometry();
                dotGeometry.vertices.push(new THREE.Vector3(h, s, v));
                
                const color = hsvToRgb(h, s, v);
                const dotMaterial = new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, color: color });
                
                const dot = new THREE.Points(dotGeometry, dotMaterial);
                scene.add(dot);
            }
        }
    }

    // Position the camera
    camera.position.z = 500;

    // Animation logic
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
}

document.getElementById("showResults").addEventListener("click", function() {
    document.getElementById("content").style.display = "none";
    document.getElementById("resultsCanvas").style.display = "block"; // Show the 3D visualization
    visualizeResults();
});

document.getElementById("download").addEventListener("click", function() {
    const name = document.getElementById("name").value;
    const deviation = document.getElementById("deviation").value;

    // Date formatting for filename
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');  // Months are 0-11 in JS
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}_${hour}-${minute}-${second}`;
    const filename = `ColorTest_${name}_Deviation${deviation}_${formattedDate}.csv`;

    let csv = `Name, Max Deviation, A Hue, A Saturation, A Value, B Hue, B Saturation, B Value, Choice, Is Correct\n`;
    results.forEach(res => {
        csv += `${name}, ${deviation}, ${res.aHue}, ${res.aSaturation}, ${res.aValue}, ${res.bHue}, ${res.bSaturation}, ${res.bValue}, ${res.choice}, ${res.isCorrect}\n`;
    });
    
    const blob = new Blob([csv], {type: "text/csv"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

document.getElementById("backToResults").addEventListener("click", function() {
    document.getElementById("resultsCanvas").style.display = "none";
    document.getElementById("content").style.display = "block";
});

function randomHsv() {
    return [Math.floor(Math.random() * 360), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)];
}

function setColors() {
    colorA = randomHsv();

    // Get the deviation from the input
    const deviationPercent = document.getElementById("deviation").value;

    // Calculate deviation for Hue
    let hueDeviation;
    do {
        hueDeviation = colorA[0] + ((Math.random() * 2 - 1) * deviationPercent/100 * 360);
    } while (hueDeviation < 0 || hueDeviation > 360);

    // Calculate deviation for Saturation
    let saturationDeviation;
    do {
        saturationDeviation = colorA[1] + ((Math.random() * 2 - 1) * deviationPercent/100 * 100);
    } while (saturationDeviation < 0 || saturationDeviation > 100);

    // Calculate deviation for Value
    let valueDeviation;
    do {
        valueDeviation = colorA[2] + ((Math.random() * 2 - 1) * deviationPercent/100 * 100);
    } while (valueDeviation < 0 || valueDeviation > 100);

    colorB = [Math.floor(hueDeviation), Math.floor(saturationDeviation), Math.floor(valueDeviation)];

    document.getElementById("a").querySelector(".color").style.backgroundColor = `hsl(${colorA[0]}, ${colorA[1]}%, ${colorA[2]}%)`;
    document.getElementById("b").querySelector(".color").style.backgroundColor = `hsl(${colorB[0]}, ${colorB[1]}%, ${colorB[2]}%)`;
}

function checkChoice(choice) {
    const testColor = document.getElementById("testColor").chosenColor;
    const isCorrect = (choice === "a" && arraysEqual(colorA, testColor)) || 
                      (choice === "b" && arraysEqual(colorB, testColor));

    results.push({
        aHue: colorA[0],
        aSaturation: colorA[1],
        aValue: colorA[2],
        bHue: colorB[0],
        bSaturation: colorB[1],
        bValue: colorB[2],
        choice: choice,
        isCorrect: isCorrect,
        name: currentName,
        deviation: currentDeviation
    });

    // Reset to main screen
    document.getElementById("choiceScreen").style.display = "none";
    document.getElementById("content").style.display = "block"; 
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
initThreeJS();
setColors();
