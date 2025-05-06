const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const colors = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#FF69B4'];
const words = {
    A: 'APPLE', B: 'BANANA', C: 'CAT', D: 'DOG', E: 'ELEPHANT', F: 'FISH',
    G: 'GIRAFFE', H: 'HOUSE', I: 'IGLOO', J: 'JELLY', K: 'KITE', L: 'LION',
    M: 'MONKEY', N: 'NEST', O: 'ORANGE', P: 'PENGUIN', Q: 'QUEEN', R: 'RABBIT',
    S: 'SUN', T: 'TIGER', U: 'UMBRELLA', V: 'VIOLIN', W: 'WHALE', X: 'XYLOPHONE',
    Y: 'YAK', Z: 'ZEBRA'
};

let targetLetter = 'A';
let score = 0;
let attemptsLeft = 5;
let playerName = 'Player';
let gameStarted = false;
let speech = new SpeechSynthesisUtterance();
speech.lang = 'en-US';
speech.volume = 1;
speech.rate = 0.9; // Slightly slower for a more natural female tone
speech.pitch = 1.8; // Higher pitch for a female-like voice
let canClickLetter = true;

const tapSound = document.getElementById('tap-sound');
const bgMusic = document.getElementById('bg-music');
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const cheerSound = document.getElementById('cheer-sound');
const cheersSound = document.getElementById('cheers-sound');
const cheerssSound = document.getElementById('cheerss-sound');
const cheersssSound = document.getElementById('cheersss-sound');
const cheerssssSound = document.getElementById('cheerssss-sound');
const cheerSadSound = document.getElementById('cheersad-sound');
const nameScreen = document.getElementById('name-screen');
const playerNameInput = document.getElementById('player-name-input');
const submitNameButton = document.getElementById('submit-name-button');
const nameFeedback = document.getElementById('name-feedback');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score-display');
const promptDisplay = document.getElementById('prompt');
const letterContainer = document.getElementById('letter-container');
const feedbackDisplay = document.getElementById('feedback');
const wordDisplay = document.getElementById('word-display');
const feedbackPopup = document.getElementById('feedback-popup');
const feedbackContent = document.getElementById('feedback-content');
const starRating = document.getElementById('star-rating');
const playAgainBtn = document.getElementById('play-again-btn');
const backBtn = document.querySelector('.back-btn');
const settingsBtn = document.querySelector('.settings-btn');
const scoreBtn = document.querySelector('.score-tracker-btn');
const settingsPanel = document.getElementById('settings-panel');
const aboutSection = document.getElementById('about-section');
const aboutBtn = document.getElementById('about-btn');
const exitBtn = document.getElementById('exit-btn');
const minimizeBtn = document.getElementById('minimize-btn');
const minimizeAboutBtn = document.getElementById('minimize-about-btn');

tapSound.preload = 'auto';
bgMusic.preload = 'auto';
correctSound.preload = 'auto';
wrongSound.preload = 'auto';
cheerSound.preload = 'auto';
cheersSound.preload = 'auto';
cheerssSound.preload = 'auto';
cheersssSound.preload = 'auto';
cheerssssSound.preload = 'auto';
cheerSadSound.preload = 'auto';

function getRandomLetter() {
    return letters[Math.floor(Math.random() * letters.length)];
}

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function setupGame() {
    if (attemptsLeft <= 0) {
        endGame();
        return;
    }
    canClickLetter = true;
    targetLetter = getRandomLetter();
    promptDisplay.textContent = `Tap the letter ${targetLetter}.`;
    letterContainer.innerHTML = '';
    feedbackDisplay.textContent = '';
    wordDisplay.style.display = 'none';

    let options = [targetLetter];
    while (options.length < 5) {
        const randomLetter = getRandomLetter();
        if (!options.includes(randomLetter)) options.push(randomLetter);
    }
    options = options.sort(() => Math.random() - 0.5);

    options.forEach(letter => {
        const button = document.createElement('button');
        button.className = 'letter-button';
        button.textContent = letter;
        button.style.backgroundColor = getRandomColor();
        button.onclick = () => handleLetterClick(letter, button);
        letterContainer.appendChild(button);
    });
}

function handleLetterClick(letter, button) {
    if (!canClickLetter) return;
    canClickLetter = false;
    playClickSound(() => {
        speech.text = letter;
        window.speechSynthesis.speak(speech);

        const color = getRandomColor();
        wordDisplay.textContent = words[letter];
        wordDisplay.style.color = color;
        wordDisplay.style.display = 'block';

        if (letter === targetLetter) {
            score++;
            scoreDisplay.textContent = score;
            saveScore();
            feedbackDisplay.textContent = 'Correct!';
            correctSound.currentTime = 0;
            correctSound.play();
            attemptsLeft--;
            setTimeout(setupGame, 1000);
        } else {
            button.classList.add('shake', 'highlight-red');
            wrongSound.currentTime = 0;
            wrongSound.play();
            attemptsLeft--;
            setTimeout(() => {
                button.classList.remove('shake', 'highlight-red');
                setupGame();
            }, 500);
        }

        const letterButtons = document.querySelectorAll('.letter-button');
        letterButtons.forEach(btn => btn.classList.add('disabled'));
    });
}

function saveScore() {
    const scores = JSON.parse(localStorage.getItem('kidTasticScores')) || [];
    const scoreData = {
        playerName: playerName,
        game: 'Pick the Letter',
        score: score,
        date: new Date().toISOString()
    };
    scores.push(scoreData);
    localStorage.setItem('kidTasticScores', JSON.stringify(scores));
}

