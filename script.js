// Add debug logging
console.log('Script loading started');

// Global variables
let currentLevel = 1;
let points = 0;
let claimedRewards = []; // For tracking claimed rewards
let currentWordIndex = 0;
let correctStreak = 0; // Track consecutive correct answers

// Points configuration
const pointsConfig = {
    baseAssessment: 10, // Base points for assessment
    baseGame: 15, // Base points for game
    levelMultipliers: [1, 1.5, 2], // Level 1, 2, 3 multipliers
    levelThresholds: [100, 250, 400], // Points needed to unlock levels
    streakBonus: 5 // Bonus for consecutive correct answers
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
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
        wordGenerator: document.getElementById('wordGenerator'),
        rewardsCenter: document.getElementById('rewardsCenter')
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
        pronounceWord: document.getElementById('pronounceWord'),
        openRewards: document.getElementById('openRewards')
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

    // CORE FUNCTIONS

    function showSection(section) {
        console.log('Showing section:', section);
        // Hide all sections
        Object.values(sections).forEach((s) => {
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

        // If showing rewards center, initialize it
        if (section === 'rewardsCenter') {
            initRewardsCenter();
        }
    }

    function calculatePoints(isCorrect, isGame) {
        if (!isCorrect) {
            correctStreak = 0;
            return 0;
        }

        const basePoints = isGame ? pointsConfig.baseGame : pointsConfig.baseAssessment;
        const multiplier = pointsConfig.levelMultipliers[currentLevel - 1] || 1;
        correctStreak++;
        const streakBonus = correctStreak >= 3 ? pointsConfig.streakBonus : 0;
        return Math.round(basePoints * multiplier + streakBonus);
    }

    function saveProgress() {
        localStorage.setItem('spellingPoints', points);
        localStorage.setItem('spellingClaimedRewards', JSON.stringify(claimedRewards));
        localStorage.setItem('spellingLevel', currentLevel);
        console.log('Progress saved:', { points, claimedRewards, level: currentLevel });
    }

    function checkLevelAdvancement() {
        if (currentLevel < pointsConfig.levelThresholds.length && points >= pointsConfig.levelThresholds[currentLevel - 1]) {
            if (currentLevel < 3) {
                currentLevel++;
                const levelUpMsg = `Congratulations! You've reached Level ${currentLevel}!`;
                showNotification(levelUpMsg, 'success');
                localStorage.setItem('spellingLevel', currentLevel);
                if (window.wordLists) {
                    assessmentWords = window.wordLists.getAssessmentWordsByLevel(currentLevel);
                }
                updateLevelUI();
                updateProgress();
                return true;
            }
        }
        return false;
    }

    function showNotification(message, type = 'info') {
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    function updateProgress() {
        if (progress.level) progress.level.textContent = currentLevel;
        if (progress.points) progress.points.textContent = points;
        updateLevelUI();
        saveProgress();
    }

    function updateLevelUI() {
        if (progress.level) progress.level.textContent = currentLevel;
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

    // INITIALIZATION
    updateProgress();
    console.log('Script loading completed');
}
);