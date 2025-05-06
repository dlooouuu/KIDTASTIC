// Load tap sound
const tapSound = new Audio('Tap.mp3');
tapSound.preload = 'auto';

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

    tapSound.volume = sfxVolume / 100;

    const musicVolumeSlider = document.getElementById("music-volume");
    const sfxVolumeSlider = document.getElementById("sfx-volume");
    if (musicVolumeSlider) musicVolumeSlider.value = musicVolume;
    if (sfxVolumeSlider) sfxVolumeSlider.value = sfxVolume;
}

// Play tap sound with no delay
function playTapSound(callback) {
    try {
        tapSound.currentTime = 0;
        tapSound.play().then(() => {
            callback(); // Execute callback immediately after sound starts
        }).catch(error => {
            console.log("Error playing sound:", error);
            callback(); // Execute callback even if sound fails
        });
    } catch (error) {
        console.log("Sound playback error:", error);
        callback(); // Fallback to callback
    }
}

// Go Back
function goBack() {
    playTapSound(() => {
        window.location.href = 'pagsuway.html';
    });
}

// Open Settings
function openSettings() {
    playTapSound(() => {
        document.getElementById('settingsPanel').style.display = 'flex';
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    applySettings();

    const settingsPanel = document.getElementById('settingsPanel');
    const minimizeBtn = document.getElementById('minimizeBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const aboutSection = document.getElementById('aboutSection');
    const minimizeAboutBtn = document.getElementById('minimizeAboutBtn');
    const exitBtn = document.getElementById('exitBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const musicVolume = document.getElementById('music-volume');
    const sfxVolume = document.getElementById('sfx-volume');

    // Minimize Settings Panel
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', function() {
            playTapSound(() => {
                settingsPanel.style.display = 'none';
                aboutSection.style.display = 'none';
            });
        });
    }

    // Open About Section
    if (aboutBtn) {
        aboutBtn.addEventListener('click', function() {
            playTapSound(() => {
                aboutSection.style.display = 'block';
            });
        });
    }

    // Minimize About Section
    if (minimizeAboutBtn) {
        minimizeAboutBtn.addEventListener('click', function() {
            playTapSound(() => {
                aboutSection.style.display = 'none';
            });
        });
    }

    // Exit Settings Panel
    if (exitBtn) {
        exitBtn.addEventListener('click', function() {
            playTapSound(() => {
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
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            playTapSound(() => {
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
    if (musicVolume) {
        musicVolume.addEventListener('input', function() {
            const volume = this.value;
            localStorage.setItem('musicVolume', volume);
            const bgMusic = document.getElementById('bgMusic');
            if (bgMusic) {
                bgMusic.volume = volume / 100;
                bgMusic.muted = volume == 0;
            }
        });
    }

    // Adjust SFX Volume
    if (sfxVolume) {
        sfxVolume.addEventListener('input', function() {
            const volume = this.value;
            localStorage.setItem('sfxVolume', volume);
            tapSound.volume = volume / 100;
        });
    }
});