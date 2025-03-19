// Spelling Bee game functionality
console.log('Game module loading');

// Create Game namespace
window.SpellingApp = window.SpellingApp || {};
SpellingApp.Game = {};

// Initialize Game module
SpellingApp.Game.init = function() {
    // Setup event listeners for game
    if (SpellingApp.buttons.submitGame) {
        SpellingApp.buttons.submitGame.onclick = (e) => {
            e.preventDefault();
            console.log('Submit Game clicked');
            this.submitGameAnswer();
        };
    }
    
    if (SpellingApp.buttons.nextWord) {
        SpellingApp.buttons.nextWord.onclick = (e) => {
            e.preventDefault();
            console.log('Next Word clicked');
            SpellingApp.state.currentWordIndex++;
            this.loadGameWord();
        };
    }
    
    // Add keyboard support
    if (SpellingApp.inputs.game) {
        SpellingApp.inputs.game.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.submitGameAnswer();
            }
        };
    }
};

// Game word loading
SpellingApp.Game.loadGameWord = function() {
    if (SpellingApp.state.currentWordIndex < SpellingApp.gameWords.length) {
        const currentWord = SpellingApp.gameWords[SpellingApp.state.currentWordIndex];
        console.log(`Loading game word: ${currentWord.word}`);
        
        // Set the audio source
        if (SpellingApp.audio.game) {
            SpellingApp.audio.game.src = currentWord.audio;
        }
        
        // Clear input and feedback
        if (SpellingApp.inputs.game) SpellingApp.inputs.game.value = '';
        if (SpellingApp.feedback.game) SpellingApp.feedback.game.textContent = '';
        if (SpellingApp.buttons.nextWord) SpellingApp.buttons.nextWord.style.display = 'none';
        
        // Auto-play the word with AI if available
        setTimeout(() => {
            if (SpellingApp.audio.game) {
                SpellingApp.playWordAudio(
                    SpellingApp.audio.game, 
                    currentWord.word, 
                    currentWord.audio
                );
            }
        }, 500);
    } else {
        this.completeGame();
    }
};

// Submit game answer
SpellingApp.Game.submitGameAnswer = function() {
    const userAnswer = SpellingApp.inputs.game.value.trim().toLowerCase();
    const correctAnswer = SpellingApp.gameWords[SpellingApp.state.currentWordIndex].word;
    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) {
        const earnedPoints = SpellingApp.calculatePoints(true, true);
        SpellingApp.state.points += earnedPoints;
        SpellingApp.feedback.game.textContent = `Correct! +${earnedPoints} points`;
        SpellingApp.feedback.game.className = 'feedback success';
        
        if (SpellingApp.state.correctStreak >= 3) {
            SpellingApp.feedback.game.textContent += ` (${SpellingApp.state.correctStreak}x streak bonus!)`;
        }
        
        SpellingApp.updateProgress();
        SpellingApp.buttons.nextWord.style.display = 'block';
        
        SpellingApp.Rewards.checkLevelAdvancement();
    } else {
        SpellingApp.feedback.game.textContent = `Wrong! The correct spelling is "${correctAnswer}".`;
        SpellingApp.feedback.game.className = 'feedback error';
        SpellingApp.state.correctStreak = 0;
    }
};

// Complete game
SpellingApp.Game.completeGame = function() {
    if (SpellingApp.feedback.game) {
        SpellingApp.feedback.game.textContent = 'Game Complete! Check your progress.';
    }
    
    // Check for available rewards
    SpellingApp.Rewards.checkAvailableRewards();
    
    setTimeout(() => SpellingApp.UI.showSection('dashboard'), 2000);
};
