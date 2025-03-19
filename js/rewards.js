// Rewards system and points management
console.log('Rewards module loading');

// Create Rewards namespace
window.SpellingApp = window.SpellingApp || {};
SpellingApp.Rewards = {};

// Define rewards data
SpellingApp.Rewards.items = [
    { id: 'lollypop', name: 'Lollypop', emoji: '🍭', points: 500, claimed: false },
    { id: 'icecream', name: 'Ice Cream', emoji: '🍦', points: 1000, claimed: false },
    { id: 'burger', name: 'Burger', emoji: '🍔', points: 2000, claimed: false },
    { id: 'chicken', name: 'Fried Chicken', emoji: '🍗', points: 3000, claimed: false },
    { id: 'pizza', name: 'Pizza', emoji: '🍕', points: 4000, claimed: false },
    { id: 'book', name: 'Book', emoji: '📚', points: 5000, claimed: false },
    { id: 'toy', name: 'Toy', emoji: '🧸', points: 10000, claimed: false }
];

// Initialize Rewards module
SpellingApp.Rewards.init = function() {
    // Mark already claimed rewards based on data loaded from localStorage
    this.updateRewardStatus();
    
    // Update rewards display in dashboard
    this.updateRewardsDisplay();
};

// Update the status of all rewards
SpellingApp.Rewards.updateRewardStatus = function() {
    // Update each reward's status
    this.items.forEach(reward => {
        // Check if this reward has been claimed
        reward.claimed = SpellingApp.state.claimedRewards.includes(reward.id);
        
        // Check if it's available (enough points and not claimed)
        reward.available = !reward.claimed && 
            SpellingApp.state.points >= reward.points;
    });
};

// Check for level advancement
SpellingApp.Rewards.checkLevelAdvancement = function() {
    if (SpellingApp.state.currentLevel < SpellingApp.pointsConfig.levelThresholds.length && 
        SpellingApp.state.points >= SpellingApp.pointsConfig.levelThresholds[SpellingApp.state.currentLevel - 1]) {
        
        // Only advance if not already at max level
        if (SpellingApp.state.currentLevel < 3) {
            SpellingApp.state.currentLevel++;
            
            // Show level up notification
            const levelUpMsg = `Congratulations! You've reached Level ${SpellingApp.state.currentLevel}!`;
            SpellingApp.UI.showNotification(levelUpMsg, 'success');
            
            // Save level progress
            localStorage.setItem('spellingLevel', SpellingApp.state.currentLevel);
            
            // Update word lists for the new level
            if (window.wordLists) {
                SpellingApp.assessmentWords = window.wordLists.getAssessmentWordsByLevel(SpellingApp.state.currentLevel);
            }
            
            // Update UI
            SpellingApp.UI.updateLevelUI();
            SpellingApp.updateProgress();
            
            return true;
        }
    }
    return false;
};

// Check for available rewards
SpellingApp.Rewards.checkAvailableRewards = function() {
    let newlyAvailable = false;
    
    this.items.forEach(reward => {
        // A reward is available if the user has enough points and hasn't claimed it yet
        const wasAvailable = reward.available;
        reward.available = !reward.claimed && SpellingApp.state.points >= reward.points;
        
        // If a reward just became available, show notification
        if (!wasAvailable && reward.available) {
            newlyAvailable = true;
            SpellingApp.UI.showNotification(`New reward available: ${reward.emoji} ${reward.name}!`, 'success');
        }
    });
    
    // If any reward became available, update the display
    if (newlyAvailable) {
        this.updateRewardsDisplay();
    }
};

