const shapes = document.querySelectorAll(".shape");
const slots = document.querySelectorAll(".shape-slot");
const startBtn = document.getElementById("start-btn");
const gameContainer = document.getElementById("game-container");
const feedbackPopup = document.getElementById("feedback-popup");
const feedbackContent = document.getElementById("feedback-content");
const starRating = document.getElementById("star-rating");
const scoreValue = document.getElementById("score-value");
const scoreDisplay = document.getElementById("score-display");
const celebration = document.getElementById("celebration");
const playAgainBtn = document.getElementById("play-again-btn");
const tapSound = document.getElementById("tap-sound");
const bgMusic = document.getElementById("bg-music");
const cheerSound = document.getElementById("cheer-sound");
const cheersSound = document.getElementById("cheers-sound");
const cheerssSound = document.getElementById("cheerss-sound");
const cheersssSound = document.getElementById("cheersss-sound");
const cheerssssSound = document.getElementById("cheerssss-sound");
const sadSound = document.getElementById("sad-sound");
const backBtn = document.querySelector(".back-btn");
const scoreBtn = document.querySelector(".score-tracker-btn");
const tutorialContainer = document.getElementById("tutorial-container");
const skipTutorialBtn = document.getElementById("skip-tutorial-btn");
const tutorialCircle = document.getElementById("tutorial-circle");
const tutorialCursor = document.getElementById("tutorial-cursor");
const nameScreen = document.getElementById("name-screen");
const playerNameInput = document.getElementById("player-name-input");
const submitNameButton = document.getElementById("submit-name-button");
const nameFeedback = document.getElementById("name-feedback");
const settingsPanel = document.getElementById("settings-panel");
const aboutSection = document.getElementById("about-section");
const aboutBtn = document.getElementById("about-btn");
const exitBtn = document.getElementById("exit-btn");
const minimizeBtn = document.getElementById("minimize-btn");
const minimizeAboutBtn = document.getElementById("minimize-about-btn");
const titleDisplay = document.getElementById("title-display");

let correctMatches = 0;
let placedShapes = 0;
const maxScore = 5;
const totalShapes = 5;
const originalPositions = {};
let gameStarted = false;
let playerName = "Player";
let hasSeenTutorial = false;

tapSound.preload = 'auto';
bgMusic.volume = localStorage.getItem("musicVolume") ? localStorage.getItem("musicVolume") / 100 : 0.5;

shapes.forEach(shape => {
    originalPositions[shape.id] = shape.parentElement;
});

shapes.forEach(shape => {
    shape.addEventListener("dragstart", (event) => {
        if (!gameStarted || shape.classList.contains("disabled")) {
            event.preventDefault();
            return;
        }
        event.dataTransfer.setData("shape", shape.id);
        shape.style.opacity = "0.5";
        event.dataTransfer.setDragImage(shape, shape.clientWidth / 2, shape.clientHeight / 2);
    });

    shape.addEventListener("dragend", (event) => {
        if (!shape.classList.contains("matched") && !shape.classList.contains("disabled")) {
            shape.style.opacity = "1";
        }
    });
});

slots.forEach(slot => {
    slot.addEventListener("dragover", (event) => {
        if (!slot.classList.contains("disabled")) {
            event.preventDefault();
            slot.classList.add("drag-over");
        }
    });

    slot.addEventListener("dragleave", () => {
        slot.classList.remove("drag-over");
    });

    slot.addEventListener("drop", (event) => {
        event.preventDefault();
        slot.classList.remove("drag-over");
        let shapeId = event.dataTransfer.getData("shape");
        let shape = document.getElementById(shapeId);

        if (!shape || slot.classList.contains("disabled")) return;

        placedShapes++;

        if (slot.id === "slot-" + shapeId) {
            slot.appendChild(shape);
            shape.classList.add("matched");
            shape.draggable = false;
            shape.style.cursor = "default";
            shape.style.opacity = "1";
            correctMatches++;
            scoreValue.textContent = correctMatches;
            slot.classList.add("disabled");
        } else {
            shape.classList.add("disabled");
            shape.draggable = false;
            shape.style.cursor = "default";
            shape.style.opacity = "0.5";
            const correctSlot = document.getElementById("slot-" + shapeId);
            if (correctSlot && !correctSlot.classList.contains("disabled")) {
                let correctFeedbackSpan = correctSlot.querySelector(".slot-feedback");
                correctFeedbackSpan.textContent = "✗";
                correctFeedbackSpan.classList.add("show");
                correctSlot.classList.add("disabled");
            }
        }

        checkGameCompletion();
    });
});

submitNameButton.addEventListener("click", () => {
    playClickSound(() => {
        const name = playerNameInput.value.trim();
        if (name) {
            playerName = name;
            nameScreen.classList.add("hidden");
            nameFeedback.classList.remove("show");
            scoreDisplay.classList.remove("hidden");
            if (!hasSeenTutorial) {
                startTutorial();
            } else {
                titleDisplay.classList.remove("hidden");
                startBtn.classList.remove("hidden");
                backBtn.classList.remove("disabled");
                scoreBtn.classList.remove("disabled");
            }
        } else {
            nameFeedback.classList.add("show");
            playerNameInput.focus();
        }
    });
});

