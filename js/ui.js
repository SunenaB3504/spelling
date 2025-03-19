// UI-related functionality
console.log('UI module loading');

// Create UI namespace
window.SpellingApp = window.SpellingApp || {};
SpellingApp.UI = {};

// Initialize UI
SpellingApp.UI.initUI = function() {
    // Set up basic event listeners
    this.setupEventListeners();
    
    // Initialize points displays
    this.updateAllPointsDisplays();
};

SpellingApp.UI.setupEventListeners = function() {
    // Level button event handlers
    if (SpellingApp.levelButtons.level1) {
        SpellingApp.levelButtons.level1.onclick = (e) => {
            e.preventDefault();
            SpellingApp.UI.changeLevel(1);
        };
    }
    
    if (SpellingApp.levelButtons.level2) {
        SpellingApp.levelButtons.level2.onclick = (e) => {
            e.preventDefault();
            SpellingApp.UI.changeLevel(2);
        };
    }
    
    if (SpellingApp.levelButtons.level3) {
        SpellingApp.levelButtons.level3.onclick = (e) => {
            e.preventDefault();
            SpellingApp.UI.changeLevel(3);
        };
    }

    // Set up section navigation buttons
    if (SpellingApp.buttons.startAssessment) {
        SpellingApp.buttons.startAssessment.onclick = (e) => {
            e.preventDefault();
            console.log('Start Assessment clicked');
            SpellingApp.UI.showSection('assessment');
            SpellingApp.state.currentWordIndex = 0;
            SpellingApp.Assessment.loadAssessmentWord();
        };
    }

    if (SpellingApp.buttons.playGame) {
        SpellingApp.buttons.playGame.onclick = (e) => {
            e.preventDefault();
            console.log('Play Game clicked');
            SpellingApp.UI.showSection('game');
            SpellingApp.state.currentWordIndex = 0;
            SpellingApp.Game.loadGameWord();
        };
    }
    
    if (SpellingApp.buttons.openGenerator) {
        SpellingApp.buttons.openGenerator.onclick = (e) => {
            e.preventDefault();
            console.log('Open Generator clicked');
            SpellingApp.UI.showSection('wordGenerator');
        };
    }
    
    if (SpellingApp.buttons.openRewards) {
        SpellingApp.buttons.openRewards.onclick = (e) => {
            e.preventDefault();
            console.log('Rewards Center clicked');
            SpellingApp.UI.showSection('rewardsCenter');
            SpellingApp.Rewards.initRewardsCenter();
        };
    }
    
    if (SpellingApp.buttons.settingsBtn) {
        SpellingApp.buttons.settingsBtn.onclick = (e) => {
            e.preventDefault();
            console.log('Settings clicked');
            SpellingApp.UI.showSection('settings');
        };
    }
    
    // Set up custom word generator
    if (SpellingApp.buttons.pronounceWord && SpellingApp.inputs.customWord) {
        SpellingApp.buttons.pronounceWord.onclick = (e) => {
            e.preventDefault();
            const word = SpellingApp.inputs.customWord.value.trim();
            if (word) {
                if (window.speechService && window.speechService.isSpeechSupported) {
                    SpellingApp.buttons.pronounceWord.disabled = true;
                    SpellingApp.buttons.pronounceWord.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Speaking...';
                    
                    window.speechService.speakWord(
                        word,
                        null,
                        () => {
                            SpellingApp.buttons.pronounceWord.disabled = false;
                            SpellingApp.buttons.pronounceWord.innerHTML = '<i class="fas fa-volume-up"></i> Pronounce';
                        },
                        () => {
                            SpellingApp.buttons.pronounceWord.disabled = false;
                            SpellingApp.buttons.pronounceWord.innerHTML = '<i class="fas fa-volume-up"></i> Pronounce';
                        }
                    );
                } else {
                    alert('Speech synthesis is not supported in your browser.');
                }
            }
        };
    }
    
    // Back buttons
    SpellingApp.backButtons.forEach(button => {
        button.onclick = (e) => {
            e.preventDefault();
            console.log('Back button clicked');
            SpellingApp.UI.showSection('dashboard');
        };
    });
    
    // Replay buttons for audio player
    SpellingApp.replayButtons.forEach(button => {
        button.onclick = (e) => {
            e.preventDefault();
            console.log('Replay button clicked');
            const audioPlayer = button.closest('.audio-player');
            if (audioPlayer) {
                const audio = audioPlayer.querySelector('audio');
                if (audio) {
                    // Find the current word
                    let currentWord;
                    if (audio.id === 'assessmentAudio' && SpellingApp.state.currentWordIndex < SpellingApp.assessmentWords.length) {
                        currentWord = SpellingApp.assessmentWords[SpellingApp.state.currentWordIndex];
                    } else if (audio.id === 'gameAudio' && SpellingApp.state.currentWordIndex < SpellingApp.gameWords.length) {
                        currentWord = SpellingApp.gameWords[SpellingApp.state.currentWordIndex];
                    }
                    
                    if (currentWord) {
                        SpellingApp.playWordAudio(audio, currentWord.word, currentWord.audio);
                    } else {
                        // Fallback to regular audio replay
                        audio.currentTime = 0;
                        audio.play();
                    }
                }
            }
        };
    });
};

