/**
 * Word Lists - Contains all word categories for the Spelling Adventure app
 * Separated by level and category for better organization
 */

// Level 1 - Basic words (3-4 letters)
const level1Words = [
    { word: "cat", audio: "assets/audio/words/cat.mp3" },
    { word: "dog", audio: "assets/audio/words/dog.mp3" },
    { word: "fish", audio: "assets/audio/words/fish.mp3" },
    { word: "book", audio: "assets/audio/words/book.mp3" },
    { word: "tree", audio: "assets/audio/words/tree.mp3" },
    { word: "ball", audio: "assets/audio/words/ball.mp3" },
    { word: "hat", audio: "assets/audio/words/hat.mp3" },
    { word: "sun", audio: "assets/audio/words/sun.mp3" },
    { word: "map", audio: "assets/audio/words/map.mp3" },
    { word: "red", audio: "assets/audio/words/red.mp3" }
];

// Level 2 - Intermediate words (4-5 letters)
const level2Words = [
    { word: "house", audio: "assets/audio/words/house.mp3" },
    { word: "water", audio: "assets/audio/words/water.mp3" },
    { word: "table", audio: "assets/audio/words/table.mp3" },
    { word: "plant", audio: "assets/audio/words/plant.mp3" },
    { word: "smile", audio: "assets/audio/words/smile.mp3" },
    { word: "happy", audio: "assets/audio/words/happy.mp3" },
    { word: "chair", audio: "assets/audio/words/chair.mp3" },
    { word: "paper", audio: "assets/audio/words/paper.mp3" },
    { word: "cloud", audio: "assets/audio/words/cloud.mp3" },
    { word: "brain", audio: "assets/audio/words/brain.mp3" }
];

// Level 3 - Advanced words (5+ letters, more complex)
const level3Words = [
    { word: "elephant", audio: "assets/audio/words/elephant.mp3" },
    { word: "computer", audio: "assets/audio/words/computer.mp3" },
    { word: "beautiful", audio: "assets/audio/words/beautiful.mp3" },
    { word: "playground", audio: "assets/audio/words/playground.mp3" },
    { word: "adventure", audio: "assets/audio/words/adventure.mp3" },
    { word: "calendar", audio: "assets/audio/words/calendar.mp3" },
    { word: "dinosaur", audio: "assets/audio/words/dinosaur.mp3" },
    { word: "chocolate", audio: "assets/audio/words/chocolate.mp3" },
    { word: "butterfly", audio: "assets/audio/words/butterfly.mp3" },
    { word: "universe", audio: "assets/audio/words/universe.mp3" }
];

// Themed lists - can be used for special game modes
const animalWords = [
    { word: "cat", audio: "assets/audio/words/cat.mp3" },
    { word: "dog", audio: "assets/audio/words/dog.mp3" },
    { word: "fish", audio: "assets/audio/words/fish.mp3" },
    { word: "bird", audio: "assets/audio/words/bird.mp3" },
    { word: "elephant", audio: "assets/audio/words/elephant.mp3" },
    { word: "tiger", audio: "assets/audio/words/tiger.mp3" },
    { word: "monkey", audio: "assets/audio/words/monkey.mp3" },
    { word: "giraffe", audio: "assets/audio/words/giraffe.mp3" },
    { word: "zebra", audio: "assets/audio/words/zebra.mp3" },
    { word: "penguin", audio: "assets/audio/words/penguin.mp3" }
];

// Export all word lists
window.wordLists = {
    assessment: {
        level1: level1Words,
        level2: level2Words,
        level3: level3Words
    },
    game: {
        animals: animalWords,
        // Add more themed lists as needed
    },
    
    // Helper function to get words by level
    getAssessmentWordsByLevel: function(level) {
        switch(level) {
            case 1:
                return this.assessment.level1;
            case 2:
                return this.assessment.level2;
            case 3:
                return this.assessment.level3;
            default:
                return this.assessment.level1;
        }
    },
    
    // Helper function to get random words from any list
    getRandomWords: function(list, count) {
        const selectedList = Array.isArray(list) ? list : this.assessment.level1;
        const shuffled = [...selectedList].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
};