function playClickSound(callback) {
    tapSound.currentTime = 0;
    tapSound.play();
    setTimeout(callback, 200);
}

function applySettings() {
    const musicVolume = localStorage.getItem('musicVolume') || 50;
    const sfxVolume = localStorage.getItem('sfxVolume') || 50;
    bgMusic.volume = musicVolume / 100;
    tapSound.volume = sfxVolume / 100;
    correctSound.volume = sfxVolume / 100;
    wrongSound.volume = sfxVolume / 100;
    cheerSound.volume = sfxVolume / 100;
    cheersSound.volume = sfxVolume / 100;
    cheerssSound.volume = sfxVolume / 100;
    cheersssSound.volume = sfxVolume / 100;
    cheerssssSound.volume = sfxVolume / 100;
    cheerSadSound.volume = sfxVolume / 100;
}

function displayStarRating(score) {
    starRating.innerHTML = '';
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
        const star = document.createElement('div');
        star.classList.add('star');
        if (i < filledStars) {
            star.classList.add('filled');
        }
        starRating.appendChild(star);
    }
}

function playCheerSequence() {
    const cheerSounds = [cheerSound, cheersSound, cheerssSound, cheersssSound, cheerssssSound];
    cheerSounds.forEach(sound => {
        sound.currentTime = 0;
        sound.play();
    });
}

function endGame() {
    gameStarted = false;
    gameContainer.classList.add('hidden');
    feedbackPopup.classList.remove('hidden');
    if (score >= 3 && score <= 5) {
        feedbackContent.textContent = 'CONGRATULATIONS';
        playCheerSequence();
    } else if (score >= 0 && score <= 2) {
        feedbackContent.textContent = 'SORRY, TRY AGAIN';
        cheerSadSound.currentTime = 0;
        cheerSadSound.play();
    }
    displayStarRating(score);
    saveScore();
}

submitNameButton.addEventListener('click', () => {
    playClickSound(() => {
        const name = playerNameInput.value.trim();
        if (name) {
            playerName = name;
            nameScreen.classList.add('hidden');
            nameFeedback.classList.remove('show');
            gameContainer.classList.remove('hidden');
            gameStarted = true;
            setupGame();
        } else {
            nameFeedback.classList.add('show');
            playerNameInput.focus();
        }
    });
});

backBtn.addEventListener('click', () => {
    playClickSound(() => {
        window.location.href = 'letters.html';
    });
});

settingsBtn.addEventListener('click', () => {
    playClickSound(() => {
        settingsPanel.classList.remove('hidden');
        aboutSection.classList.add('hidden');
    });
});

aboutBtn.addEventListener('click', () => {
    playClickSound(() => {
        aboutSection.classList.toggle('hidden');
    });
});

exitBtn.addEventListener('click', () => {
    playClickSound(() => {
        if (window.electronAPI && window.electronAPI.closeApp) {
            window.electronAPI.closeApp();
        } else {
            window.close();
        }
    });
});

minimizeBtn.addEventListener('click', () => {
    playClickSound(() => {
        settingsPanel.classList.add('hidden');
        aboutSection.classList.add('hidden');
    });
});

minimizeAboutBtn.addEventListener('click', () => {
    playClickSound(() => {
        aboutSection.classList.add('hidden');
    });
});

playAgainBtn.addEventListener('click', () => {
    playClickSound(() => {
        feedbackPopup.classList.add('hidden');
        score = 0;
        attemptsLeft = 5;
        scoreDisplay.textContent = score;
        gameContainer.classList.remove('hidden');
        setupGame();
    });
});

document.getElementById('music-volume').addEventListener('input', function() {
    const volume = this.value;
    localStorage.setItem('musicVolume', volume);
    bgMusic.volume = volume / 100;
});

document.getElementById('sfx-volume').addEventListener('input', function() {
    const volume = this.value;
    localStorage.setItem('sfxVolume', volume);
    tapSound.volume = volume / 100;
    correctSound.volume = volume / 100;
    wrongSound.volume = volume / 100;
    cheerSound.volume = volume / 100;
    cheersSound.volume = volume / 100;
    cheerssSound.volume = volume / 100;
    cheersssSound.volume = volume / 100;
    cheerssssSound.volume = volume / 100;
    cheerSadSound.volume = volume / 100;
});

document.addEventListener('click', () => {
    bgMusic.currentTime = 0;
    bgMusic.play();
}, { once: true });

window.addEventListener('load', () => {
    nameScreen.classList.remove('hidden');
    gameContainer.classList.add('hidden');
    settingsPanel.classList.add('hidden');
    aboutSection.classList.add('hidden');
    feedbackPopup.classList.add('hidden');
    applySettings();
    selectFemaleVoice();
});

// Function to select a female voice
function selectFemaleVoice() {
    const voices = window.speechSynthesis.getVoices();
    // Expanded list of female-sounding voices across platforms
    const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Victoria') || 
        voice.name.includes('Karen') || 
        voice.name.includes('Moira') || 
        voice.name.includes('Tessa') || 
        voice.name.includes('Zira') || 
        voice.name.includes('Susan') || 
        voice.name.includes('Linda') || 
        voice.name.includes('Google UK English Female') || 
        voice.name.includes('Microsoft Zira') || 
        voice.name.includes('Microsoft Hazel')
    );
    if (femaleVoice) {
        speech.voice = femaleVoice;
    } else {
        // Fallback with higher pitch and slower rate for a more female-like tone
        speech.pitch = 1.8;
        speech.rate = 0.9;
    }
}

// Ensure voices are loaded before selecting
window.speechSynthesis.onvoiceschanged = selectFemaleVoice;