let colorA, colorB;
let results = [];

let name, deviation;

let gridR, gridG, gridB;

function initGrids() {
    const gridSize = 256; // Assuming the grid spans the full color space
    const gridDivisions = 25; // Number of divisions in the grid, you can adjust this
    
    // Grid for Red (XY plane)
    gridR = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x444444);
    gridR.rotation.z = Math.PI / 2; // Rotate to align with YZ plane
    gridR.position.set(0, 255/2, 255/2); // Positioned at the B = 0 plane

    // Grid for Green (XZ plane)
    gridG = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x444444);
    gridG.position.set(255/2, 0, 255/2); // Positioned at the B = 0 plane

    // Grid for Blue (YZ plane)
    gridB = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x444444);
    gridB.rotation.x = Math.PI / 2; // Rotate to align with XZ plane
    gridB.position.set(255/2, 255/2, 0); // Positioned at the R = 0 plane
    
    // Apply defaults
    if (document.getElementById("gridToggle").checked) {
        scene.add(gridR);
        scene.add(gridG);
        scene.add(gridB);
    }
}

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
    
    const deviationPercent = document.getElementById("deviationPercent").value;
    deviation = (deviationPercent / 100) * 255;

    // Disable the deviation percent input
    document.getElementById("deviationPercent").disabled = true;

    // Disable name and deviation inputs
    document.getElementById("name").disabled = true;
    document.getElementById("deviationPercent").disabled = true;

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

        // Hiding the memorize screen and showing the choice screen
        document.getElementById('content').style.display = 'none';
        document.getElementById('choiceScreen').style.display = 'block';

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
    
    initGrids();
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

// Add event listeners to toggles for immediate updates.
document.getElementById("whiteLinesToggle").addEventListener("change", visualizeResults);
document.getElementById("darkBlueLinesToggle").addEventListener("change", visualizeResults);
document.getElementById("lightPrevColsToggle").addEventListener("change", visualizeResults);
document.getElementById("gridDotsToggle").addEventListener("change", visualizeResults);
document.getElementById("greyOutlinesToggle").addEventListener("change", visualizeResults);
document.getElementById("gridToggle").addEventListener('change', visualizeResults);
document.getElementById("normalizeToggle").addEventListener('change', visualizeResults);

