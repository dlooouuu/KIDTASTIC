document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, initializing...");

    const settingsPanel = document.getElementById("settings-panel");
    if (!settingsPanel.classList.contains("hidden")) {
        console.log("Settings panel was not hidden on load, fixing...");
        settingsPanel.classList.add("hidden");
    }

    localStorage.removeItem("tutorialShown");
    applySettings();

    document.getElementById("submit-name-button").addEventListener("click", submitName);
    document.getElementById("skip-tutorial-btn").addEventListener("click", () => {
        playClickSound(() => {
            document.getElementById("tutorial-container").classList.add("hidden");
            localStorage.setItem("tutorialShown", "true");
            startGame();
        });
    });

    const settingsButton = document.getElementById("settings-button");
    if (settingsButton) {
        settingsButton.addEventListener("click", openSettings);
    } else {
        console.error("Settings button not found!");
    }

    const minimizeBtn = document.getElementById("minimize-btn");
    if (minimizeBtn) {
        minimizeBtn.addEventListener("click", () => {
            console.log("Minimizing settings panel");
            playClickSound(() => {
                document.getElementById("settings-panel").classList.add("hidden");
            });
        });
    } else {
        console.error("Minimize button not found!");
    }
});

const tapSound = document.getElementById("tap-sound");
const cheerSounds = [
    document.getElementById("cheer-sound"),
    document.getElementById("cheers-sound"),
    document.getElementById("cheerss-sound"),
    document.getElementById("cheersss-sound"),
    document.getElementById("cheerssss-sound")
];
const sadSound = document.getElementById("sad-sound");

function applySettings() {
    const musicVolume = localStorage.getItem("musicVolume") || 50;
    const sfxVolume = localStorage.getItem("sfxVolume") || 50;

    const bgMusic = document.getElementById("bgMusic");
    if (bgMusic) {
        bgMusic.volume = musicVolume / 100;
        bgMusic.muted = musicVolume == 0;
    } else {
        requestAnimationFrame(applySettings);
    }

    tapSound.volume = sfxVolume / 100;
    cheerSounds.forEach(sound => sound.volume = sfxVolume / 100);
    sadSound.volume = sfxVolume / 100;

    document.getElementById("music-volume").value = musicVolume;
    document.getElementById("sfx-volume").value = sfxVolume;
}

function playClickSound(callback) {
    tapSound.currentTime = 0;
    tapSound.play().then(() => setTimeout(callback, 300)).catch(() => callback());
}

function goBack() {
    if (!document.getElementById("back-button").disabled) {
        playClickSound(() => window.location.href = "number.html");
    }
}

function openSettings() {
    playClickSound(() => {
        console.log("Opening settings panel");
        document.getElementById("settings-panel").classList.remove("hidden");
    });
}

document.getElementById("about-btn").addEventListener("click", () => {
    playClickSound(() => document.getElementById("about-section").classList.remove("hidden"));
});

document.getElementById("minimize-about-btn").addEventListener("click", () => {
    playClickSound(() => document.getElementById("about-section").classList.add("hidden"));
});

document.getElementById("exit-btn").addEventListener("click", () => {
    playClickSound(() => {
        const confirmExit = confirm("Are you sure you want to exit the game?");
        if (confirmExit) {
            const bgMusic = document.getElementById("bgMusic");
            if (bgMusic) {
                bgMusic.pause();
                bgMusic.currentTime = 0;
                localStorage.removeItem("bgMusicTime");
            }
            if (window.electronAPI && window.electronAPI.closeApp) {
                window.electronAPI.closeApp();
            } else {
                window.close();
            }
        }
    });
});

document.getElementById("logout-btn").addEventListener("click", () => {
    playClickSound(() => {
        const confirmLogout = confirm("Are you sure you want to logout?");
        if (confirmLogout) {
            try {
                const settingsContent = document.querySelector(".settings-content");
                if (settingsContent) {
                    const loadingMsg = document.createElement("div");
                    loadingMsg.className = "logout-message";
                    loadingMsg.textContent = "Logging out...";
                    settingsContent.appendChild(loadingMsg);
                    loadingMsg.classList.add("animated");
                }
                
                localStorage.removeItem("current_teacher");
                localStorage.removeItem("current_teacher_fullname");
                
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1000);
            } catch (error) {
                console.error("Logout error:", error);
                alert("Logout failed. Please try again.");
                
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1000);
            }
        }
    });
});

document.getElementById("music-volume").addEventListener("input", function() {
    const volume = this.value;
    localStorage.setItem("musicVolume", volume);
    const bgMusic = document.getElementById("bgMusic");
    if (bgMusic) {
        bgMusic.volume = volume / 100;
        bgMusic.muted = volume == 0;
    }
});

