// Add debug logging
console.log('Script loading started');

// Global variables
let currentLevel = 1;
let points = 0;
let badges = [];
let currentWordIndex = 0;
// Using the global speechService from speechService.js

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

    function updateProgress() {
        if (progress.level) progress.level.textContent = currentLevel;
        if (progress.points) progress.points.textContent = points;
        if (progress.badges) progress.badges.textContent = badges.length ? badges.join(', ') : 'None';
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
            const correctPercentage = (points / (assessmentWords.length * 10)) * 100;
            
            if (correctPercentage >= 80) {
                // Level up if they got 80% or better
                currentLevel = Math.min(currentLevel + 1, 3); // Max level is 3
                feedback.assessment.textContent = `Great job! You've advanced to Level ${currentLevel}!`;
                
                // Save level progress
                localStorage.setItem('spellingLevel', currentLevel);
                
                // Update word lists for the new level
                assessmentWords = window.wordLists.getAssessmentWordsByLevel(currentLevel);
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
                updateProgress();
            }
            setTimeout(() => showSection('dashboard'), 2000);
        }
    }
    
    // BUTTON EVENT HANDLERS
    
    // Direct click handlers for main navigation buttons
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

    // Back buttons - use direct assignment for more reliable behavior
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
            if (userAnswer === correctAnswer) {
                points += 10;
                feedback.assessment.textContent = 'Correct! +10 points';
                feedback.assessment.className = 'feedback success';
                updateProgress();
            } else {
                feedback.assessment.textContent = `Wrong! The correct spelling is "${correctAnswer}".`;
                feedback.assessment.className = 'feedback error';
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
            if (userAnswer === correctAnswer) {
                points += 15;
                feedback.game.textContent = 'Correct! +15 points';
                feedback.game.className = 'feedback success';
                updateProgress();
                buttons.nextWord.style.display = 'block';
            } else {
                feedback.game.textContent = `Wrong! The correct spelling is "${correctAnswer}".`;
                feedback.game.className = 'feedback error';
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
            
            // Save settings in localStorage for persistence
            localStorage.setItem('highContrast', highContrast);
            localStorage.setItem('textSize', textSize);
            
            // Apply settings
            document.body.classList.toggle('high-contrast', highContrast);
            document.body.classList.remove('text-small', 'text-medium', 'text-large');
            document.body.classList.add(`text-${textSize}`);
            
            // Go back to dashboard
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
        const savedLevel = localStorage.getItem('spellingLevel');
        if (savedLevel) {
            currentLevel = parseInt(savedLevel);
            if (window.wordLists) {
                assessmentWords = window.wordLists.getAssessmentWordsByLevel(currentLevel);
            }
        }
        
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