// Update the rewards display in the dashboard
SpellingApp.Rewards.updateRewardsDisplay = function() {
    const rewardsContainer = SpellingApp.progress.badges; // Using badges element for rewards display
    if (!rewardsContainer) return;
    
    // Clear previous content
    rewardsContainer.innerHTML = '';
    
    // Update reward status first
    this.updateRewardStatus();
    
    // First show claimed rewards
    const claimed = this.items.filter(r => r.claimed);
    if (claimed.length > 0) {
        const claimedDiv = document.createElement('div');
        claimedDiv.className = 'claimed-rewards';
        claimedDiv.innerHTML = '<strong>Claimed: </strong>';
        
        claimed.forEach(reward => {
            const span = document.createElement('span');
            span.className = 'reward-emoji';
            span.title = `${reward.name} (Claimed)`;
            span.textContent = reward.emoji;
            claimedDiv.appendChild(span);
        });
        
        rewardsContainer.appendChild(claimedDiv);
    }
    
    // Then show available rewards
    const available = this.items.filter(r => r.available);
    if (available.length > 0) {
        if (claimed.length > 0) rewardsContainer.appendChild(document.createElement('br'));
        
        const availableDiv = document.createElement('div');
        availableDiv.className = 'available-rewards';
        availableDiv.innerHTML = '<strong>Available: </strong>';
        
        available.forEach(reward => {
            const btn = document.createElement('button');
            btn.className = 'reward-btn';
            btn.title = `${reward.name} (${reward.points} points)`;
            btn.innerHTML = `${reward.emoji}`;
            btn.onclick = () => this.claimReward(reward.id);
            availableDiv.appendChild(btn);
        });
        
        rewardsContainer.appendChild(availableDiv);
    }
    
    // Show upcoming rewards
    const upcoming = this.items.filter(r => !r.available && !r.claimed);
    if (upcoming.length > 0) {
        if (available.length > 0 || claimed.length > 0) rewardsContainer.appendChild(document.createElement('br'));
        
        const upcomingDiv = document.createElement('div');
        upcomingDiv.className = 'upcoming-rewards';
        upcomingDiv.innerHTML = '<strong>Next Goals: </strong>';
        
        upcoming.sort((a, b) => a.points - b.points);
        upcoming.slice(0, 3).forEach(reward => {
            const span = document.createElement('span');
            span.className = 'reward-upcoming';
            span.title = `${reward.name} (${reward.points} points needed)`;
            span.innerHTML = `${reward.emoji} ${reward.points}`;
            upcomingDiv.appendChild(span);
        });
        
        rewardsContainer.appendChild(upcomingDiv);
    }
    
    // If nothing to show
    if (claimed.length === 0 && available.length === 0 && upcoming.length === 0) {
        rewardsContainer.textContent = 'Keep earning points for rewards!';
    }
};

// Function to claim a reward
SpellingApp.Rewards.claimReward = function(rewardId) {
    const reward = this.items.find(r => r.id === rewardId);
    
    if (!reward || !reward.available) return;
    
    // Confirm before claiming
    const confirmClaim = confirm(`Do you want to trade ${reward.points} points for ${reward.emoji} ${reward.name}?`);
    
    if (confirmClaim) {
        // Deduct points
        SpellingApp.state.points -= reward.points;
        
        // Add to claimed rewards
        SpellingApp.state.claimedRewards.push(rewardId);
        
        // Mark as claimed
        reward.claimed = true;
        reward.available = false;
        
        // Show notification
        SpellingApp.UI.showNotification(`You claimed ${reward.emoji} ${reward.name}!`, 'success');
        
        // Update display
        SpellingApp.updateProgress();
        
        // Show parent instructions if this is the first claimed reward
        if (SpellingApp.state.claimedRewards.length === 1) {
            alert("Show this screen to your parent to receive your reward!");
        }
    }
};

// Initialize the rewards center
SpellingApp.Rewards.initRewardsCenter = function() {
    const rewardsGrid = document.getElementById('rewardsGrid');
    const rewardPoints = document.getElementById('rewardPoints');
    
    if (!rewardsGrid || !rewardPoints) return;
    
    // Update points display
    rewardPoints.textContent = SpellingApp.state.points;
    
    // Clear previous rewards
    rewardsGrid.innerHTML = '';
    
    // Update reward status first
    this.updateRewardStatus();
    
    // Add all rewards to the grid
    this.items.forEach(reward => {
        const card = document.createElement('div');
        card.className = `reward-card ${reward.available ? 'available' : ''} ${reward.claimed ? 'claimed' : ''}`;
        
        card.innerHTML = `
            <div class="emoji">${reward.emoji}</div>
            <div class="name">${reward.name}</div>
            <div class="cost">${reward.points} points</div>
        `;
        
        if (reward.available) {
            card.onclick = () => this.claimReward(reward.id);
        }
        
        rewardsGrid.appendChild(card);
    });
};