function visualizeResults() {
    // Clear previous items in the scene
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }

    // Lines visualization
    results.forEach(res => {
        const geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(res.aRed, res.aGreen, res.aBlue));
        geometry.vertices.push(new THREE.Vector3(res.bRed, res.bGreen, res.bBlue));

        let material;
        if (document.getElementById("whiteLinesToggle").checked && !res.isCorrect) {
            material = new THREE.LineBasicMaterial({color: 0xffffff});
        } else if (document.getElementById("darkBlueLinesToggle").checked && res.isCorrect) {
            material = new THREE.LineBasicMaterial({color: 0x335555});
        } else {
            return; // Skip adding the line if none of the conditions match
        }
        
        const line = new THREE.Line(geometry, material);
        scene.add(line);
    });

    // Check if the light grey dots toggle is checked
    if (document.getElementById("lightPrevColsToggle").checked) {
        const alreadyDrawn = [];  // To keep track of drawn colors and avoid duplicates

        results.forEach(res => {
            const colorA = [res.aRed, res.aGreen, res.aBlue];
            const colorB = [res.bRed, res.bGreen, res.bBlue];

            // If colorA hasn't been drawn, draw it and mark as drawn
            if (!colorExistsInArray(colorA, alreadyDrawn)) {
                drawDot(colorA);
                alreadyDrawn.push(colorA);
            }
            
            // If colorB hasn't been drawn, draw it and mark as drawn
            if (!colorExistsInArray(colorB, alreadyDrawn)) {
                drawDot(colorB);
                alreadyDrawn.push(colorB);
            }
        });
    }
    
    function drawDot(color) {
        // Check if the grey outlines toggle is checked
        if (document.getElementById("greyOutlinesToggle").checked) {
            // Draw a larger light grey dot for the halo effect
            let dotGeometry = new THREE.Geometry();
            dotGeometry.vertices.push(new THREE.Vector3(color[0], color[1], color[2]));
            let dotMaterial = new THREE.PointsMaterial({ size: 5, sizeAttenuation: true, color: 0xd3d3d3 }); // light grey for the halo
            let dot = new THREE.Points(dotGeometry, dotMaterial);
            scene.add(dot);
        }

        // Draw the smaller dot with the actual color over it
        let dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push(new THREE.Vector3(color[0], color[1], color[2]));
        let dotMaterial = new THREE.PointsMaterial({ size: 3, sizeAttenuation: true, color: new THREE.Color(`rgb(${color[0]}, ${color[1]}, ${color[2]})`) });
        let dot = new THREE.Points(dotGeometry, dotMaterial);
        scene.add(dot);
    }

    // Standard RGB Colors Visualization
    if (document.getElementById("gridDotsToggle").checked) {
        const step = 25;
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
    }

    // Check grid toggle and add/remove grids accordingly
    if (document.getElementById("gridToggle").checked) {
        if (!scene.children.includes(gridR)) {
            scene.add(gridR);
        }
        if (!scene.children.includes(gridG)) {
            scene.add(gridG);
        }
        if (!scene.children.includes(gridB)) {
            scene.add(gridB);
        }
    } else {
        if (scene.children.includes(gridR)) {
            scene.remove(gridR);
        }
        if (scene.children.includes(gridG)) {
            scene.remove(gridG);
        }
        if (scene.children.includes(gridB)) {
            scene.remove(gridB);
        }
    }
    
    const histogramDiv = document.getElementById("histogram2D");
    while (histogramDiv.lastChild && histogramDiv.lastChild.tagName !== 'H3' && histogramDiv.lastChild.tagName !== 'LABEL' && histogramDiv.lastChild.tagName !== 'INPUT') {
        histogramDiv.removeChild(histogramDiv.lastChild);
    }
    
    // Prepare the data for the histogram
    const binSize = 10;
    const maxDistance = 441.673;  // Maximum distance in RGB space
    const numBins = Math.ceil(maxDistance / binSize);
    const histogramData = new Array(numBins).fill(0).map(() => ({ correct: 0, total: 0 }));

    results.forEach(res => {
        const distance = Math.sqrt(
            (res.aRed - res.bRed) ** 2 +
            (res.aGreen - res.bGreen) ** 2 +
            (res.aBlue - res.bBlue) ** 2
        );
        const bin = Math.floor(distance / binSize);
        histogramData[bin].total++;
        if (res.isCorrect) histogramData[bin].correct++;
    });
    
    // Desired maximum height for the histogram bars
    const maxHeight = 100;

    // Calculate combined heights for each bin
    const combinedHeights = histogramData.map(bin => bin.total);

    // Find the maximum combined height
    const maxCombinedHeight = Math.max(...combinedHeights);

    // Determine if we're normalizing the histogram
    const normalizeHistogram = document.getElementById("normalizeToggle").checked;

    // Adjust the scaling factor based on normalization requirement
    let scale;
    if (normalizeHistogram) {
        const nonZeroBins = histogramData.filter(bin => bin.total > 0);
        const maxNonZeroHeight = Math.max(...nonZeroBins.map(bin => bin.total));
        scale = maxHeight / maxNonZeroHeight;
    } else {
        scale = maxHeight / maxCombinedHeight;
    }
    
    // Create and position histogram bars
    const barWidth = 15; // Increased width

    // Later, when you set the xOffset for histogram bars:
    let xOffset = 0;

    // Find out the maximum bar height, to position squares right below
    let maxBarHeight = 0;

    histogramData.forEach((binData) => {
        let scaledHeight;
        if (document.getElementById("normalizeToggle").checked && binData.total > 0) {
            scaledHeight = maxHeight;
        } else {
            scaledHeight = binData.total * scale;
        }
        
        if (scaledHeight > maxBarHeight) {
            maxBarHeight = scaledHeight;
        }
    });
    
    let squareYOffset = -2 * barWidth;
    
    let squareSize = barWidth;  // Assuming the squares are of the same width as bars
    let yOffset = -20;  // This determines the vertical gap between histogram bars and squares.

    // Create rows for squares
    let whiteRow = document.createElement("div");
    whiteRow.style.position = "absolute";
    whiteRow.style.bottom = yOffset + "px";
    whiteRow.style.left = "0";

    let greyRow = document.createElement("div");
    greyRow.style.position = "absolute";
    greyRow.style.bottom = (yOffset - squareSize) + "px";  // Placed below the white squares
    greyRow.style.left = "0";

    document.getElementById("histogram2D").appendChild(whiteRow);
    document.getElementById("histogram2D").appendChild(greyRow);
    
    histogramData.forEach((binData, index) => {
        let scaledHeight;
        if (document.getElementById("normalizeToggle").checked && binData.total > 0) {
            scaledHeight = maxHeight; // Set each non-zero column's height to maxHeight
        } else {
            scaledHeight = combinedHeights[index] * scale;
        }
        
        const correctFraction = binData.correct / binData.total;
        const correctHeight = correctFraction * scaledHeight;
        const incorrectHeight = scaledHeight - correctHeight;

        const barWhite = document.createElement("div");
        barWhite.style.width = barWidth + "px";
        barWhite.style.height = incorrectHeight + "px";
        barWhite.style.backgroundColor = "#e6e6e6";  // Updated color
        barWhite.style.position = "absolute";
        barWhite.style.bottom = "0";
        barWhite.style.left = xOffset + "px";

        const barGrey = document.createElement("div");
        barGrey.style.width = barWidth + "px";
        barGrey.style.height = correctHeight + "px";
        barGrey.style.backgroundColor = "#333333";  // Updated color
        barGrey.style.position = "absolute";
        barGrey.style.bottom = incorrectHeight + "px"; 
        barGrey.style.left = xOffset + "px";
        
        const histogramDiv = document.getElementById("histogram2D");
        histogramDiv.style.height = (maxHeight + 3 * barWidth + 10) + "px"; // Adjusted to include 2 rows of squares and the gaps.
        
        document.getElementById("histogram2D").appendChild(barWhite);
        document.getElementById("histogram2D").appendChild(barGrey);
        
        xOffset += barWidth;
    });
    
    histogramData.forEach((binData, index) => {
        // Determine the grey value for the square
        let binCenter = binSize * (index + 0.5);
        let greyValue = 255 - Math.floor(255 * binCenter / maxDistance);

        // Create white square for top row
        const whiteSquare = document.createElement("div");
        whiteSquare.style.width = barWidth + "px";
        whiteSquare.style.height = barWidth + "px";
        whiteSquare.style.backgroundColor = "#FFFFFF";
        whiteSquare.style.position = "absolute";
        whiteSquare.style.bottom = squareYOffset + "px"; 
        whiteSquare.style.left = index * barWidth + "px";

        // Create grey square for bottom row
        const greySquare = document.createElement("div");
        greySquare.style.width = barWidth + "px";
        greySquare.style.height = barWidth + "px"; 
        greySquare.style.backgroundColor = `rgb(${greyValue},${greyValue},${greyValue})`;
        greySquare.style.position = "absolute";
        greySquare.style.bottom = (squareYOffset + barWidth) + "px";
        greySquare.style.left = index * barWidth + "px";

        document.getElementById("histogram2D").appendChild(whiteSquare);
        document.getElementById("histogram2D").appendChild(greySquare);
    });

    // Animation logic
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
}

