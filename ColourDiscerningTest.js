let colorA, colorB;
let results = [];

let name, deviation;

document.getElementById("start").addEventListener("click", function() {
    const fileInput = document.getElementById("csvUpload");
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            const csvData = event.target.result;
            parseCSV(csvData);
            // After parsing, start the test
            startTest();
        };

        reader.readAsText(file);
    } else {
        startTest();
    }
});

function startTest() {
    name = document.getElementById("name").value;
    if (!name) {
        alert("Please enter your name.");
        return;
    }
    deviation = document.getElementById("deviation").value;

    // Disable name and deviation inputs
    document.getElementById("name").disabled = true;
    document.getElementById("deviation").disabled = true;

    // Hide the instructions
    document.getElementById("instructions").style.display = "none";
    
    // Show the memorising screen
    document.getElementById("content").style.display = "block";
    setColors();
}

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
        document.getElementById("testColor").querySelector(".color").style.backgroundColor = `rgb(${chosenColor[0]}, ${chosenColor[1]}, ${chosenColor[2]})`;
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
    
    // Set the orbit center to the middle of the RGB cube
    controls.target.set(127.5, 127.5, 127.5);

    // Reposition the camera
    camera.position.set(127.5, 127.5, 627.5); // Z is adjusted to pull the camera back
    camera.lookAt(127.5, 127.5, 127.5);
}

initThreeJS();

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
        geometry.vertices.push(new THREE.Vector3(res.aRed, res.aGreen, res.aBlue));
        geometry.vertices.push(new THREE.Vector3(res.bRed, res.bGreen, res.bBlue));
        const material = new THREE.LineBasicMaterial({color: 0xff0000});
        const line = new THREE.Line(geometry, material);
        scene.add(line);
    });

    // Create a 3D grid of dots with RGB colors
    const step = 25; // Adjust as needed, 25 gives a nice distribution for RGB
    for (let r = 0; r <= 255; r += step) {
        for (let g = 0; g <= 255; g += step) {
            for (let b = 0; b <= 255; b += step) {
                const dotGeometry = new THREE.Geometry();
                dotGeometry.vertices.push(new THREE.Vector3(r, g, b));
                
                const color = new THREE.Color(`rgb(${r}, ${g}, ${b})`);
                const dotMaterial = new THREE.PointsMaterial({ size: 3, sizeAttenuation: true, color: color });
                
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
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');  // Months are 0-11 in JS
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}_${hour}-${minute}-${second}`;
    const filename = `ColorTest_${name}_Deviation${deviation}_${formattedDate}.csv`;

    let csv = `Name,Max Deviation,A Red,A Green,A Blue,B Red,B Green,B Blue,Choice,Is Correct\n`;
    results.forEach(res => {
        csv += `${res.name},${res.deviation},${res.aRed},${res.aGreen},${res.aBlue},${res.bRed},${res.bGreen},${res.bBlue},${res.choice},${res.isCorrect}\n`;
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

function randomRgb() {
    return [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
}

function setColors() {
    colorA = randomRgb();

    // Use the RGB color space for the deviation calculations
    colorB = colorA.map(val => {
        let deviationValue;
        do {
            deviationValue = val + (Math.random() * 2 - 1) * deviation;
        } while (deviationValue < 0 || deviationValue > 255);
        return Math.floor(deviationValue);
    });

    document.getElementById("a").querySelector(".color").style.backgroundColor = `rgb(${colorA[0]}, ${colorA[1]}, ${colorA[2]})`;
    document.getElementById("b").querySelector(".color").style.backgroundColor = `rgb(${colorB[0]}, ${colorB[1]}, ${colorB[2]})`;
}



function checkChoice(choice) {
    const testColor = document.getElementById("testColor").chosenColor;
    const isCorrect = (choice === "a" && arraysEqual(colorA, testColor)) || 
                      (choice === "b" && arraysEqual(colorB, testColor));

    results.push({
        aRed: colorA[0],
        aGreen: colorA[1],
        aBlue: colorA[2],
        bRed: colorB[0],
        bGreen: colorB[1],
        bBlue: colorB[2],
        choice: choice,
        isCorrect: isCorrect,
        name: name, 
        deviation: deviation
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

function parseCSV(csvData) {
    const rows = csvData.split("\n");
    results = []; // Clear existing results

    if (rows.length > 1) {
        const cells = rows[1].split(",");
        // Use the first row values to set the initial name and deviation
        initialName = cells[0];
        initialDeviation = cells[1];
    }

    // Start from 1 to skip the header row
    for(let i = 1; i < rows.length; i++) {
        const cells = rows[i].split(",");
        if(cells.length > 1) { // Check to prevent processing empty lines
            results.push({
                aRed: parseInt(cells[2]),
                aGreen: parseInt(cells[3]),
                aBlue: parseInt(cells[4]),
                bRed: parseInt(cells[5]),
                bGreen: parseInt(cells[6]),
                bBlue: parseInt(cells[7]),
                choice: cells[8],
                isCorrect: cells[9] === "true",
                name: cells[0],
                deviation: cells[1]
            });
        }
    }
    visualizeResults(); // Visualize the loaded data
}

// Initialize
setColors();