document.getElementById("sfx-volume").addEventListener("input", function() {
    const volume = this.value;
    localStorage.setItem("sfxVolume", volume);
    tapSound.volume = volume / 100;
    cheerSounds.forEach(sound => sound.volume = volume / 100);
    sadSound.volume = volume / 100;
});

let playerName = "";

function submitName() {
    const nameInput = document.getElementById("player-name-input").value.trim();
    if (nameInput === "") {
        alert("Please enter your name!");
        return;
    }
    playerName = nameInput;
    localStorage.setItem("playerName", playerName);
    document.getElementById("name-screen").classList.add("hidden");
    document.getElementById("score-button").classList.remove("hidden");
    showTutorial();
}

function showTutorial() {
    document.getElementById("tutorial-container").classList.remove("hidden");

    const cursor = document.getElementById("tutorial-cursor");
    const correctBalloon = document.getElementById("tutorial-balloon-2");
    const balloons = document.querySelectorAll(".tutorial-balloon");

    function createSparkles(balloon) {
        const balloonRect = balloon.getBoundingClientRect();
        const containerRect = document.getElementById("tutorial-demo").getBoundingClientRect();
        const particleCount = 10;

        for (let i = 0; i < particleCount; i++) {
            const sparkle = document.createElement("div");
            sparkle.classList.add("sparkle");

            const offsetX = (balloonRect.left - containerRect.left) + balloonRect.width / 2;
            const offsetY = (containerRect.bottom - balloonRect.top - balloonRect.height / 2);
            sparkle.style.left = `${offsetX}px`;
            sparkle.style.bottom = `${offsetY}px`;

            const angle = (Math.random() * 360) * (Math.PI / 180);
            const distance = Math.random() * 50 + 20;
            sparkle.style.animationDelay = `${Math.random() * 0.3}s`;
            sparkle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;

            document.getElementById("tutorial-demo").appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 800);
        }
    }

    function resetAndAnimate() {
        cursor.style.left = "50%";
        cursor.style.bottom = "10px";
        cursor.style.transform = "translateX(-50%)";
        cursor.style.animation = "none";

        balloons.forEach(balloon => {
            balloon.style.animation = "tutorial-float 5s linear infinite";
            if (balloon.id === "tutorial-balloon-2") {
                balloon.style.animation = "tutorial-float 5s linear infinite, pulse 1.5s ease-in-out infinite";
            }
            balloon.classList.remove("pop");
        });

        setTimeout(() => {
            const balloonRect = correctBalloon.getBoundingClientRect();
            const containerRect = document.getElementById("tutorial-demo").getBoundingClientRect();
            const targetLeft = ((balloonRect.left - containerRect.left) + balloonRect.width / 2) + "px";
            const targetBottom = (containerRect.bottom - balloonRect.top - balloonRect.height / 2) + "px";

            cursor.style.transition = "left 2s ease-in-out, bottom 2s ease-in-out";
            cursor.style.left = targetLeft;
            cursor.style.bottom = targetBottom;

            setTimeout(() => {
                correctBalloon.classList.add("pop");
                createSparkles(correctBalloon);
                setTimeout(resetAndAnimate, 1000);
            }, 2000);
        }, 1000);
    }

    resetAndAnimate();
}

let attemptsLeft;
let score = 0;
let totalAttempts = 0;
let tappedBalloons = new Set();
let balloonTimeout;
let attemptActive = false;

function startGame() {
    document.getElementById("tutorial-container").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    document.getElementById("back-button").disabled = true;
    document.getElementById("score-button").disabled = true;
    attemptsLeft = 10;
    score = 0;
    totalAttempts = 0;
    tappedBalloons.clear();
    updateDisplay();
    generateQuestion();
}