// Update all points displays across the app
SpellingApp.UI.updateAllPointsDisplays = function() {
    // Get current points
    const points = SpellingApp.state.points;
    
    // Update main dashboard points
    if (SpellingApp.progress.points) {
        SpellingApp.progress.points.textContent = points;
    }
    
    // Update points in rewards center
    const rewardPoints = document.getElementById('rewardPoints');
    if (rewardPoints) {
        rewardPoints.textContent = points;
    }
    
    // Update points in all section headers
    const pointsValues = document.querySelectorAll('.points-value');
    pointsValues.forEach(element => {
        element.textContent = points;
    });
};

// Show the specified section
SpellingApp.UI.showSection = function(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Update points displays before showing the section
    this.updateAllPointsDisplays();
    
    // Hide all sections
    Object.values(SpellingApp.sections).forEach(s => {
        if (s) {
            s.classList.remove('active');
            s.classList.add('hidden');
        }
    });
    
    // Show the requested section
    if (SpellingApp.sections[sectionName]) {
        SpellingApp.sections[sectionName].classList.remove('hidden');
        SpellingApp.sections[sectionName].classList.add('active');
    }

    // If showing rewards center, initialize it
    if (sectionName === 'rewardsCenter') {
        SpellingApp.Rewards.initRewardsCenter();
    }
};

// Function to update level UI
SpellingApp.UI.updateLevelUI = function() {
    // Update the level display
    if (SpellingApp.progress.level) {
        SpellingApp.progress.level.textContent = SpellingApp.state.currentLevel;
    }
    
    // Update level buttons
    Object.keys(SpellingApp.levelButtons).forEach((key, index) => {
        if (SpellingApp.levelButtons[key]) {
            if (index + 1 === SpellingApp.state.currentLevel) {
                SpellingApp.levelButtons[key].classList.add('active');
            } else {
                SpellingApp.levelButtons[key].classList.remove('active');
            }
        }
    });
};

// Function to change levels
SpellingApp.UI.changeLevel = function(level) {
    SpellingApp.state.currentLevel = level;
    localStorage.setItem('spellingLevel', level);
    
    if (window.wordLists) {
        SpellingApp.assessmentWords = window.wordLists.getAssessmentWordsByLevel(level);
        console.log(`Changed to level ${level} with ${SpellingApp.assessmentWords.length} words`);
    }
    
    this.updateLevelUI();
    SpellingApp.updateProgress();
};

// Show notification
SpellingApp.UI.showNotification = function(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set content and type
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
};
