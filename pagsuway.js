document.addEventListener("DOMContentLoaded", () => {
    const currentTeacher = localStorage.getItem('current_teacher');
    const currentTeacherFullname = localStorage.getItem('current_teacher_fullname');
    
    if (!currentTeacher || !currentTeacherFullname) {
        window.location.href = 'login.html';
        return;
    }
    
    const teacherNameElement = document.getElementById('teacher-name');
    if (teacherNameElement) {
        teacherNameElement.textContent = currentTeacherFullname;
    }
    
    const clickSound = new Audio('Tap.mp3');
    clickSound.preload = 'auto';
    
    // Initialize volumes
    const savedSfxVolume = localStorage.getItem('sfxVolume') || 70;
    const savedMusicVolume = localStorage.getItem('musicVolume') || 50;
    
    clickSound.volume = savedSfxVolume / 100;

    function updateMusicVolume() {
        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic) {
            bgMusic.volume = savedMusicVolume / 100;
            bgMusic.muted = savedMusicVolume == 0;
        } else {
            setTimeout(updateMusicVolume, 100); // Retry if bgMusic not found
        }
    }

    updateMusicVolume();

    // Play tap sound with no delay
    function playTapSound(url, callback) {
        try {
            clickSound.currentTime = 0;
            clickSound.play().then(() => {
                if (url) window.location.href = url;
                if (callback) callback();
            }).catch(error => {
                console.log("Error playing sound:", error);
                if (url) window.location.href = url;
                if (callback) callback();
            });
        } catch (error) {
            console.log("Sound playback error:", error);
            if (url) window.location.href = url;
            if (callback) callback();
        }
    }

    const sfxVolumeSlider = document.getElementById("sfx-volume");
    const musicVolumeSlider = document.getElementById("music-volume");
    
    if (sfxVolumeSlider) {
        sfxVolumeSlider.value = savedSfxVolume;
        sfxVolumeSlider.addEventListener("input", (event) => {
            const sfxVolume = event.target.value / 100;
            clickSound.volume = sfxVolume;
            localStorage.setItem('sfxVolume', event.target.value);
            clickSound.muted = sfxVolume === 0;
            if (!clickSound.muted) {
                playTapSound(null, () => {});
            }
        });
    }
    
    if (musicVolumeSlider) {
        musicVolumeSlider.value = savedMusicVolume;
        musicVolumeSlider.addEventListener("input", (event) => {
            const musicVolume = event.target.value / 100;
            const bgMusic = document.getElementById('bgMusic');
            if (bgMusic) {
                bgMusic.volume = musicVolume;
                bgMusic.muted = musicVolume === 0;
            }
            localStorage.setItem('musicVolume', event.target.value);
        });
    }

    // Category Buttons
    const shapesBtn = document.getElementById("shapes-btn");
    if (shapesBtn) {
        shapesBtn.addEventListener("click", () => playTapSound('shape.html', null));
    }

    const colorsBtn = document.getElementById("colors-btn");
    if (colorsBtn) {
        colorsBtn.addEventListener("click", () => playTapSound('color.html', null));
    }

    const numbersBtn = document.getElementById("numbers-btn");
    if (numbersBtn) {
        numbersBtn.addEventListener("click", () => playTapSound('number.html', null));
    }

    const lettersBtn = document.getElementById("letters-btn");
    if (lettersBtn) {
        lettersBtn.addEventListener("click", () => playTapSound('letters.html', null));
    }

    // Score Button and Password Modal
    const scoreBtn = document.getElementById("score-btn");
    const passwordModal = document.getElementById("password-modal");
    const passwordInput = document.getElementById("password-input");
    const submitPasswordBtn = document.getElementById("submit-password-btn");
    const cancelPasswordBtn = document.getElementById("cancel-password-btn");
    const wrongPasswordModal = document.getElementById("wrong-password-modal");
    const closeWrongPasswordBtn = document.getElementById("close-wrong-password-btn");

    if (scoreBtn) {
        scoreBtn.addEventListener("click", () => {
            playTapSound(null, () => {
                if (passwordModal) {
                    passwordModal.classList.remove("hidden");
                    if (passwordInput) {
                        passwordInput.value = "";
                        passwordInput.focus();
                    }
                }
            });
        });
    }

    if (submitPasswordBtn) {
        submitPasswordBtn.addEventListener("click", () => {
            playTapSound(null, async () => {
                const enteredPassword = passwordInput ? passwordInput.value.trim() : "";
                if (enteredPassword === "") {
                    if (wrongPasswordModal) {
                        wrongPasswordModal.classList.remove("hidden");
                    }
                    return;
                }

                try {
                    const isValid = await window.electronAPI.validatePassword(currentTeacher, enteredPassword);
                    if (isValid) {
                        window.location.href = 'scorer.html';
                    } else {
                        if (wrongPasswordModal) {
                            wrongPasswordModal.classList.remove("hidden");
                        }
                        if (passwordInput) {
                            passwordInput.value = "";
                            passwordInput.focus();
                        }
                    }
                } catch (error) {
                    console.error("Password validation error:", error);
                    if (wrongPasswordModal) {
                        wrongPasswordModal.classList.remove("hidden");
                    }
                }
            });
        });
    }

    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener("click", () => {
            playTapSound(null, () => {
                if (passwordModal) {
                    passwordModal.classList.add("hidden");
                }
            });
        });
    }

    if (closeWrongPasswordBtn) {
        closeWrongPasswordBtn.addEventListener("click", () => {
            playTapSound(null, () => {
                if (wrongPasswordModal) {
                    wrongPasswordModal.classList.add("hidden");
                }
                if (passwordModal) {
                    passwordModal.classList.remove("hidden");
                    if (passwordInput) {
                        passwordInput.focus();
                    }
                }
            });
        });
    }

    // Settings Button
    const settingsBtn = document.getElementById("settings-btn");
    const settingsPanel = document.getElementById("settings-panel");
    if (settingsBtn && settingsPanel) {
        settingsBtn.addEventListener("click", () => {
            playTapSound(null, () => {
                settingsPanel.style.display = "flex";
            });
        });
    }

    // Minimize Button
    const minimizeBtn = document.getElementById("minimize-btn");
    if (minimizeBtn && settingsPanel) {
        minimizeBtn.addEventListener("click", () => {
            playTapSound(null, () => {
                settingsPanel.style.display = "none";
            });
        });
    }

    // About Button
    const aboutBtn = document.getElementById("about-btn");
    const aboutSection = document.getElementById("about-section");
    if (aboutBtn && aboutSection) {
        aboutBtn.addEventListener("click", () => {
            playTapSound(null, () => {
                aboutSection.style.display = "block";
            });
        });
    }

    // About Minimize Button
    const minimizeAboutBtn = document.getElementById("minimize-about-btn");
    if (minimizeAboutBtn && aboutSection) {
        minimizeAboutBtn.addEventListener("click", () => {
            playTapSound(null, () => {
                aboutSection.style.display = "none";
            });
        });
    }

    // Exit Button
    const exitBtn = document.getElementById("exit-btn");
    if (exitBtn) {
        exitBtn.addEventListener("click", () => {
            playTapSound(null, () => {
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
            });
        });
    }

    // Logout Button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            playTapSound(null, () => {
                localStorage.removeItem('current_teacher');
                localStorage.removeItem('current_teacher_fullname');
                window.location.href = 'login.html';
            });
        });
    }
});