function generateQuestion() {
    if (totalAttempts >= 10) {
        endGame();
        return;
    }

    let targetNumber = Math.floor(Math.random() * 10) + 1;
    document.getElementById("target-number").textContent = targetNumber;

    let container = document.querySelector(".balloon-container");
    container.innerHTML = "";

    let correctIndex = Math.floor(Math.random() * 3);
    let usedNumbers = [targetNumber];

    attemptActive = false;

    for (let i = 0; i < 3; i++) {
        let balloon = document.createElement("div");
        balloon.classList.add("balloon");
        balloon.id = `balloon-${i}-${totalAttempts}`;
        let leftPos;
        do {
            leftPos = Math.random() * 80 + 10;
        } while (Array.from(container.children).some(b => Math.abs(parseFloat(b.style.left) - leftPos) < 15));
        balloon.style.left = `${leftPos}%`;
        let number = i === correctIndex ? targetNumber : getUniqueNumber(usedNumbers);
        if (i === correctIndex) usedNumbers.push(targetNumber);
        balloon.innerHTML = `
            <div class="balloon-body">
                <span class="balloon-number">${number}</span>
            </div>
            <div class="balloon-tail"></div>
        `;
        balloon.dataset.correct = i === correctIndex ? "true" : "false";
        balloon.dataset.number = number;
        balloon.addEventListener("click", () => checkAnswer(balloon, targetNumber), { once: true });
        container.appendChild(balloon);
    }

    balloonTimeout = setTimeout(() => {
        totalAttempts++;
        updateDisplay();
        generateQuestion();
    }, 5000);
}

function getUniqueNumber(usedNumbers) {
    let num;
    do {
        num = Math.floor(Math.random() * 10) + 1;
    } while (usedNumbers.includes(num));
    usedNumbers.push(num);
    return num;
}

function checkAnswer(balloon, targetNumber) {
    if (tappedBalloons.has(balloon.id) || attemptActive) return;
    attemptActive = true;
    clearTimeout(balloonTimeout);
    tapSound.play();
    totalAttempts++;
    tappedBalloons.add(balloon.id);

    let isCorrect = balloon.dataset.correct === "true";
    if (isCorrect) {
        score += 1;
        balloon.classList.add("pop");
    } else {
        balloon.classList.add("wrong");
        balloon.querySelector(".balloon-number").textContent = "✖";
        setTimeout(() => {
            balloon.classList.remove("wrong");
            balloon.querySelector(".balloon-number").textContent = balloon.dataset.number;
        }, 500);
    }

    updateDisplay();
    setTimeout(() => generateQuestion(), 1000);
}

function updateDisplay() {
    document.getElementById("tries-display").textContent = `${totalAttempts}/10`;
    document.getElementById("score-display").textContent = score;
}

function createFireworks() {
    const fireworksContainer = document.getElementById("fireworks");
    fireworksContainer.classList.remove("hidden");

    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.classList.add("firework-particle");

        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 0.5}s`;

        fireworksContainer.appendChild(particle);

        setTimeout(() => particle.remove(), 1500);
    }

    setTimeout(() => fireworksContainer.classList.add("hidden"), 2000);
}

function displayStarRating(score) {
    const starRating = document.getElementById("star-rating");
    starRating.innerHTML = "";
    const totalStars = 3;
    let filledStars;

    if (score === 10) {
        filledStars = 3;
    } else if (score >= 6 && score <= 9) {
        filledStars = 2;
    } else if (score >= 1 && score <= 5) {
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
    document.querySelector(".balloon-container").style.display = "none";
    document.querySelector(".pentagon").style.display = "none";
    document.querySelectorAll(".stats").forEach(stat => stat.style.display = "none");

    let endGameMessage = document.getElementById("end-game-message");
    let message = document.getElementById("message");

    if (score >= 6) {
        message.textContent = `CONGRATULATIONS`;
        createFireworks();
        cheerSounds.forEach(sound => {
            sound.currentTime = 0;
            sound.play().then(() => {
                setTimeout(() => {
                    sound.pause();
                    sound.currentTime = 0;
                }, 2000);
            }).catch(error => console.log("Cheer sound failed to play:", error));
        });
    } else {
        message.textContent = `SORRY, TRY AGAIN`;
        sadSound.currentTime = 0;
        sadSound.play().catch(error => console.log("Sad sound failed to play:", error));
    }

    displayStarRating(score);
    endGameMessage.classList.remove("hidden");

    document.getElementById("back-button").disabled = false;
    document.getElementById("score-button").disabled = false;

    saveScore();
}

function saveScore() {
    const scores = JSON.parse(localStorage.getItem("kidTasticScores")) || [];
    const scoreData = {
        playerName: playerName,
        game: "Number Pop Game",
        score: score,
        date: new Date().toISOString()
    };
    scores.push(scoreData);
    localStorage.setItem("kidTasticScores", JSON.stringify(scores));
}

document.getElementById("play-again-button").addEventListener("click", () => {
    playClickSound(() => {
        document.getElementById("end-game-message").classList.add("hidden");
        document.getElementById("back-button").disabled = true;
        document.getElementById("score-button").disabled = true;
        document.querySelector(".balloon-container").style.display = "block";
        document.querySelector(".pentagon").style.display = "flex";
        document.querySelectorAll(".stats").forEach(stat => stat.style.display = "inline-block");
        startGame();
    });
});