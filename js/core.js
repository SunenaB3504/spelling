// Core application functionality and initialization
console.log('Core module loading');

// Global application namespace
window.SpellingApp = window.SpellingApp || {};

// Global variables
SpellingApp.state = {
    currentLevel: 1,
    points: 0,
    claimedRewards: [], // For tracking claimed rewards
    currentWordIndex: 0,
    correctStreak: 0 // Track consecutive correct answers
};

// Points configuration
SpellingApp.pointsConfig = {
    baseAssessment: 20,    // Base points for assessment (doubled from 10)
    baseGame: 30,          // Base points for game (doubled from 15)
    levelMultipliers: [1, 1.5, 2],  // Level 1, 2, 3 multipliers
    levelThresholds: [500, 1000, 1500],  // Points needed to unlock levels (updated from [100, 250, 400])
    streakBonus: 10        // Bonus for consecutive correct answers (doubled from 5)
};

// DOM Elements - will be populated during initialization
SpellingApp.sections = {};
SpellingApp.buttons = {};
SpellingApp.inputs = {};
SpellingApp.feedback = {};
SpellingApp.audio = {};
SpellingApp.progress = {};
SpellingApp.levelButtons = {};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing SpellingApp');
    
    SpellingApp.initApp();
});

SpellingApp.initApp = function() {
    // Initialize DOM references
    this.initDomReferences();
    
    // Initialize word lists
    this.initWordLists();
    
    // Load saved data from localStorage
    this.loadSavedData();
    
    // Initialize UI
    SpellingApp.UI.initUI();
    
    // Initialize modules
    SpellingApp.Rewards.init();
    SpellingApp.Assessment.init();
    SpellingApp.Game.init();
    SpellingApp.Settings.init();
    
    // Update UI
    this.updateProgress();
    
    console.log('SpellingApp initialization complete');
};

