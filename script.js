// Add debug logging
console.log('Script loading started');

// Global variables
let currentLevel = 1;
let points = 0;
let badges = [];
let currentWordIndex = 0;
let correctStreak = 0;  // Track consecutive correct answers

// Points configuration
const pointsConfig = {
    baseAssessment: 10,    // Base points for assessment
    baseGame: 15,          // Base points for game
    levelMultipliers: [1, 1.5, 2],  // Level 1, 2, 3 multipliers
    levelThresholds: [100, 250, 400],  // Points needed to unlock levels
    streakBonus: 5        // Bonus for consecutive correct answers
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing app');
    
    // Initialize word lists from the wordLists.js file
    let assessmentWords = [];
    let gameWords = [];
    
    if (window.wordLists) {
        // Set up assessment words based on current level
        assessmentWords = window.wordLists.getAssessmentWordsByLevel(currentLevel);
        
        // Set up game words (using animals theme for now)
        gameWords = window.wordLists.game.animals;
        
        console.log(`Loaded ${assessmentWords.length} assessment words and ${gameWords.length} game words`);
    } else {
        console.warn('Word lists not loaded, using fallback words');
        // Fallback to basic words if wordLists.js failed to load
        assessmentWords = [
            { word: "cat", audio: "assets/audio/words/cat.mp3" },
            { word: "dog", audio: "assets/audio/words/dog.mp3" },
            { word: "fish", audio: "assets/audio/words/fish.mp3" }
        ];
        
        gameWords = [
            { word: "cake", audio: "assets/audio/words/cake.mp3" },
            { word: "bird", audio: "assets/audio/words/bird.mp3" },
            { word: "jump", audio: "assets/audio/words/jump.mp3" }
        ];
    }
    
    // DOM Elements
    const sections = {
        dashboard: document.getElementById('dashboard'),
        assessment: document.getElementById('assessment'),
        game: document.getElementById('game'),
        settings: document.getElementById('settings'),
        wordGenerator: document.getElementById('wordGenerator')
    };

    const buttons = {
        startAssessment: document.getElementById('startAssessment'),
        playGame: document.getElementById('playGame'),
        openGenerator: document.getElementById('openGenerator'),
        submitAssessment: document.getElementById('submitAssessment'),
        submitGame: document.getElementById('submitGame'),
        nextWord: document.getElementById('nextWord'),
        settingsBtn: document.getElementById('settingsBtn'),
        saveSettings: document.getElementById('saveSettings'),
        pronounceWord: document.getElementById('pronounceWord')
    };

    const inputs = {
        assessment: document.getElementById('assessmentInput'),
        game: document.getElementById('gameInput'),
        customWord: document.getElementById('customWord')
    };

    const feedback = {
        assessment: document.getElementById('assessmentFeedback'),
        game: document.getElementById('gameFeedback')
    };

    const audio = {
        assessment: document.getElementById('assessmentAudio'),
        game: document.getElementById('gameAudio')
    };

    const progress = {
        level: document.getElementById('level'),
        points: document.getElementById('points'),
        badges: document.getElementById('badges')
    };

    const backButtons = document.querySelectorAll('.btn-back');
    const replayButtons = document.querySelectorAll('.replay-btn');

    // Add level selector buttons
    const levelButtons = {
        level1: document.getElementById('level1Btn'),
        level2: document.getElementById('level2Btn'),
        level3: document.getElementById('level3Btn')
    };
    
    // Print debug info for important buttons
    console.log('Button states:', {
        startAssessment: !!buttons.startAssessment,
        playGame: !!buttons.playGame, 
        openGenerator: !!buttons.openGenerator,
        settingsBtn: !!buttons.settingsBtn
    });
    
    // CORE FUNCTIONS

    function showSection(section) {
        console.log('Showing section:', section);
        // Hide all sections
        Object.values(sections).forEach(s => {
            if (s) {
                s.classList.remove('active');
                s.classList.add('hidden');
            }
        });
        
        // Show the requested section
        if (sections[section]) {
            sections[section].classList.remove('hidden');
            sections[section].classList.add('active');
        }
    }

    // Calculate points based on level and mode
    function calculatePoints(isCorrect, isGame) {
        if (!isCorrect) {
            correctStreak = 0;
            return 0;
        }
        
        // Get base points based on mode
        const basePoints = isGame ? pointsConfig.baseGame : pointsConfig.baseAssessment;
        
        // Apply level multiplier (levels are 1-indexed, array is 0-indexed)
        const multiplier = pointsConfig.levelMultipliers[currentLevel - 1] || 1;
        
        // Calculate streak bonus
        correctStreak++;
        const streakBonus = correctStreak >= 3 ? pointsConfig.streakBonus : 0;
        
        // Calculate total points
        const earnedPoints = Math.round(basePoints * multiplier + streakBonus);
        
        return earnedPoints;
    }

    // Save progress data to localStorage
    function saveProgress() {
        localStorage.setItem('spellingPoints', points);
        localStorage.setItem('spellingBadges', JSON.stringify(badges));
        localStorage.setItem('spellingLevel', currentLevel);
        console.log('Progress saved:', {points, badges, level: currentLevel});
    }

    // Check if user can advance to next level based on points
    function checkLevelAdvancement() {
        if (currentLevel < pointsConfig.levelThresholds.length && 
            points >= pointsConfig.levelThresholds[currentLevel - 1]) {
            
            // Only advance if not already at max level
            if (currentLevel < 3) {
                currentLevel++;
                
                // Show level up notification
                const levelUpMsg = `Congratulations! You've reached Level ${currentLevel}!`;
                showNotification(levelUpMsg, 'success');
                
                // Save level progress
                localStorage.setItem('spellingLevel', currentLevel);
                
                // Update word lists for the new level
                if (window.wordLists) {
                    assessmentWords = window.wordLists.getAssessmentWordsByLevel(currentLevel);
                }
                
                // Update UI
                updateLevelUI();
                updateProgress();
                
                return true;
            }
        }
        return false;
    }

    // Show notification
    function showNotification(message, type = 'info') {
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
    }

    function updateProgress() {
        if (progress.level) progress.level.textContent = currentLevel;
        if (progress.points) progress.points.textContent = points;
        if (progress.badges) progress.badges.textContent = badges.length ? badges.join(', ') : 'None';
        
        // Update level progress bar
        const progressBar = document.getElementById('levelProgressBar');
        const currentPointsElem = document.getElementById('currentPoints');
        const nextLevelPointsElem = document.getElementById('nextLevelPoints');
        
        if (progressBar && currentPointsElem && nextLevelPointsElem) {
            // Get points needed for next level
            const nextLevelThreshold = currentLevel < 3 ? pointsConfig.levelThresholds[currentLevel - 1] : Infinity;
            const prevLevelThreshold = currentLevel > 1 ? pointsConfig.levelThresholds[currentLevel - 2] : 0;
            
            // Calculate progress percentage (ensure we start from 0 for each level)
            const totalPointsInLevel = nextLevelThreshold - prevLevelThreshold;
            const pointsEarnedInLevel = Math.max(0, points - prevLevelThreshold); // Never show negative points
            const percentage = Math.min(100, (pointsEarnedInLevel / totalPointsInLevel) * 100);
            
            // Update UI
            progressBar.style.width = `${percentage}%`;
            currentPointsElem.textContent = pointsEarnedInLevel; // Show points earned in current level
            nextLevelPointsElem.textContent = totalPointsInLevel;
            
            // Animate points if changed
            progress.points.classList.remove('points-earned');
            void progress.points.offsetWidth; // Force reflow to restart animation
            progress.points.classList.add('points-earned');
        }
        
        updateLevelUI();
        
        // Save progress to localStorage whenever it's updated
        saveProgress();
    }

    // Function to update level UI
    function updateLevelUI() {
        // Update the level display
        if (progress.level) progress.level.textContent = currentLevel;
        
        // Update level buttons
        Object.keys(levelButtons).forEach((key, index) => {
            if (levelButtons[key]) {
                if (index + 1 === currentLevel) {
                    levelButtons[key].classList.add('active');
                } else {
                    levelButtons[key].classList.remove('active');
                }
            }
        });
    }
    
    // Handle level button clicks
    if (levelButtons.level1) {
        levelButtons.level1.onclick = function(event) {
            event.preventDefault();
            changeLevel(1);
        };
    }
    
    if (levelButtons.level2) {
        levelButtons.level2.onclick = function(event) {
            event.preventDefault();
            changeLevel(2);
        };
    }
    
    if (levelButtons.level3) {
        levelButtons.level3.onclick = function(event) {
            event.preventDefault();
            changeLevel(3);
        };
    }
    
    // Function to change levels
    function changeLevel(level) {
        currentLevel = level;
        localStorage.setItem('spellingLevel', currentLevel);
        
        // Reset points counter for UI display if manually changing levels
        // Note: This doesn't reset the actual points earned
        
        if (window.wordLists) {
            assessmentWords = window.wordLists.getAssessmentWordsByLevel(currentLevel);
            console.log(`Changed to level ${currentLevel} with ${assessmentWords.length} words`);
        }
        
        updateLevelUI();
        updateProgress(); // This will update the progress bar with correct level-specific progress
    }

    function preloadAudio() {
        // Preload assessment words audio
        assessmentWords.forEach(wordObj => {
            const audio = new Audio();
            audio.src = wordObj.audio;
        });
        
        // Preload game words audio
        gameWords.forEach(wordObj => {
            const audio = new Audio();
            audio.src = wordObj.audio;
        });
        
        console.log('Audio files preloaded');
    }

    // Play word audio using AI speech synthesis when available
    function playWordAudio(audioElement, word, audioFilePath) {
        if (window.speechService && window.speechService.isSpeechSupported) {
            // Use AI speech synthesis
            const speakButton = audioElement.nextElementSibling;
            if (speakButton) speakButton.classList.add('speaking');
            
            window.speechService.speakWord(
                word,
                () => {
                    // Speech started
                    audioElement.dispatchEvent(new Event('play'));
                },
                () => {
                    // Speech ended
                    audioElement.dispatchEvent(new Event('ended'));
                    if (speakButton) speakButton.classList.remove('speaking');
                },
                () => {
                    // Error occurred - fall back to audio file
                    if (speakButton) speakButton.classList.remove('speaking');
                    audioElement.src = audioFilePath;
                    audioElement.play();
                }
            );
        } else {
            // Fall back to audio file
            audioElement.src = audioFilePath;
            audioElement.play();
        }
    }

    // Assessment functionality
    function loadAssessmentWord() {
        if (currentWordIndex < assessmentWords.length) {
            const currentWord = assessmentWords[currentWordIndex];
            console.log(`Loading assessment word: ${currentWord.word}`);
            // Set the audio source for browsers that don't support speech
            if (audio.assessment) audio.assessment.src = currentWord.audio;
            if (inputs.assessment) inputs.assessment.value = '';
            if (feedback.assessment) feedback.assessment.textContent = '';
            
            // Auto-play the word with AI if available
            setTimeout(() => {
                if (audio.assessment) {
                    playWordAudio(audio.assessment, currentWord.word, currentWord.audio);
                }
            }, 500);
        } else {
            completeAssessment();
        }
    }
    
    function completeAssessment() {
        if (feedback.assessment) {
            const wordsCount = assessmentWords.length;
            const correctPercentage = (points / (wordsCount * pointsConfig.baseAssessment * pointsConfig.levelMultipliers[currentLevel - 1])) * 100;
            
            if (correctPercentage >= 80) {
                checkLevelAdvancement();
                feedback.assessment.textContent = `Great job! You've completed the assessment with ${Math.round(correctPercentage)}% accuracy.`;
            } else {
                feedback.assessment.textContent = 'Assessment complete! Keep practicing to advance to the next level.';
            }
        }
        setTimeout(() => showSection('dashboard'), 3000);
    }

    // Game functionality
    function loadGameWord() {
        if (currentWordIndex < gameWords.length) {
            const currentWord = gameWords[currentWordIndex];
            console.log(`Loading game word: ${currentWord.word}`);
            // Set the audio source for browsers that don't support speech
            if (audio.game) audio.game.src = currentWord.audio;
            if (inputs.game) inputs.game.value = '';
            if (feedback.game) feedback.game.textContent = '';
            if (buttons.nextWord) buttons.nextWord.style.display = 'none';
            
            // Auto-play the word with AI if available
            setTimeout(() => {
                if (audio.game) {
                    playWordAudio(audio.game, currentWord.word, currentWord.audio);
                }
            }, 500);
        } else {
            if (feedback.game) {
                feedback.game.textContent = 'Game Complete! Check your progress.';
            }
            if (points >= 30 && !badges.includes('Spelling Star')) {
                badges.push('Spelling Star');
                showNotification('New Badge: Spelling Star!', 'success');
                updateProgress();
            }
            setTimeout(() => showSection('dashboard'), 2000);
        }
    }
    
    // BUTTON EVENT HANDLERS
    
    // Direct click handlers for navigation buttons
    if (buttons.startAssessment) {
        buttons.startAssessment.onclick = function(event) {
            event.preventDefault();
            console.log('Start Assessment clicked');
            showSection('assessment');
            currentWordIndex = 0;
            loadAssessmentWord();
        };
    }

    if (buttons.playGame) {
        buttons.playGame.onclick = function(event) {
            event.preventDefault();
            console.log('Play Game clicked');
            showSection('game');
            currentWordIndex = 0;
            loadGameWord();
        };
    }

    if (buttons.openGenerator) {
        buttons.openGenerator.onclick = function(event) {
            event.preventDefault();
            console.log('Open Generator clicked');
            showSection('wordGenerator');
        };
    }

    if (buttons.settingsBtn) {
        buttons.settingsBtn.onclick = function(event) {
            event.preventDefault();
            console.log('Settings clicked');
            showSection('settings');
        };
    }

    // Back buttons
    backButtons.forEach(button => {
        button.onclick = function(event) {
            event.preventDefault();
            console.log('Back button clicked');
            showSection('dashboard');
        };
    });

    // Game control buttons
    if (buttons.submitAssessment) {
        buttons.submitAssessment.onclick = function(event) {
            event.preventDefault();
            console.log('Submit Assessment clicked');
            const userAnswer = inputs.assessment.value.trim().toLowerCase();
            const correctAnswer = assessmentWords[currentWordIndex].word;
            const isCorrect = userAnswer === correctAnswer;
            
            if (isCorrect) {
                const earnedPoints = calculatePoints(true, false);
                points += earnedPoints;
                feedback.assessment.textContent = `Correct! +${earnedPoints} points`;
                feedback.assessment.className = 'feedback success';
                
                if (correctStreak >= 3) {
                    feedback.assessment.textContent += ` (${correctStreak}x streak bonus!)`;
                }
                
                updateProgress();
                checkLevelAdvancement();
            } else {
                feedback.assessment.textContent = `Wrong! The correct spelling is "${correctAnswer}".`;
                feedback.assessment.className = 'feedback error';
                correctStreak = 0;
            }
            
            currentWordIndex++;
            setTimeout(loadAssessmentWord, 1500);
        };
    }

    if (buttons.submitGame) {
        buttons.submitGame.onclick = function(event) {
            event.preventDefault();
            console.log('Submit Game clicked');
            const userAnswer = inputs.game.value.trim().toLowerCase();
            const correctAnswer = gameWords[currentWordIndex].word;
            const isCorrect = userAnswer === correctAnswer;
            
            if (isCorrect) {
                const earnedPoints = calculatePoints(true, true);
                points += earnedPoints;
                feedback.game.textContent = `Correct! +${earnedPoints} points`;
                feedback.game.className = 'feedback success';
                
                if (correctStreak >= 3) {
                    feedback.game.textContent += ` (${correctStreak}x streak bonus!)`;
                }
                
                updateProgress();
                buttons.nextWord.style.display = 'block';
                
                // Check for badges
                if (points >= 50 && !badges.includes('Spelling Star')) {
                    badges.push('Spelling Star');
                    showNotification('New Badge: Spelling Star!', 'success');
                    updateProgress();
                }
                
                checkLevelAdvancement();
            } else {
                feedback.game.textContent = `Wrong! The correct spelling is "${correctAnswer}".`;
                feedback.game.className = 'feedback error';
                correctStreak = 0;
            }
        };
    }

    if (buttons.nextWord) {
        buttons.nextWord.onclick = function(event) {
            event.preventDefault();
            console.log('Next Word clicked');
            currentWordIndex++;
            loadGameWord();
        };
    }

    if (buttons.saveSettings) {
        buttons.saveSettings.onclick = function(event) {
            event.preventDefault();
            console.log('Save Settings clicked');
            const highContrast = document.getElementById('highContrast').checked;
            const textSize = document.getElementById('textSize').value;
            
            localStorage.setItem('highContrast', highContrast);
            localStorage.setItem('textSize', textSize);
            
            document.body.classList.toggle('high-contrast', highContrast);
            document.body.classList.remove('text-small', 'text-medium', 'text-large');
            document.body.classList.add(`text-${textSize}`);
            
            showSection('dashboard');
        };
    }
    
    // Custom word generator setup
    if (buttons.pronounceWord && inputs.customWord) {
        buttons.pronounceWord.onclick = function(event) {
            event.preventDefault();
            const word = inputs.customWord.value.trim();
            if (word) {
                if (window.speechService && window.speechService.isSpeechSupported) {
                    buttons.pronounceWord.disabled = true;
                    buttons.pronounceWord.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Speaking...';
                    
                    window.speechService.speakWord(
                        word,
                        null,
                        () => {
                            buttons.pronounceWord.disabled = false;
                            buttons.pronounceWord.innerHTML = '<i class="fas fa-volume-up"></i> Pronounce';
                        },
                        () => {
                            buttons.pronounceWord.disabled = false;
                            buttons.pronounceWord.innerHTML = '<i class="fas fa-volume-up"></i> Pronounce';
                        }
                    );
                } else {
                    alert('Speech synthesis is not supported in your browser.');
                }
            }
        };
    }

    // Replay buttons for audio player
    replayButtons.forEach(button => {
        button.onclick = function(event) {
            event.preventDefault();
            console.log('Replay button clicked');
            const audioPlayer = this.closest('.audio-player');
            if (audioPlayer) {
                const audio = audioPlayer.querySelector('audio');
                if (audio) {
                    // Find the current word
                    let currentWord;
                    if (audio.id === 'assessmentAudio' && currentWordIndex < assessmentWords.length) {
                        currentWord = assessmentWords[currentWordIndex];
                    } else if (audio.id === 'gameAudio' && currentWordIndex < gameWords.length) {
                        currentWord = gameWords[currentWordIndex];
                    }
                    
                    if (currentWord) {
                        playWordAudio(audio, currentWord.word, currentWord.audio);
                    } else {
                        // Fallback to regular audio replay
                        audio.currentTime = 0;
                        audio.play();
                    }
                }
            }
        };
    });

    // Load settings from localStorage
    function loadSettings() {
        // Load saved level
        const savedLevel = localStorage.getItem('spellingLevel');
        if (savedLevel) {
            currentLevel = parseInt(savedLevel);
            if (window.wordLists) {
                assessmentWords = window.wordLists.getAssessmentWordsByLevel(currentLevel);
            }
        }
        
        // Load saved points
        const savedPoints = localStorage.getItem('spellingPoints');
        if (savedPoints !== null) {
            points = parseInt(savedPoints);
        }
        
        // Load saved badges
        const savedBadges = localStorage.getItem('spellingBadges');
        if (savedBadges) {
            try {
                badges = JSON.parse(savedBadges);
            } catch (e) {
                console.error('Error parsing saved badges:', e);
                badges = [];
            }
        }
        
        console.log('Loaded saved progress:', {level: currentLevel, points, badges});
        
        // Load visual preferences
        const savedContrast = localStorage.getItem('highContrast');
        const savedTextSize = localStorage.getItem('textSize');
        const highContrastToggle = document.getElementById('highContrast');
        const textSizeSelect = document.getElementById('textSize');
        
        if (savedContrast === 'true' && highContrastToggle) {
            highContrastToggle.checked = true;
            document.body.classList.add('high-contrast');
        }
        
        if (savedTextSize && textSizeSelect) {
            textSizeSelect.value = savedTextSize;
            document.body.classList.add(`text-${savedTextSize}`);
        } else {
            document.body.classList.add('text-medium');
        }
    }

    // INITIALIZATION
    loadSettings();
    updateProgress();
    preloadAudio();
    
    // Make sure the default section is visible
    showSection('dashboard');
    
    // Add reset progress button to settings
    const settingsCard = document.querySelector('.settings-card');
    if (settingsCard) {
        const resetDiv = document.createElement('div');
        resetDiv.className = 'setting-option';
        resetDiv.innerHTML = `
            <button id="resetProgress" class="btn-secondary">
                <i class="fas fa-undo"></i> Reset Progress
            </button>
            <div class="setting-label">Reset all points, badges, and level progress</div>
        `;
        settingsCard.appendChild(resetDiv);
        
        // Add event listener to reset button
        const resetBtn = document.getElementById('resetProgress');
        if (resetBtn) {
            resetBtn.onclick = function(event) {
                event.preventDefault();
                
                if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                    // Reset points, badges, and level
                    points = 0;
                    badges = [];
                    currentLevel = 1;
                    
                    // Update assessment words for level 1
                    if (window.wordLists) {
                        assessmentWords = window.wordLists.getAssessmentWordsByLevel(currentLevel);
                    }
                    
                    // Save the reset state
                    saveProgress();
                    
                    // Update UI
                    updateProgress();
                    showNotification('Progress has been reset', 'info');
                }
            };
        }
    }
});

// Add global access to the show section function for debugging
window.showDashboard = function() {
    const dashboardSection = document.getElementById('dashboard');
    const otherSections = document.querySelectorAll('.app-section:not(#dashboard)');
    
    otherSections.forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    dashboardSection.classList.remove('hidden');
    dashboardSection.classList.add('active');
    console.log('Dashboard shown via global function');
};

console.log('Script loading completed');