function startTutorial() {
    tutorialContainer.classList.remove("hidden");
    startBtn.classList.remove("hidden");
    backBtn.classList.add("disabled");
    scoreBtn.classList.add("disabled");

    const animateTutorial = () => {
        tutorialCircle.style.animation = "dragTutorial 2s ease-in-out forwards";
        tutorialCursor.style.animation = "cursorMove 2s ease-in-out forwards";
        setTimeout(() => {
            tutorialCircle.style.animation = "none";
            tutorialCursor.style.animation = "none";
            tutorialCircle.style.transform = "translateX(0)";
            tutorialCursor.style.transform = "translate(0, -10px)";
            setTimeout(animateTutorial, 500);
        }, 2000);
    };
    animateTutorial();
}

function skipTutorial() {
    playClickSound(() => {
        tutorialContainer.classList.add("hidden");
        startBtn.classList.add("hidden");
        gameContainer.classList.remove("hidden");
        gameStarted = true;
        speak("Match the shapes!");
        resetGame();
        shapes.forEach(shape => shape.setAttribute("draggable", "true"));
        backBtn.classList.add("disabled");
        scoreBtn.classList.add("disabled");
        titleDisplay.classList.add("hidden");
        hasSeenTutorial = true;
    });
}

skipTutorialBtn.addEventListener("click", skipTutorial);

startBtn.addEventListener("click", () => {
    playClickSound(() => {
        if (nameScreen.classList.contains("hidden") && !gameStarted) {
            if (tutorialContainer.classList.contains("hidden")) {
                gameContainer.classList.remove("hidden");
                gameStarted = true;
                speak("Match the shapes!");
                resetGame();
                shapes.forEach(shape => shape.setAttribute("draggable", "true"));
                startBtn.classList.add("hidden");
                backBtn.classList.add("disabled");
                scoreBtn.classList.add("disabled");
                titleDisplay.classList.add("hidden");
            } else {
                skipTutorial();
            }
        }
    });
});

backBtn.addEventListener("click", goBack);

document.querySelector(".settings-btn").addEventListener("click", () => {
    playClickSound(() => {
        openSettings();
    });
});

scoreBtn.addEventListener("click", () => {
    if (!scoreBtn.disabled && !gameStarted) {
        playClickSound(() => window.location.href = "scorer.html");
    }
});

aboutBtn.addEventListener("click", () => {
    playClickSound(() => {
        aboutSection.classList.toggle("hidden");
    });
});

exitBtn.addEventListener("click", () => {
    playClickSound(() => {
        if (window.electronAPI && window.electronAPI.closeApp) {
            window.electronAPI.closeApp();
        } else {
            window.close();
        }
    });
});

minimizeBtn.addEventListener("click", () => {
    playClickSound(() => {
        closeSettings();
    });
});

minimizeAboutBtn.addEventListener("click", () => {
    playClickSound(() => {
        aboutSection.classList.add("hidden");
    });
});

playAgainBtn.addEventListener("click", () => {
    playClickSound(() => {
        gameContainer.classList.add("hidden");
        feedbackPopup.classList.add("hidden");
        celebration.classList.add("hidden");
        startBtn.classList.remove("hidden");
        gameStarted = false;
        resetGame();
        backBtn.classList.remove("disabled");
        scoreBtn.classList.remove("disabled");
    });
});

function checkGameCompletion() {
    if (placedShapes === totalShapes) {
        endGame();
    }
}

function resetGame() {
    correctMatches = 0;
    placedShapes = 0;
    scoreValue.textContent = "0";
    feedbackPopup.classList.add("hidden");
    shapes.forEach(shape => {
        originalPositions[shape.id].appendChild(shape);
        shape.draggable = true;
        shape.style.cursor = "grab";
        shape.style.opacity = "1";
        shape.classList.remove("matched", "disabled");
    });
    slots.forEach(slot => {
        slot.classList.remove("disabled");
        let feedbackSpan = slot.querySelector(".slot-feedback");
        feedbackSpan.classList.remove("show");
        feedbackSpan.textContent = "";
    });
    shuffleElements("#placeholders", ".shape-slot");
    shuffleElements("#shapes", ".shape");
}

function displayStarRating(score) {
    starRating.innerHTML = "";
    const totalStars = 3;
    let filledStars;

    if (score === 5) {
        filledStars = 3;
    } else if (score === 3 || score === 4) {
        filledStars = 2;
    } else if (score === 1 || score === 2) {
        filledStars = 1;
    } else {
        filledStars = 0;
    }

    for (let i = 0; i < totalStars; i++) {
        const star = document.createElement("div");
        star.classList.add("star");
        if (i < filledStars) {
            star.classList.add("filled");
        }
        starRating.appendChild(star);
    }
}