SpellingApp.initDomReferences = function() {
    // Get section references
    this.sections = {
        dashboard: document.getElementById('dashboard'),
        assessment: document.getElementById('assessment'),
        game: document.getElementById('game'),
        settings: document.getElementById('settings'),
        wordGenerator: document.getElementById('wordGenerator'),
        rewardsCenter: document.getElementById('rewardsCenter')
    };

    // Get button references
    this.buttons = {
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

    // Get input, feedback, audio and progress references
    this.inputs = {
        assessment: document.getElementById('assessmentInput'),
        game: document.getElementById('gameInput'),
        customWord: document.getElementById('customWord')
    };

    this.feedback = {
        assessment: document.getElementById('assessmentFeedback'),
        game: document.getElementById('gameFeedback')
    };

    this.audio = {
        assessment: document.getElementById('assessmentAudio'),
        game: document.getElementById('gameAudio')
    };

    this.progress = {
        level: document.getElementById('level'),
        points: document.getElementById('points'),
        badges: document.getElementById('badges')
    };

    // Get level buttons
    this.levelButtons = {
        level1: document.getElementById('level1Btn'),
        level2: document.getElementById('level2Btn'),
        level3: document.getElementById('level3Btn')
    };
    
    // Get other common elements
    this.backButtons = document.querySelectorAll('.btn-back');
    this.replayButtons = document.querySelectorAll('.replay-btn');
    
    console.log('DOM references initialized');
};

SpellingApp.initWordLists = function() {
    // Initialize word lists
    this.assessmentWords = [];
    this.gameWords = [];
    
    if (window.wordLists) {
        // Set up assessment words based on current level
        this.assessmentWords = window.wordLists.getAssessmentWordsByLevel(this.state.currentLevel);
        
        // Set up game words (using animals theme)
        this.gameWords = window.wordLists.game.animals;
        
        console.log(`Loaded ${this.assessmentWords.length} assessment words and ${this.gameWords.length} game words`);
    } else {
        console.warn('Word lists not loaded, using fallback words');
        // Fallback to basic words if wordLists.js failed to load
        this.assessmentWords = [
            { word: "cat", audio: "assets/audio/words/cat.mp3" },
            { word: "dog", audio: "assets/audio/words/dog.mp3" },
            { word: "fish", audio: "assets/audio/words/fish.mp3" }
        ];
        
        this.gameWords = [
            { word: "cake", audio: "assets/audio/words/cake.mp3" },
            { word: "bird", audio: "assets/audio/words/bird.mp3" },
            { word: "jump", audio: "assets/audio/words/jump.mp3" }
        ];
    }
};

SpellingApp.loadSavedData = function() {
    // Load saved level
    const savedLevel = localStorage.getItem('spellingLevel');
    if (savedLevel) {
        this.state.currentLevel = parseInt(savedLevel);
        if (window.wordLists) {
            this.assessmentWords = window.wordLists.getAssessmentWordsByLevel(this.state.currentLevel);
        }
    }
    
    // Load saved points
    const savedPoints = localStorage.getItem('spellingPoints');
    if (savedPoints !== null) {
        this.state.points = parseInt(savedPoints);
    }
    
    // Load claimed rewards
    const savedRewards = localStorage.getItem('spellingClaimedRewards');
    if (savedRewards) {
        try {
            this.state.claimedRewards = JSON.parse(savedRewards);
        } catch (e) {
            console.error('Error parsing saved rewards:', e);
            this.state.claimedRewards = [];
        }
    }
    
    console.log('Saved data loaded:', {
        level: this.state.currentLevel, 
        points: this.state.points, 
        rewards: this.state.claimedRewards.length
    });
};

SpellingApp.updateProgress = function() {
    if (this.progress.level) this.progress.level.textContent = this.state.currentLevel;
    
    // Update all points displays
    SpellingApp.UI.updateAllPointsDisplays();
    
    SpellingApp.UI.updateLevelUI();
    SpellingApp.Rewards.updateRewardsDisplay();
    
    // Update level progress bar
    const progressBar = document.getElementById('levelProgressBar');
    const currentPointsElem = document.getElementById('currentPoints');
    const nextLevelPointsElem = document.getElementById('nextLevelPoints');
    
    if (progressBar && currentPointsElem && nextLevelPointsElem) {
        // Get points needed for next level
        const nextLevelThreshold = this.state.currentLevel < 3 ? 
            this.pointsConfig.levelThresholds[this.state.currentLevel - 1] : Infinity;
        const prevLevelThreshold = this.state.currentLevel > 1 ? 
            this.pointsConfig.levelThresholds[this.state.currentLevel - 2] : 0;
        
        // Calculate progress percentage
        const totalPointsInLevel = nextLevelThreshold - prevLevelThreshold;
        const pointsEarnedInLevel = Math.max(0, this.state.points - prevLevelThreshold);
        const percentage = Math.min(100, (pointsEarnedInLevel / totalPointsInLevel) * 100);
        
        // Update UI
        progressBar.style.width = `${percentage}%`;
        currentPointsElem.textContent = pointsEarnedInLevel;
        nextLevelPointsElem.textContent = totalPointsInLevel;
        
        // Animate points if changed
        this.progress.points.classList.remove('points-earned');
        void this.progress.points.offsetWidth; // Force reflow to restart animation
        this.progress.points.classList.add('points-earned');
    }
    
    // Save progress to localStorage
    this.saveProgress();
};

SpellingApp.saveProgress = function() {
    localStorage.setItem('spellingPoints', this.state.points);
    localStorage.setItem('spellingClaimedRewards', JSON.stringify(this.state.claimedRewards));
    localStorage.setItem('spellingLevel', this.state.currentLevel);
    console.log('Progress saved:', {
        points: this.state.points, 
        claimedRewards: this.state.claimedRewards, 
        level: this.state.currentLevel
    });
};

SpellingApp.calculatePoints = function(isCorrect, isGame) {
    if (!isCorrect) {
        this.state.correctStreak = 0;
        return 0;
    }
    
    // Get base points based on mode
    const basePoints = isGame ? this.pointsConfig.baseGame : this.pointsConfig.baseAssessment;
    
    // Apply level multiplier
    const multiplier = this.pointsConfig.levelMultipliers[this.state.currentLevel - 1] || 1;
    
    // Calculate streak bonus
    this.state.correctStreak++;
    const streakBonus = this.state.correctStreak >= 3 ? this.pointsConfig.streakBonus : 0;
    
    // Calculate total points
    const earnedPoints = Math.round(basePoints * multiplier + streakBonus);
    
    return earnedPoints;
};

// Play word audio using AI speech synthesis when available
SpellingApp.playWordAudio = function(audioElement, word, audioFilePath) {
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
};
