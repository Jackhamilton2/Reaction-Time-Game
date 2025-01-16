let totalClicks = 0;
let perfectClicks = 0;
let penalties = 0;
let startTime = 0;
let totalAdjustedTime = 0;
let gameActive = false;
let level = 1;

const startButton = document.getElementById("start-game");
const gameArea = document.getElementById("game-area");
const endScreen = document.getElementById("end-screen");
const finalStats = document.getElementById("final-stats");
const restartButton = document.getElementById("restart-game");
const feedbackText = document.getElementById("feedback-text");
const levelDisplay = document.getElementById("level-display");
const initialsInput = document.getElementById("initials-input");
const saveScoreButton = document.getElementById("save-score");
const leaderboard = document.querySelector("#leaderboard ul");
const decorations = document.getElementById("decorations");

// Load Sound Files
const clickSound = new Audio("sounds/39562__the_bizniss__mouse-click.wav"); // Regular clicks
const perfectSound = new Audio("sounds/546083__stavsounds__correct1.wav"); // Perfect clicks
const penaltySound = new Audio("sounds/514159__edwardszakal__distorted-beep-incorrect.mp3"); // Penalties

startButton.addEventListener("click", startGame);
gameArea.addEventListener("click", handleMissClick);
restartButton.addEventListener("click", restartGame);
saveScoreButton.addEventListener("click", saveScore);

function startGame() {
    totalClicks = 0;
    perfectClicks = 0;
    penalties = 0;
    totalAdjustedTime = 0;
    level = 1;
    gameActive = true;
    startTime = Date.now();

    document.getElementById("title-screen").style.display = "none";
    decorations.style.display = "none";
    levelDisplay.style.display = "block";
    gameArea.style.display = "block";

    levelDisplay.textContent = `Level: ${level}`;
    spawnBall();
    updateTimer();
}

function updateTimer() {
    if (!gameActive) return;

    const elapsedTime = (Date.now() - startTime) / 1000;
    const adjustedTime = elapsedTime + penalties * 0.5 - perfectClicks * 0.25;
    totalAdjustedTime = Math.max(0, adjustedTime);
    levelDisplay.textContent = `Level: ${level} | Time: ${totalAdjustedTime.toFixed(2)}s`;

    requestAnimationFrame(updateTimer);
}

function spawnBall() {
    if (!gameActive) return;

    gameArea.innerHTML = "";
    const ballSize = level === 1 ? 70 : level === 2 ? 50 : 40;
    const ball = document.createElement("div");
    ball.className = "ball";
    ball.style.width = `${ballSize}px`;
    ball.style.height = `${ballSize}px`;

    const x = Math.random() * (gameArea.clientWidth - ballSize);
    const y = Math.random() * (gameArea.clientHeight - ballSize);
    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;

    // Dynamic gradient colors for the ball
    const color1 = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    const color2 = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    ball.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
    ball.style.boxShadow = `0 4px 8px rgba(0, 0, 0, 0.2), inset 0 0 10px ${color1}`;

    ball.addEventListener("click", () => handleBallClick(ball));
    gameArea.appendChild(ball);
}

function handleBallClick(ball) {
    const rect = ball.getBoundingClientRect();
    const ballCenterX = rect.left + rect.width / 2;
    const ballCenterY = rect.top + rect.height / 2;
    const clickX = event.clientX;
    const clickY = event.clientY;

    const distanceFromCenter = Math.sqrt(
        Math.pow(clickX - ballCenterX, 2) + Math.pow(clickY - ballCenterY, 2)
    );

    if (distanceFromCenter < 10) {
        perfectClicks++;
        perfectSound.play(); // Play perfect sound
        showFeedback("Perfect!", "green", "glow");
    } else {
        clickSound.play(); // Play normal click sound
        showFeedback("Good!", "blue");
    }

    ball.remove();
    totalClicks++;

    if (totalClicks >= 15) {
        endGame();
    } else if (totalClicks % 5 === 0) {
        level++;
        spawnBall();
    } else {
        spawnBall();
    }
}

function handleMissClick(event) {
    if (event.target.className === "ball") return;

    penalties++;
    penaltySound.play(); // Play penalty sound
    showFeedback("Missed!", "red", "shake");
}

function endGame() {
    gameActive = false;
    gameArea.style.display = "none";
    levelDisplay.style.display = "none";

    finalStats.innerHTML = `
        <p>Total Time: <strong>${totalAdjustedTime.toFixed(2)} seconds</strong></p>
        <p>Perfect Clicks: <strong>${perfectClicks}</strong></p>
        <p>Penalties: <strong>${penalties}</strong></p>
    `;
    endScreen.style.display = "flex";
    decorations.style.display = "block";
}

function saveScore() {
    const initials = initialsInput.value.trim().toUpperCase();
    if (!initials) return alert("Please enter your initials!");

    const newScore = { initials, time: totalAdjustedTime.toFixed(2) };
    const scores = JSON.parse(localStorage.getItem("scores") || "[]");
    scores.push(newScore);

    scores.sort((a, b) => a.time - b.time);
    const topScores = scores.slice(0, 5);
    localStorage.setItem("scores", JSON.stringify(topScores));

    displayLeaderboard(topScores);
}

function displayLeaderboard(scores) {
    leaderboard.innerHTML = scores
        .map((score) => `<li>${score.initials}: ${score.time} seconds</li>`)
        .join("");
}

function showFeedback(message, color, animation = "") {
    feedbackText.textContent = message;
    feedbackText.style.color = color;
    feedbackText.style.opacity = "1";

    if (animation === "glow") {
        feedbackText.classList.add("glow");
    } else if (animation === "shake") {
        document.body.classList.add("shake");
    }

    setTimeout(() => {
        feedbackText.style.opacity = "0";
        feedbackText.classList.remove("glow");
        document.body.classList.remove("shake");
    }, 1000);
}

function restartGame() {
    endScreen.style.display = "none";
    document.getElementById("title-screen").style.display = "flex";
    decorations.style.display = "block";
}