function endGame() {
    gameStarted = false;
    feedbackPopup.classList.remove("hidden");
    if (correctMatches >= 3) {
        feedbackContent.textContent = `CONGRATULATIONS`;
        speak(`Congratulations! You got ${correctMatches} out of ${maxScore}`);
        celebration.classList.remove("hidden");
        triggerCelebration();
        triggerFireworks();
        playCheerSequence();
    } else {
        feedbackContent.textContent = `SORRY, TRY AGAIN`;
        speak(`Sorry, try again! You got ${correctMatches} out of ${maxScore}`);
        sadSound.play();
    }
    displayStarRating(correctMatches);
    saveScore();
}

function playCheerSequence() {
    const cheerSounds = [cheerSound, cheersSound, cheerssSound, cheersssSound, cheerssssSound];
    cheerSounds.forEach(sound => {
        sound.currentTime = 0;
        sound.play();
    });
}

function triggerCelebration() {
    celebration.innerHTML = "";
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.classList.add("celebration-particle");
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `0s`;
        celebration.appendChild(particle);
    }
}

function triggerFireworks() {
    const fireworkCount = 30;
    for (let i = 0; i < fireworkCount; i++) {
        const firework = document.createElement("div");
        firework.classList.add("firework");
        firework.style.left = `${Math.random() * 100}%`;
        firework.style.top = `${Math.random() * 100}%`;
        firework.style.background = `radial-gradient(circle, hsl(${Math.random() * 360}, 100%, 50%), transparent)`;
        firework.style.animationDelay = `${Math.random() * 0.5}s`;
        celebration.appendChild(firework);
    }
}

function shuffleElements(containerSelector, itemSelector) {
    let container = document.querySelector(containerSelector);
    let items = Array.from(container.querySelectorAll(itemSelector));
    items.sort(() => Math.random() - 0.5);
    items.forEach(item => container.appendChild(item));
}

function speak(text) {
    let voices = speechSynthesis.getVoices();
    let femaleVoice = voices.find(voice => voice.name.includes("Female") || voice.name.includes("Zira") || voice.name.includes("Samantha")) || voices[0];
    let speech = new SpeechSynthesisUtterance(text);
    speech.voice = femaleVoice;
    speech.rate = 1;
    speech.pitch = 1.2;
    speech.volume = 1;
    window.speechSynthesis.speak(speech);
}

window.speechSynthesis.onvoiceschanged = () => {};

function saveScore() {
    const scores = JSON.parse(localStorage.getItem("kidTasticScores")) || [];
    const scoreData = {
        playerName: playerName,
        game: "Match the Shape",
        score: correctMatches,
        date: new Date().toISOString()
    };
    scores.push(scoreData);
    localStorage.setItem("kidTasticScores", JSON.stringify(scores));
}

function openSettings() {
    settingsPanel.style.display = "flex";
    settingsPanel.classList.remove("hidden");
    aboutSection.classList.add("hidden");
}

function closeSettings() {
    settingsPanel.style.display = "none";
    settingsPanel.classList.add("hidden");
    aboutSection.classList.add("hidden");
}

function goBack() {
    if (!gameStarted) playClickSound(() => window.location.href = "shape.html");
}

function playClickSound(callback) {
    tapSound.currentTime = 0;
    tapSound.play();
    setTimeout(callback, 200);
}

function applySettings() {
    const musicVolume = localStorage.getItem("musicVolume") || 50;
    const sfxVolume = localStorage.getItem("sfxVolume") || 50;
    bgMusic.volume = musicVolume / 100;
    tapSound.volume = sfxVolume / 100;
    cheerSound.volume = sfxVolume / 100;
    cheersSound.volume = sfxVolume / 100;
    cheerssSound.volume = sfxVolume / 100;
    cheersssSound.volume = sfxVolume / 100;
    cheerssssSound.volume = sfxVolume / 100;
    sadSound.volume = sfxVolume / 100;
}

document.getElementById("music-volume").addEventListener("input", function() {
    const volume = this.value;
    localStorage.setItem("musicVolume", volume);
    bgMusic.volume = volume / 100;
});

document.getElementById("sfx-volume").addEventListener("input", function() {
    const volume = this.value;
    localStorage.setItem("sfxVolume", volume);
    tapSound.volume = volume / 100;
    cheerSound.volume = volume / 100;
    cheersSound.volume = volume / 100;
    cheerssSound.volume = volume / 100;
    cheersssSound.volume = volume / 100;
    cheerssssSound.volume = volume / 100;
    sadSound.volume = volume / 100;
});

window.addEventListener("load", () => {
    nameScreen.classList.remove("hidden");
    tutorialContainer.classList.add("hidden");
    gameContainer.classList.add("hidden");
    startBtn.classList.add("hidden");
    settingsPanel.classList.add("hidden");
    scoreDisplay.classList.add("hidden");
    applySettings();
    bgMusic.play();
});