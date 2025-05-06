let bgMusic = null;

function initializeMusic() {
    // Create audio element if it doesn't exist
    if (!bgMusic) {
        bgMusic = document.createElement('audio');
        bgMusic.id = 'bgMusic';
        bgMusic.loop = true;
        bgMusic.src = 'bgmusic.mp3';
        bgMusic.style.display = 'none';
        document.body.appendChild(bgMusic);

        // Restore saved playback position
        const savedTime = localStorage.getItem('bgMusicTime') || 0;
        bgMusic.currentTime = parseFloat(savedTime);

        // Set volume from localStorage
        const savedMusicVolume = localStorage.getItem('musicVolume') || 50;
        bgMusic.volume = savedMusicVolume / 100;
        bgMusic.muted = savedMusicVolume == 0;

        // Play if not already playing
        if (!bgMusic.hasAttribute('data-started') && bgMusic.paused) {
            bgMusic.play().catch(err => console.log('Background music playback failed:', err));
            bgMusic.setAttribute('data-started', 'true');
        }
    }
}

// Save current time before page unloads
window.addEventListener('beforeunload', () => {
    if (bgMusic && !bgMusic.paused) {
        localStorage.setItem('bgMusicTime', bgMusic.currentTime);
    }
});

// Initialize music immediately and on DOM content loaded
initializeMusic();
document.addEventListener('DOMContentLoaded', initializeMusic);

