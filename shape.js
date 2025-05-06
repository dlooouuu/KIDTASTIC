// Load click sound
const clickSound = new Audio('Tap.mp3'); 
clickSound.preload = 'auto'; 

// Apply saved settings (Music & SFX)
function applySettings() {
    const musicVolume = localStorage.getItem("musicVolume") || 50;
    const sfxVolume = localStorage.getItem("sfxVolume") || 50;

    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.volume = musicVolume / 100;
        bgMusic.muted = musicVolume == 0;
    } else {
        requestAnimationFrame(applySettings); // Retry if bgMusic not yet available
    }

    clickSound.volume = sfxVolume / 100;

    const musicSlider = document.getElementById("music-volume");
    const sfxSlider = document.getElementById("sfx-volume");
    if (musicSlider) musicSlider.value = musicVolume;
    if (sfxSlider) sfxSlider.value = sfxVolume;
}

// Play click sound
function playClickSound(callback) {
    try {
        clickSound.currentTime = 0;
        clickSound.play().then(() => {
            setTimeout(callback, 300);
        }).catch(error => {
            console.log("Error playing sound:", error);
            callback(); // Fallback: execute callback even if sound fails
        });
    } catch (error) {
        console.log("Sound playback error:", error);
        callback(); // Fallback to callback
    }
}

// Start Game Function
function startGame(gameType) {
    playClickSound(() => {
        if (gameType === 'match') {
            window.location.href = 'match.html';
        } else if (gameType === 'guess') {
            window.location.href = 'guess-shape.html';
        } else if (gameType === 'puzzle') {
            window.location.href = 'shape-puzzle.html';
        } else if (gameType === 'sort') {
            window.location.href = 'shape-sort.html';
        }
    });
}

// Go Back
function goBack() {
    playClickSound(() => {
        window.location.href = 'pagsuway.html';
    });
}

// Open Settings
function openSettings() {
    playClickSound(() => {
        document.getElementById('settings-panel').style.display = 'flex';
    });
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    applySettings();

    // Minimize Settings Panel
    const minimizeBtn = document.getElementById("minimize-btn");
    if (minimizeBtn) {
        minimizeBtn.addEventListener("click", () => {
            playClickSound(() => {
                document.getElementById("settings-panel").style.display = "none";
            });
        });
    }

    // Open About Section
    const aboutBtn = document.getElementById("about-btn");
    if (aboutBtn) {
        aboutBtn.addEventListener("click", () => {
            playClickSound(() => {
                document.getElementById("about-section").style.display = "block";
            });
        });
    }

    // Minimize About Section
    const minimizeAboutBtn = document.getElementById("minimize-about-btn");
    if (minimizeAboutBtn) {
        minimizeAboutBtn.addEventListener("click", () => {
            playClickSound(() => {
                document.getElementById("about-section").style.display = "none";
            });
        });
    }

    // Exit Settings Panel
    const exitBtn = document.getElementById("exit-btn");
    if (exitBtn) {
        exitBtn.addEventListener("click", () => {
            playClickSound(() => {
                const confirmExit = confirm("Are you sure you want to exit the game?");
                if (confirmExit) {
                    const bgMusic = document.getElementById('bgMusic');
                    if (bgMusic) {
                        bgMusic.pause();
                        bgMusic.currentTime = 0;
                        localStorage.removeItem('bgMusicTime');
                    }
                    if (window.electronAPI && window.electronAPI.closeApp) {
                        window.electronAPI.closeApp();
                    } else {
                        window.close();
                    }
                }
            });
        });
    }

    // Logout Button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            playClickSound(() => {
                const confirmLogout = confirm("Are you sure you want to logout?");
                if (confirmLogout) {
                    try {
                        const settingsContent = document.querySelector('.settings-content');
                        if (settingsContent) {
                            const loadingMsg = document.createElement('div');
                            loadingMsg.className = 'logout-message';
                            loadingMsg.textContent = 'Logging out...';
                            settingsContent.appendChild(loadingMsg);
                            loadingMsg.classList.add('animated');
                        }
                        
                        localStorage.removeItem('current_teacher');
                        localStorage.removeItem('current_teacher_fullname');
                        
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1000);
                    } catch (error) {
                        console.error('Logout error:', error);
                        alert('Logout failed. Please try again.');
                        
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1000);
                    }
                }
            });
        });
    }

    // Adjust Music Volume
    const musicVolumeSlider = document.getElementById("music-volume");
    if (musicVolumeSlider) {
        musicVolumeSlider.addEventListener("input", function() {
            const volume = this.value;
            localStorage.setItem("musicVolume", volume);
            const bgMusic = document.getElementById('bgMusic');
            if (bgMusic) {
                bgMusic.volume = volume / 100;
                bgMusic.muted = volume == 0;
            }
        });
    }

    // Adjust SFX Volume
    const sfxVolumeSlider = document.getElementById("sfx-volume");
    if (sfxVolumeSlider) {
        sfxVolumeSlider.addEventListener("input", function() {
            const volume = this.value;
            localStorage.setItem("sfxVolume", volume);
            clickSound.volume = volume / 100;
        });
    }
});