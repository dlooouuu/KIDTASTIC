let currentScoreId = null;

// Audio Setup
const bgMusic = document.getElementById("bg-music");
const tapSound = document.getElementById("tap-sound");

bgMusic.volume = localStorage.getItem("musicVolume") ? localStorage.getItem("musicVolume") / 100 : 0.5;
tapSound.volume = localStorage.getItem("sfxVolume") ? localStorage.getItem("sfxVolume") / 100 : 0.5;

// Load saved scores from localStorage
document.addEventListener('DOMContentLoaded', function() {
    loadScores();
    setupEventListeners();
    applySettings();
    bgMusic.play().catch(error => console.log("Background music failed to play:", error));
});

// Set up all event listeners
function setupEventListeners() {
    document.getElementById('back-btn').addEventListener('click', function() {
        playClickSound(() => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            window.location.href = 'pagsuway.html';
        });
    });
    
    document.getElementById('settings-btn').addEventListener('click', function() {
        playClickSound(() => openSettings());
    });
    
    document.getElementById('reset-btn').addEventListener('click', function() {
        playClickSound(() => {
            showConfirmDialog('Are you sure you want to delete all scores?', function() {
                localStorage.removeItem('kidTasticScores');
                loadScores();
                showToast('All scores have been reset!');
            });
        });
    });
    
    document.getElementById('save-edit-btn').addEventListener('click', saveEdit);
    document.getElementById('cancel-edit-btn').addEventListener('click', closeModal);
    
    document.getElementById('confirm-yes-btn').addEventListener('click', confirmAction);
    document.getElementById('confirm-no-btn').addEventListener('click', closeConfirmDialog);

    // Settings Panel Event Listeners
    document.getElementById("minimize-btn").addEventListener("click", () => {
        playClickSound(() => document.getElementById("settings-panel").style.display = "none");
    });

    document.getElementById("about-btn").addEventListener("click", () => {
        playClickSound(() => document.getElementById("about-section").style.display = "block");
    });

    document.getElementById("minimize-about-btn").addEventListener("click", () => {
        playClickSound(() => document.getElementById("about-section").style.display = "none");
    });

    document.getElementById("exit-btn").addEventListener("click", () => {
        playClickSound(() => window.close());
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
        playClickSound(() => {
            localStorage.removeItem("current_teacher");
            localStorage.removeItem("current_teacher_fullname");
            setTimeout(() => window.location.href = "login.html", 1000);
        });
    });

    document.getElementById("music-volume").addEventListener("input", function() {
        const volume = this.value;
        localStorage.setItem("musicVolume", volume);
        bgMusic.volume = volume / 100;
    });

    document.getElementById("sfx-volume").addEventListener("input", function() {
        const volume = this.value;
        localStorage.setItem("sfxVolume", volume);
        tapSound.volume = volume / 100;
    });
}

// Load scores from localStorage
function loadScores() {
    const scores = JSON.parse(localStorage.getItem('kidTasticScores')) || [];
    const scoresList = document.getElementById('scores-list');
    const noScoresMessage = document.getElementById('no-scores-message');
    const resetButton = document.getElementById('reset-btn');
    
    scoresList.innerHTML = '';
    
    if (scores.length === 0) {
        noScoresMessage.style.display = 'block';
        document.querySelector('.table-container').style.display = 'none';
        resetButton.style.display = 'none';
    } else {
        noScoresMessage.style.display = 'none';
        document.querySelector('.table-container').style.display = 'block';
        resetButton.style.display = "block";
        
        // Create a copy of scores with original indices
        const indexedScores = scores.map((score, index) => ({ ...score, originalIndex: index }));
        
        // Sort by date (newest first)
        indexedScores.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Create table rows with original index as data-id
        indexedScores.forEach((score) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${score.playerName}</td>
                <td>${score.game}</td>
                <td>${score.score}</td>
                <td>${formatDate(score.date)}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${score.originalIndex}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${score.originalIndex}">Delete</button>
                </td>
            `;
            scoresList.appendChild(row);
        });
        
        addActionButtonListeners();
    }
}

// Add event listeners to action buttons
function addActionButtonListeners() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.removeEventListener('click', handleEditClick); // Prevent duplicate listeners
        button.addEventListener('click', handleEditClick);
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.removeEventListener('click', handleDeleteClick); // Prevent duplicate listeners
        button.addEventListener('click', handleDeleteClick);
    });
}

// Handle edit button click
function handleEditClick(event) {
    const id = parseInt(event.target.getAttribute('data-id'));
    playClickSound(() => openEditModal(id));
}

// Handle delete button click
function handleDeleteClick(event) {
    const id = parseInt(event.target.getAttribute('data-id'));
    const scores = JSON.parse(localStorage.getItem('kidTasticScores')) || [];
    playClickSound(() => {
        showConfirmDialog(`Delete score for ${scores[id].playerName}?`, function() {
            deleteScore(id);
        });
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Open edit modal
function openEditModal(id) {
    const scores = JSON.parse(localStorage.getItem('kidTasticScores')) || [];
    if (id >= 0 && id < scores.length) {
        const playerName = scores[id].playerName;
        currentScoreId = id;
        document.getElementById('edit-player-name').value = playerName;
        
        const modal = document.getElementById('edit-modal');
        modal.classList.add('show');
        
        document.getElementById('edit-player-name').focus();
    }
}

// Close edit modal
function closeModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.remove('show');
}

// Save edited player name
function saveEdit() {
    const newName = document.getElementById('edit-player-name').value.trim();
    
    if (newName === '') {
        showToast('Player name cannot be empty!');
        return;
    }
    
    const scores = JSON.parse(localStorage.getItem('kidTasticScores')) || [];
    
    if (currentScoreId !== null && currentScoreId >= 0 && currentScoreId < scores.length) {
        scores[currentScoreId].playerName = newName;
        localStorage.setItem('kidTasticScores', JSON.stringify(scores));
        localStorage.setItem("playerName", newName);
        closeModal();
        loadScores();
        showToast('Player name updated!');
    }
}

// Delete score
function deleteScore(id) {
    const scores = JSON.parse(localStorage.getItem('kidTasticScores')) || [];
    
    if (id >= 0 && id < scores.length) {
        scores.splice(id, 1);
        localStorage.setItem('kidTasticScores', JSON.stringify(scores));
        loadScores();
        showToast('Score deleted!');
    }
}

// Show confirmation dialog
function showConfirmDialog(message, callback) {
    document.getElementById('confirm-message').textContent = message;
    window.confirmCallback = callback;
    
    const dialog = document.getElementById('confirm-dialog');
    dialog.classList.add('show');
}

// Close confirmation dialog
function closeConfirmDialog() {
    const dialog = document.getElementById('confirm-dialog');
    dialog.classList.remove('show');
}

// Confirm action
function confirmAction() {
    if (window.confirmCallback) {
        window.confirmCallback();
    }
    closeConfirmDialog();
}

// Toast notification
function showToast(message) {
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Settings Panel Functions
function openSettings() {
    document.getElementById("settings-panel").style.display = "flex";
}

function applySettings() {
    const musicVolume = localStorage.getItem("musicVolume") || 50;
    const sfxVolume = localStorage.getItem("sfxVolume") || 50;
    bgMusic.volume = musicVolume / 100;
    tapSound.volume = sfxVolume / 100;
}

function playClickSound(callback) {
    tapSound.currentTime = 0;
    tapSound.play().then(() => {
        setTimeout(callback, 300);
    }).catch(() => callback());
}