// Log stop music event but don't pause
if (window.electronAPI) {
    window.electronAPI.onStopMusic(() => {
        console.log('Stop music event received, but keeping music playing');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded!");

    // Audio element for tap sound
    const tapSound = new Audio('Tap.mp3');
    
    function playTapSound() {
        tapSound.currentTime = 0;
        tapSound.play().catch(err => console.error('Error playing tap sound:', err));
    }

    const video = document.getElementById('background-video');
    
    function ensureVideoPlays() {
        if (video) {
            console.log('Background video element found');
            video.addEventListener('loadeddata', () => {
                console.log('Video loaded successfully!');
                video.play().then(() => console.log('Video playback started successfully'))
                          .catch(err => console.error('Error playing video:', err));
            });
            video.addEventListener('error', (e) => {
                console.error('Video error:', e);
                setTimeout(() => {
                    console.log('Attempting to reload video after error');
                    video.load();
                }, 1000);
            });
            if (video.readyState >= 3) {
                console.log('Video already loaded, ensuring playback');
                video.play().then(() => console.log('Video playback started successfully'))
                           .catch(err => console.error('Error playing video:', err));
            } else {
                console.log('Loading video');
                video.load();
            }
        }
    }
    
    if (video) {
        ensureVideoPlays();
        setTimeout(ensureVideoPlays, 500);
    }

    const startBtn = document.getElementById('start-btn');
    const welcomeSection = document.querySelector('.welcome-section');
    const optionsPage = document.getElementById('options-page');
    const signupContainer = document.getElementById('signup-container');
    const loginContainer = document.getElementById('login-container');
    const showLoginBtn = document.getElementById('show-login');
    const showSignupBtn = document.getElementById('show-signup');
    const reqUsername = document.getElementById('req-username');
    const reqPassword = document.getElementById('req-password');
    const reqFields = document.getElementById('req-fields');
    const signupUsername = document.getElementById('signup-username');
    const signupPassword = document.getElementById('signup-password');
    const signupFullname = document.getElementById('signup-fullname');

    function optimizeForSwift3() {
        if (window.innerWidth <= 1920 && window.innerHeight <= 1080) {
            console.log("Detected Acer Swift 3 dimensions, optimizing layout");
        }
    }
    
    optimizeForSwift3();
    window.addEventListener('resize', optimizeForSwift3);

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            playTapSound();
            console.log("Start button clicked!");
            welcomeSection.style.display = 'none';
            optionsPage.style.display = 'block';
            signupContainer.classList.add('active-form');
            loginContainer.classList.remove('active-form');
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            playTapSound();
            signupContainer.classList.remove('active-form');
            loginContainer.classList.add('active-form');
        });
    }

    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', () => {
            playTapSound();
            loginContainer.classList.remove('active-form');
            signupContainer.classList.add('active-form');
        });
    }

    function validateRequirements() {
        if (signupUsername && signupUsername.value.length >= 5) {
            reqUsername.classList.add('valid');
        } else if (reqUsername) {
            reqUsername.classList.remove('valid');
        }
        
        if (signupPassword && signupPassword.value.length >= 6) {
            reqPassword.classList.add('valid');
        } else if (reqPassword) {
            reqPassword.classList.remove('valid');
        }
        
        if (signupUsername && signupPassword && signupFullname && 
            signupUsername.value.trim() && 
            signupPassword.value.trim() && 
            signupFullname.value.trim()) {
            reqFields.classList.add('valid');
        } else if (reqFields) {
            reqFields.classList.remove('valid');
        }
    }

    if (signupUsername && signupPassword && signupFullname && reqUsername && reqPassword && reqFields) {
        signupUsername.addEventListener('input', validateRequirements);
        signupPassword.addEventListener('input', validateRequirements);
        signupFullname.addEventListener('input', validateRequirements);
        validateRequirements();
    }

    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', async () => {
            playTapSound();
            if (!signupUsername || !signupPassword || !signupFullname) return;
            
            const username = signupUsername.value.trim();
            const password = signupPassword.value.trim();
            const fullname = signupFullname.value.trim();
            const msgElement = document.getElementById('signup-msg');

            if (!msgElement) return;

            if (username.length < 5) {
                msgElement.innerText = 'Username must be at least 5 characters! 🙏';
                msgElement.style.color = '#ff7675';
                return;
            }
            
            if (password.length < 6) {
                msgElement.innerText = 'Password must be at least 6 characters! 🙏';
                msgElement.style.color = '#ff7675';
                return;
            }
            
            if (!username || !password || !fullname) {
                msgElement.innerText = 'All fields must be filled! 🙏';
                msgElement.style.color = '#ff7675';
                return;
            }

            try {
                msgElement.innerText = 'Processing...';
                msgElement.style.color = '#636e72';
                
                localStorage.setItem(`teacher_${username}_fullname`, fullname);
                localStorage.setItem(`teacher_${username}_password`, password);
                
                if (window.electronAPI) {
                    const msg = await window.electronAPI.signup(username, password, fullname);
                    msgElement.innerText = msg || 'User registered successfully!';
                    
                    if (msg === 'User registered successfully!' || !msg) {
                        msgElement.style.color = '#00b894';
                        celebrateSuccess();
                        setTimeout(() => {
                            signupContainer.classList.remove('active-form');
                            loginContainer.classList.add('active-form');
                            const loginMsg = document.getElementById('login-msg');
                            if (loginMsg) {
                                loginMsg.innerText = 'Account created! Please log in now.';
                                loginMsg.style.color = '#00b894';
                            }
                        }, 2000);
                    } else {
                        msgElement.style.color = '#ff7675';
                    }
                } else {
                    msgElement.innerText = 'User registered successfully!';
                    msgElement.style.color = '#00b894';
                    celebrateSuccess();
                    setTimeout(() => {
                        signupContainer.classList.remove('active-form');
                        loginContainer.classList.add('active-form');
                        const loginMsg = document.getElementById('login-msg');
                        if (loginMsg) {
                            loginMsg.innerText = 'Account created! Please log in now.';
                            loginMsg.style.color = '#00b894';
                        }
                    }, 2000);
                }
            } catch (error) {
                console.error('Signup error:', error);
                msgElement.innerText = 'Something went wrong 😢';
                msgElement.style.color = '#ff7675';
            }
        });
    }

    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const rememberMeCheckbox = document.getElementById('remember-me');

    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            playTapSound();
            const usernameInput = document.getElementById('login-username');
            const passwordInput = document.getElementById('login-password');
            const msgElement = document.getElementById('login-msg');
            
            if (!usernameInput || !passwordInput || !msgElement) return;
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const rememberMe = rememberMeCheckbox && rememberMeCheckbox.checked;

            if (!username || !password) {
                msgElement.innerText = 'Please fill in all fields 🙏';
                msgElement.style.color = '#ff7675';
                return;
            }

            try {
                msgElement.innerText = 'Processing...';
                msgElement.style.color = '#636e72';
                
                let loginSuccess = false;
                let userData = null;
                
                if (window.electronAPI) {
                    try {
                        const response = await window.electronAPI.login(username, password, rememberMe);
                        if (response && response.status === 'success') {
                            loginSuccess = true;
                            userData = response.userData;
                        } else if (response) {
                            msgElement.innerText = response.message || 'Login failed. Please check your credentials.';
                            msgElement.style.color = '#ff7675';
                        }
                    } catch (e) {
                        console.error('API login error:', e);
                        const storedPassword = localStorage.getItem(`teacher_${username}_password`);
                        const fullname = localStorage.getItem(`teacher_${username}_fullname`);
                        
                        if (storedPassword === password && fullname) {
                            loginSuccess = true;
                            userData = { username, fullname };
                        } else {
                            msgElement.innerText = 'Login failed. Please check your credentials.';
                            msgElement.style.color = '#ff7675';
                        }
                    }
                } else {
                    const storedPassword = localStorage.getItem(`teacher_${username}_password`);
                    const fullname = localStorage.getItem(`teacher_${username}_fullname`);
                    
                    if (storedPassword === password && fullname) {
                        loginSuccess = true;
                        userData = { username, fullname };
                    } else {
                        msgElement.innerText = 'Login failed. Please check your credentials.';
                        msgElement.style.color = '#ff7675';
                    }
                }
                
                if (loginSuccess && userData) {
                    msgElement.innerText = 'Login successful! 🎉';
                    msgElement.style.color = '#00b894';
                    celebrateSuccess();
                    
                    if (loginBtn) loginBtn.style.display = 'none';
                    if (logoutBtn) logoutBtn.style.display = 'block';
                    
                    localStorage.setItem('current_teacher', userData.username);
                    localStorage.setItem('current_teacher_fullname', userData.fullname || 'Teacher');
                    
                    setTimeout(() => {
                        window.location.href = 'pagsuway.html';
                    }, 2000);
                }
            } catch (error) {
                console.error('Login error:', error);
                msgElement.innerText = 'Something went wrong 😢';
                msgElement.style.color = '#ff7675';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            playTapSound();
            try {
                localStorage.removeItem('current_teacher');
                localStorage.removeItem('current_teacher_fullname');
                
                if (window.electronAPI) {
                    try {
                        const msg = await window.electronAPI.logout();
                        console.log('Logout message:', msg);
                    } catch (e) {
                        console.error('API logout error:', e);
                    }
                }
                
                const msgElement = document.getElementById('login-msg');
                if (msgElement) {
                    msgElement.innerText = 'Logged out successfully!';
                    msgElement.style.color = '#00b894';
                    
                    setTimeout(() => {
                        msgElement.innerText = 'Please log in again';
                        msgElement.style.color = '#636e72';
                    }, 2000);
                }
                
                const usernameInput = document.getElementById('login-username');
                const passwordInput = document.getElementById('login-password');
                
                if (usernameInput) usernameInput.value = '';
                if (passwordInput) passwordInput.value = '';
                if (rememberMeCheckbox) rememberMeCheckbox.checked = false;
                
                if (loginBtn) loginBtn.style.display = 'block';
                if (logoutBtn) logoutBtn.style.display = 'none';
                
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('Logout error:', error);
                const msgElement = document.getElementById('login-msg');
                if (msgElement) {
                    msgElement.innerText = 'Logout failed 😢';
                    msgElement.style.color = '#ff7675';
                }
            }
        });
    }

    const currentTeacher = localStorage.getItem('current_teacher');
    const currentTeacherFullname = localStorage.getItem('current_teacher_fullname');
    
    if (currentTeacher && currentTeacherFullname) {
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'pagsuway.html';
        }
    } else {
        if (window.location.pathname.includes('pagsuway.html')) {
            window.location.href = 'login.html';
        }
    }

    if (window.electronAPI) {
        window.electronAPI.onAutoLogin((event, userData) => {
            localStorage.setItem('current_teacher', userData.username);
            localStorage.setItem('current_teacher_fullname', userData.fullname);
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'pagsuway.html';
            }
        });
    }

    function celebrateSuccess() {
        const container = document.querySelector('.container');
        if (!container) return;
        
        const confettiElements = [];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            container.appendChild(confetti);
            confettiElements.push(confetti);
        }
        
        setTimeout(() => {
            confettiElements.forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
        }, 5000);
    }

    const oldConfetti = document.querySelectorAll('.confetti');
    oldConfetti.forEach(element => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const activeSignup = document.querySelector('#signup-container.active-form');
            const activeLogin = document.querySelector('#login-container.active-form');
            
            if (activeSignup && signupBtn) {
                playTapSound();
                signupBtn.click();
            } else if (activeLogin && loginBtn) {
                playTapSound();
                loginBtn.click();
            }
        }
    });
});