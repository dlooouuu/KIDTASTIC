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

    document.getElementById("music-volume").value = musicVolume;
    document.getElementById("sfx-volume").value = sfxVolume;
}

// Play tap sound with callback
function playTapSound(callback) {
    tapSound.currentTime = 0;
    tapSound.play().then(() => {
        setTimeout(callback, 300);
    }).catch(error => {
        console.log("Error playing sound:", error);
        callback(); // Fallback: execute callback even if sound fails
    });
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
    minimizeBtn.addEventListener('click', function() {
        playTapSound(() => {
            settingsPanel.style.display = 'none';
            aboutSection.style.display = 'none';
        });
    });

    // Open About Section
    aboutBtn.addEventListener('click', function() {
        playTapSound(() => {
            aboutSection.style.display = 'block';
        });
    });

    // Minimize About Section
    minimizeAboutBtn.addEventListener('click', function() {
        playTapSound(() => {
            aboutSection.style.display = 'none';
        });
    });

    // Exit Settings Panel
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

    // Logout Button
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

    // Adjust Music Volume
    musicVolume.addEventListener('input', function() {
        const volume = this.value;
        localStorage.setItem('musicVolume', volume);
        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic) {
            bgMusic.volume = volume / 100;
            bgMusic.muted = volume == 0;
        }
    });

    // Adjust SFX Volume
    sfxVolume.addEventListener('input', function() {
        const volume = this.value;
        localStorage.setItem('sfxVolume', volume);
        tapSound.volume = volume / 100;
    });

    // Apply settings on load
    applySettings();
});