// Function to check if a color exists in an array
function colorExistsInArray(color, colorArray) {
    return colorArray.some(existingColor => arraysEqual(existingColor, color));
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
    const filename = `ColorTest_${name}_DeviationPercent${deviationPercent.value}_${formattedDate}.csv`;

    let csv = `Name,Deviation Percent,A Red,A Green,A Blue,B Red,B Green,B Blue,Choice,Is Correct\n`;
    results.forEach(res => {
        csv += `${res.name},${res.deviationPercent},${res.aRed},${res.aGreen},${res.aBlue},${res.bRed},${res.bGreen},${res.bBlue},${res.choice},${res.isCorrect}\n`;
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
    colorA = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
    colorB = generateColorWithDeviation(colorA, deviation);

    document.getElementById("a").querySelector(".color").style.backgroundColor = `rgb(${colorA[0]}, ${colorA[1]}, ${colorA[2]})`;
    document.getElementById("b").querySelector(".color").style.backgroundColor = `rgb(${colorB[0]}, ${colorB[1]}, ${colorB[2]})`;
}

function generateColorWithDeviation(baseColor, actualDeviation) {
    return baseColor.map(channel => {
        let deviation = Math.floor(Math.random() * (actualDeviation + 1));
        let adjustedChannel = (Math.random() > 0.5) ? channel + deviation : channel - deviation;
        adjustedChannel = Math.max(0, Math.min(adjustedChannel, 255));
        return adjustedChannel;
    });
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
        deviationPercent: deviationPercent.value
    });
    
    extractMemorizedColors();

    // Reset to main screen
    document.getElementById("choiceScreen").style.display = "none";
    document.getElementById("content").style.display = "block"; 
    setColors();
}

let memorizedColors = [];

function extractMemorizedColors() {
    results.forEach(res => {
        const colorA = [res.aRed, res.aGreen, res.aBlue];
        const colorB = [res.bRed, res.bGreen, res.bBlue];

        // Add colors to memorizedColors if not already present
        if (!colorExistsInArray(colorA, memorizedColors)) {
            memorizedColors.push(colorA);
        }
        if (!colorExistsInArray(colorB, memorizedColors)) {
            memorizedColors.push(colorB);
        }
    });
}

// Helper function to check if a color already exists in an array
function colorExistsInArray(color, colorArray) {
    return colorArray.some(arrayColor => arraysEqual(color, arrayColor));
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
                isCorrect: cells[9].trim() === "true" || cells[9].trim() === "TRUE",
                name: cells[0],
                deviationPercent: parseFloat(cells[1])
            });
        }
    }
    
    visualizeResults(); // Visualize the loaded data
}

// Initialize
setColors();
