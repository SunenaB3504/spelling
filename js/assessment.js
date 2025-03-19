// Assessment mode functionality
console.log('Assessment module loading');

// Create Assessment namespace
window.SpellingApp = window.SpellingApp || {};
SpellingApp.Assessment = {};

// Initialize Assessment module
SpellingApp.Assessment.init = function() {
    // Setup event listeners for assessment
    if (SpellingApp.buttons.submitAssessment) {
        SpellingApp.buttons.submitAssessment.onclick = (e) => {
            e.preventDefault();
            console.log('Submit Assessment clicked');
            this.submitAssessment();
        };
    }
    
    // Add keyboard support
    if (SpellingApp.inputs.assessment) {
        SpellingApp.inputs.assessment.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.submitAssessment();
            }
        };
    }
};

// Assessment word loading
SpellingApp.Assessment.loadAssessmentWord = function() {
    if (SpellingApp.state.currentWordIndex < SpellingApp.assessmentWords.length) {
        const currentWord = SpellingApp.assessmentWords[SpellingApp.state.currentWordIndex];
        console.log(`Loading assessment word: ${currentWord.word}`);
        
        // Set the audio source
        if (SpellingApp.audio.assessment) {
            SpellingApp.audio.assessment.src = currentWord.audio;
        }
        
        // Clear input and feedback
        if (SpellingApp.inputs.assessment) SpellingApp.inputs.assessment.value = '';
        if (SpellingApp.feedback.assessment) SpellingApp.feedback.assessment.textContent = '';
        
        // Auto-play the word with AI if available
        setTimeout(() => {
            if (SpellingApp.audio.assessment) {
                SpellingApp.playWordAudio(
                    SpellingApp.audio.assessment, 
                    currentWord.word, 
                    currentWord.audio
                );
            }
        }, 500);
    } else {
        this.completeAssessment();
    }
};

// Submit assessment answer
SpellingApp.Assessment.submitAssessment = function() {
    const userAnswer = SpellingApp.inputs.assessment.value.trim().toLowerCase();
    const correctAnswer = SpellingApp.assessmentWords[SpellingApp.state.currentWordIndex].word;
    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) {
        const earnedPoints = SpellingApp.calculatePoints(true, false);
        SpellingApp.state.points += earnedPoints;
        SpellingApp.feedback.assessment.textContent = `Correct! +${earnedPoints} points`;
        SpellingApp.feedback.assessment.className = 'feedback success';
        
        if (SpellingApp.state.correctStreak >= 3) {
            SpellingApp.feedback.assessment.textContent += ` (${SpellingApp.state.correctStreak}x streak bonus!)`;
        }
        
        SpellingApp.updateProgress();
        SpellingApp.Rewards.checkLevelAdvancement();
    } else {
        SpellingApp.feedback.assessment.textContent = `Wrong! The correct spelling is "${correctAnswer}".`;
        SpellingApp.feedback.assessment.className = 'feedback error';
        SpellingApp.state.correctStreak = 0;
    }
    
    SpellingApp.state.currentWordIndex++;
    setTimeout(() => this.loadAssessmentWord(), 1500);
};

// Complete assessment
SpellingApp.Assessment.completeAssessment = function() {
    if (SpellingApp.feedback.assessment) {
        const wordsCount = SpellingApp.assessmentWords.length;
        const basePoints = SpellingApp.pointsConfig.baseAssessment * 
            SpellingApp.pointsConfig.levelMultipliers[SpellingApp.state.currentLevel - 1];
        const correctPercentage = (SpellingApp.state.points / (wordsCount * basePoints)) * 100;
        
        if (correctPercentage >= 80) {
            SpellingApp.Rewards.checkLevelAdvancement();
            SpellingApp.feedback.assessment.textContent = 
                `Great job! You've completed the assessment with ${Math.round(correctPercentage)}% accuracy.`;
        } else {
            SpellingApp.feedback.assessment.textContent = 
                'Assessment complete! Keep practicing to advance to the next level.';
        }
    }
    
    setTimeout(() => SpellingApp.UI.showSection('dashboard'), 3000);
};
