document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, initializing...");

    // Ensure settings panel is hidden on load
    const settingsPanel = document.getElementById("settings-panel");
    if (!settingsPanel.classList.contains("hidden")) {
        console.log("Settings panel was not hidden on load, fixing...");
        settingsPanel.classList.add("hidden");
    }

    // Elements
    const tapSound = document.getElementById("tap-sound");
    const bgMusic = document.getElementById("bg-music");
    const cheerSound1 = document.getElementById("cheer-sound-1");
    const cheerSound2 = document.getElementById("cheer-sound-2");
    const cheerSound3 = document.getElementById("cheer-sound-3");
    const cheerSound4 = document.getElementById("cheer-sound-4");
    const cheerSound5 = document.getElementById("cheer-sound-5");
    const sadSound = document.getElementById("sad-sound");

    // Game Elements
    const nameScreen = document.getElementById("name-screen");
    const gameTitle = document.getElementById("game-title");
    const startBtn = document.getElementById("start-btn");
    const gameContainer = document.getElementById("game-container");
    const gameBoard = document.getElementById("game-board");
    const movesDisplay = document.getElementById("moves");
    const scoreDisplay = document.getElementById("score");
    const feedbackPopup = document.getElementById("feedback-popup");
    const feedbackContent = document.getElementById("feedback-content");
    const starRating = document.getElementById("star-rating");
    const scoreBtn = document.getElementById("score-btn");
    const backBtn = document.getElementById("back-btn");

    // Tutorial Elements
    const tutorialContainer = document.getElementById("tutorial-container");
    const skipTutorialBtn = document.getElementById("skip-tutorial-btn");
    const tutorialCard1 = document.getElementById("tutorial-card-1");
    const tutorialCard2 = document.getElementById("tutorial-card-2");
    const tutorialCursor = document.getElementById("tutorial-cursor");

    // Settings Elements
    const settingsBtn = document.getElementById("settings-btn");
    const minimizeBtn = document.getElementById("minimize-btn");
    const aboutBtn = document.getElementById("about-btn");
    const minimizeAboutBtn = document.getElementById("minimize-about-btn");
    const exitBtn = document.getElementById("exit-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const musicVolumeSlider = document.getElementById("music-volume");
    const sfxVolumeSlider = document.getElementById("sfx-volume");
    const playAgainBtn = document.getElementById("play-again-btn");
    const aboutSection = document.getElementById("about-section");

    // Name Input Elements
    const submitNameButton = document.getElementById("submit-name-button");

    // Game State
    let playerName = "";
    let cards = [];
    let selectedCards = [];
    let moves = 0;
    let score = 0;
    const maxMoves = 8;
    const winThreshold = 5;
    let isProcessing = false;
    let hasInteracted = false;
    let gameStarted = false;
    let lastClickedCard = null;

    // Solid colors (8 pairs total) matching the image
    const colors = [
        "#FF0000", // Red
        "#FF0000",
        "#00FF00", // Green
        "#00FF00",
        "#0000FF", // Blue
        "#0000FF",
        "#FFFF00", // Yellow
        "#FFFF00",
        "#FF00FF", // Magenta
        "#FF00FF",
        "#FFA500", // Orange
        "#FFA500",
        "#8B4513", // Brown
        "#8B4513",
        "#800080", // Purple
        "#800080"
    ];

    // Load volume settings
    const savedMusicVolume = localStorage.getItem("musicVolume") || 50;
    const savedSfxVolume = localStorage.getItem("sfxVolume") || 50;
    bgMusic.volume = savedMusicVolume / 100;
    tapSound.volume = savedSfxVolume / 100;
    cheerSound1.volume = savedSfxVolume / 100;
    cheerSound2.volume = savedSfxVolume / 100;
    cheerSound3.volume = savedSfxVolume / 100;
    cheerSound4.volume = savedSfxVolume / 100;
    cheerSound5.volume = savedSfxVolume / 100;
    sadSound.volume = savedSfxVolume / 100;
    musicVolumeSlider.value = savedMusicVolume;
    sfxVolumeSlider.value = savedSfxVolume;

    tapSound.preload = 'auto';
    bgMusic.preload = 'auto';
    cheerSound1.preload = 'auto';
    cheerSound2.preload = 'auto';
    cheerSound3.preload = 'auto';
    cheerSound4.preload = 'auto';
    cheerSound5.preload = 'auto';
    sadSound.preload = 'auto';

    function initAudio() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        [tapSound, bgMusic, cheerSound1, cheerSound2, cheerSound3, cheerSound4, cheerSound5, sadSound].forEach(audio => {
            audio.volume = localStorage.getItem('sfxVolume') ? localStorage.getItem('sfxVolume') / 100 : 0.5;
            audio.muted = false;
        });
        bgMusic.volume = localStorage.getItem('musicVolume') ? localStorage.getItem('musicVolume') / 100 : 0.5;
    }

    // Fireworks/Confetti setup
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const celebration = document.getElementById("celebration");

    // Name Submission
    function submitName() {
        const nameInput = document.getElementById("player-name-input").value.trim();
        if (nameInput === "") {
            alert("Please enter your name!");
            return;
        }
        playerName = nameInput;
        localStorage.setItem("playerName", playerName);
        nameScreen.classList.add("hidden");
        scoreBtn.classList.remove("hidden");
        showTutorial();
    }

    submitNameButton.addEventListener("click", () => {
        playClickSound(submitName);
    });

    // Tutorial Animation
    function showTutorial() {
        console.log("Showing tutorial...");
        tutorialContainer.classList.remove("hidden");
        gameTitle.classList.remove("hidden");
        startBtn.classList.remove("hidden");

        const animateTutorial = () => {
            // Reset cards and cursor to initial state
            tutorialCard1.classList.remove("clicked");
            tutorialCard2.classList.remove("clicked");
            tutorialCursor.style.transform = "translate(0, 0)";

            // Animate first card click with cursor
            setTimeout(() => {
                tutorialCursor.style.animation = "cursorMoveToCard1 1s forwards";
                tutorialCard1.classList.add("clicked");
            }, 500);

            // Animate second card click with cursor
            setTimeout(() => {
                tutorialCursor.style.animation = "cursorMoveToCard2 1s forwards";
                tutorialCard2.classList.add("clicked");
            }, 2000);

            // Restart animation after a brief pause
            setTimeout(animateTutorial, 3500);
        };
        animateTutorial();
    }

    function skipTutorial() {
        playClickSound(() => {
            tutorialContainer.classList.add("hidden");
            gameTitle.classList.add("hidden");
            startBtn.classList.add("hidden");
            gameContainer.classList.remove("hidden");
            gameStarted = true;
            initGame();
            backBtn.classList.add("disabled");
            scoreBtn.classList.add("disabled");
        });
    }

    skipTutorialBtn.addEventListener("click", skipTutorial);

    function playBackgroundMusic() {
        if (!hasInteracted) {
            bgMusic.play().catch(error => console.log("Error playing background music:", error));
            hasInteracted = true;
        }
    }

    function playClickSound(callback) {
        tapSound.currentTime = 0;
        tapSound.play().then(() => {
            setTimeout(callback, 200);
        }).catch(error => {
            console.log('Audio play failed:', error);
        });
    }

    function playCheerSequence() {
        const cheerSounds = [cheerSound1, cheerSound2, cheerSound3, cheerSound4, cheerSound5];
        cheerSounds.forEach(sound => {
            sound.currentTime = 0;
            sound.play().catch(error => console.log("Error playing cheer sound:", error));
        });
    }

    function playResultSound() {
        if (score >= winThreshold) {
            playCheerSequence();
        } else {
            sadSound.currentTime = 0;
            sadSound.play().catch(error => console.log("Error playing sad sound:", error));
        }
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function initGame() {
        gameBoard.innerHTML = "";
        cards = [];
        selectedCards = [];
        moves = 0;
        score = 0;
        isProcessing = false;
        scoreDisplay.textContent = score;
        movesDisplay.textContent = moves;
        feedbackPopup.classList.add("hidden");
        lastClickedCard = null;

        const shuffledColors = shuffle([...colors]);
        shuffledColors.forEach((color) => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.dataset.color = color;

            const colorSquare = document.createElement("div");
            colorSquare.classList.add("color-square");
            colorSquare.style.background = color;
            card.appendChild(colorSquare);

            cards.push(card);
            gameBoard.appendChild(card);
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

    function startFireworks() {
        const fireworksCount = 3;
        const particlesPerBurst = 50;
        const fireworks = [];

        for (let i = 0; i < fireworksCount; i++) {
            const burstX = canvas.width * (0.3 + Math.random() * 0.4);
            const burstY = canvas.height * (0.2 + Math.random() * 0.3);
            const color = `hsl(${Math.random() * 360}, 100%, 50%)`;

            for (let j = 0; j < particlesPerBurst; j++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 2;
                fireworks.push({
                    x: burstX,
                    y: burstY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 4 + 2,
                    alpha: 1,
                    color: color,
                    life: 1.5
                });
            }
        }

        function animateFireworks() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            fireworks.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1;
                p.alpha -= 0.02;
                p.size *= 0.98;

                if (p.alpha <= 0) fireworks.splice(index, 1);

                ctx.fillStyle = `${p.color.slice(0, -1)}, ${p.alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `${p.color.slice(0, -1)}, ${p.alpha * 0.3})`;
                ctx.beginPath();
                ctx.arc(p.x - p.vx * 0.5, p.y - p.vy * 0.5, p.size * 0.8, 0, Math.PI * 2);
                ctx.fill();
            });

            if (fireworks.length > 0) requestAnimationFrame(animateFireworks);
            else canvas.style.display = "none";
        }

        canvas.style.display = "block";
        animateFireworks();
        setTimeout(() => fireworks.length = 0, 1500);
    }

    function startSmallConfetti() {
        const confettiCount = 20;
        const confetti = [];

        for (let i = 0; i < confettiCount; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 5 + 2,
                speed: Math.random() * 3 + 1,
                color: `hsl(${Math.random() * 360}, 50%, 50%)`,
                angle: Math.random() * 360
            });
        }

        function animateConfetti() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            confetti.forEach((c, index) => {
                c.y += c.speed;
                c.x += Math.sin(c.angle) * 1;
                c.angle += 0.05;

                if (c.y > canvas.height) confetti.splice(index, 1);

                ctx.fillStyle = c.color;
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
                ctx.fill();
            });

            if (confetti.length > 0) requestAnimationFrame(animateConfetti);
            else canvas.style.display = "none";
        }

        canvas.style.display = "block";
        animateConfetti();
        setTimeout(() => confetti.length = 0, 1500);
    }

    function displayStarRating(score) {
        starRating.innerHTML = "";
        const totalStars = 3;
        let filledStars;

        if (score >= 8) {
            filledStars = 3;
        } else if (score >= 4 && score <= 7) {
            filledStars = 2;
        } else if (score >= 1 && score <= 3) {
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
        gameContainer.classList.add("hidden");
        feedbackPopup.classList.remove("hidden");
        if (score >= winThreshold) {
            feedbackContent.textContent = 'CONGRATULATIONS';
            startFireworks();
            triggerCelebration();
            triggerFireworks();
        } else {
            feedbackContent.textContent = 'SORRY, TRY AGAIN';
            startSmallConfetti();
        }
        playResultSound();
        displayStarRating(score);
        saveScore();
    }

    startBtn.addEventListener("click", () => {
        playClickSound(() => {
            playBackgroundMusic();
            if (tutorialContainer.classList.contains("hidden")) {
                gameTitle.classList.add("hidden");
                startBtn.classList.add("hidden");
                gameContainer.classList.remove("hidden");
                gameStarted = true;
                initGame();
                backBtn.classList.add("disabled");
                scoreBtn.classList.add("disabled");
            } else {
                skipTutorial();
            }
        });
    });

    gameBoard.addEventListener("click", (event) => {
        const card = event.target.closest(".card");
        if (!card || isProcessing || selectedCards.length >= 2 || selectedCards.includes(card) || card.classList.contains("matched") || moves >= maxMoves) return;

        playClickSound(() => {
            // Remove clicked class from the previously clicked card if it exists
            if (lastClickedCard && !selectedCards.includes(lastClickedCard)) {
                lastClickedCard.classList.remove("clicked");
            }

            // Set the current card as clicked and apply the pulsing animation
            card.classList.add("clicked");
            lastClickedCard = card;
            selectedCards.push(card);

            if (selectedCards.length === 2) {
                moves++;
                movesDisplay.textContent = moves;
                isProcessing = true;
                setTimeout(checkMatch, 1000);

                if (moves >= maxMoves) {
                    setTimeout(() => {
                        endGame();
                    }, 1000);
                }
            }
        });
    });

    function checkMatch() {
        const [card1, card2] = selectedCards;
        if (card1.dataset.color === card2.dataset.color) {
            card1.classList.add("matched");
            card2.classList.add("matched");
            score++;
            scoreDisplay.textContent = score;
        }
        // Clear the clicked state after comparison
        selectedCards.forEach(card => card.classList.remove("clicked"));
        selectedCards = [];
        lastClickedCard = null;
        isProcessing = false;

        // Check if all cards are matched
        const matchedCards = cards.filter(card => card.classList.contains("matched"));
        if (matchedCards.length === cards.length) {
            setTimeout(() => {
                endGame();
            }, 1000);
        }
    }

    function saveScore() {
        const scores = JSON.parse(localStorage.getItem("kidTasticScores")) || [];
        const scoreData = {
            playerName: playerName || "Player",
            game: "Color Memory Game",
            score: score,
            date: new Date().toISOString()
        };
        scores.push(scoreData);
        localStorage.setItem("kidTasticScores", JSON.stringify(scores));
    }

    scoreBtn.addEventListener("click", () => {
        if (!gameStarted) {
            playClickSound(() => {
                setTimeout(() => {
                    window.location.href = "scorer.html";
                }, 300);
            });
        }
    });

    backBtn.addEventListener("click", () => {
        if (!gameStarted) {
            playClickSound(() => {
                setTimeout(() => {
                    window.location.href = "color.html";
                }, 300);
            });
        }
    });

    settingsBtn.addEventListener("click", () => {
        playClickSound(() => {
            playBackgroundMusic();
            console.log("Opening settings panel");
            settingsPanel.classList.remove("hidden");
        });
    });

    minimizeBtn.addEventListener("click", () => {
        playClickSound(() => {
            console.log("Minimizing settings panel");
            settingsPanel.classList.add("hidden");
        });
    });

    aboutBtn.addEventListener("click", () => {
        playClickSound(() => {
            aboutSection.classList.remove("hidden");
        });
    });

    minimizeAboutBtn.addEventListener("click", () => {
        playClickSound(() => {
            aboutSection.classList.add("hidden");
        });
    });

    exitBtn.addEventListener("click", () => {
        playClickSound(() => {
            if (confirm("Are you sure you want to exit the game?")) {
                bgMusic.pause();
                window.location.href = "index.html";
            }
        });
    });

    logoutBtn.addEventListener("click", () => {
        playClickSound(() => {
            if (confirm("Are you sure you want to logout?")) {
                bgMusic.pause();
                localStorage.removeItem("kidTasticScores");
                window.location.href = "login.html";
            }
        });
    });

    playAgainBtn.addEventListener("click", () => {
        playClickSound(() => {
            feedbackPopup.classList.add("hidden");
            gameTitle.classList.remove("hidden");
            startBtn.classList.remove("hidden");
            gameContainer.classList.add("hidden");
            gameStarted = false;
            backBtn.classList.remove("disabled");
            scoreBtn.classList.remove("disabled");
            initGame();
        });
    });

    musicVolumeSlider.addEventListener("input", (e) => {
        const volume = e.target.value / 100;
        bgMusic.volume = volume;
        localStorage.setItem("musicVolume", e.target.value);
    });

    sfxVolumeSlider.addEventListener("input", (e) => {
        const volume = e.target.value / 100;
        tapSound.volume = volume;
        cheerSound1.volume = volume;
        cheerSound2.volume = volume;
        cheerSound3.volume = volume;
        cheerSound4.volume = volume;
        cheerSound5.volume = volume;
        sadSound.volume = volume;
        localStorage.setItem("sfxVolume", e.target.value);
    });

    document.addEventListener("click", () => {
        initAudio();
    }, { once: true });
});