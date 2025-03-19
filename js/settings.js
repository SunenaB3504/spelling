// Settings and user preferences functionality
console.log('Settings module loading');

// Create Settings namespace
window.SpellingApp = window.SpellingApp || {};
SpellingApp.Settings = {};

// Initialize Settings module
SpellingApp.Settings.init = function() {
    // Initialize settings from localStorage
    this.loadSavedSettings();
    
    // Set up event listeners
    this.setupEventListeners();
};

// Load saved settings
SpellingApp.Settings.loadSavedSettings = function() {
    // Load visual preferences
    const highContrast = localStorage.getItem('highContrast') === 'true';
    const textSize = localStorage.getItem('textSize') || 'medium';
    
    // Apply visual preferences
    document.body.classList.toggle('high-contrast', highContrast);
    document.body.classList.remove('text-small', 'text-medium', 'text-large');
    document.body.classList.add(`text-${textSize}`);
    
    // Set form controls to match saved settings
    const highContrastCheckbox = document.getElementById('highContrast');
    const textSizeSelect = document.getElementById('textSize');
    
    if (highContrastCheckbox) highContrastCheckbox.checked = highContrast;
    if (textSizeSelect) textSizeSelect.value = textSize;
    
    console.log('Settings loaded:', { highContrast, textSize });
};

// Set up settings event listeners
SpellingApp.Settings.setupEventListeners = function() {
    // Save settings button
    if (SpellingApp.buttons.saveSettings) {
        SpellingApp.buttons.saveSettings.onclick = (e) => {
            e.preventDefault();
            console.log('Save Settings clicked');
            this.saveSettings();
        };
    }
};

// Save settings to localStorage
SpellingApp.Settings.saveSettings = function() {
    const highContrastCheckbox = document.getElementById('highContrast');
    const textSizeSelect = document.getElementById('textSize');
    
    if (!highContrastCheckbox || !textSizeSelect) return;
    
    const highContrast = highContrastCheckbox.checked;
    const textSize = textSizeSelect.value;
    
    // Save to localStorage
    localStorage.setItem('highContrast', highContrast);
    localStorage.setItem('textSize', textSize);
    
    // Apply changes
    document.body.classList.toggle('high-contrast', highContrast);
    document.body.classList.remove('text-small', 'text-medium', 'text-large');
    document.body.classList.add(`text-${textSize}`);
    
    // Notify user
    SpellingApp.UI.showNotification('Settings saved successfully!', 'success');
    
    // Return to dashboard
    SpellingApp.UI.showSection('dashboard');
    
    console.log('Settings saved:', { highContrast, textSize });
};

// Function to reset all settings and progress
SpellingApp.Settings.resetAll = function() {
    // Ask for confirmation
    const confirmReset = confirm('Are you sure you want to reset all progress and settings? This cannot be undone.');
    
    if (confirmReset) {
        // Remove all stored data
        localStorage.removeItem('spellingPoints');
        localStorage.removeItem('spellingLevel');
        localStorage.removeItem('spellingClaimedRewards');
        localStorage.removeItem('highContrast');
        localStorage.removeItem('textSize');
        
        // Reset application state
        SpellingApp.state.points = 0;
        SpellingApp.state.currentLevel = 1;
        SpellingApp.state.claimedRewards = [];
        SpellingApp.state.correctStreak = 0;
        
        // Reset UI
        SpellingApp.updateProgress();
        
        // Reload the page to apply all resets
        window.location.reload();
    }
};
