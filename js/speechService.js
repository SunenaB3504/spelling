/**
 * Speech Service - Handles text-to-speech functionality
 * Uses the Web Speech API with fallback to audio files
 */
console.log('Speech service script loading');

class SpeechService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.isSpeechSupported = 'speechSynthesis' in window;
        this.voices = [];
        this.preferredVoice = null;
        
        // Initialize voices when available
        if (this.isSpeechSupported) {
            // Some browsers load voices asynchronously
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = () => this.loadVoices();
            }
            this.loadVoices();
        }
    }
    
    loadVoices() {
        this.voices = this.synth.getVoices();
        
        // Try to find a good US English voice
        this.preferredVoice = this.voices.find(voice => 
            voice.name.includes('US English') || 
            (voice.lang === 'en-US' && voice.name.includes('Google')) ||
            (voice.lang === 'en-US' && voice.name.includes('Female')) ||
            voice.lang === 'en-US'
        ) || this.voices[0]; // Fallback to first available voice
        
        console.log(`Loaded ${this.voices.length} voices. Selected: ${this.preferredVoice?.name || 'None'}`);
    }
    
    /**
     * Speak a word with the AI speech engine
     * @param {string} word - The word to pronounce
     * @param {Function} onStart - Callback when speech starts
     * @param {Function} onEnd - Callback when speech ends
     * @param {Function} onError - Callback if speech fails
     * @returns {Promise} Promise resolving when speech is complete
     */
    speakWord(word, onStart = null, onEnd = null, onError = null) {
        return new Promise((resolve, reject) => {
            if (!this.isSpeechSupported) {
                console.warn('Speech synthesis not supported in this browser');
                if (onError) onError();
                reject('Speech synthesis not supported');
                return;
            }
            
            // Cancel any ongoing speech
            this.synth.cancel();
            
            const utterance = new SpeechSynthesisUtterance(word);
            
            // Configure speech parameters
            utterance.voice = this.preferredVoice;
            utterance.rate = 0.8; // Slightly slower for clarity
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // Set up events
            utterance.onstart = () => {
                console.log(`Speaking: ${word}`);
                if (onStart) onStart();
            };
            
            utterance.onend = () => {
                console.log(`Finished speaking: ${word}`);
                if (onEnd) onEnd();
                resolve();
            };
            
            utterance.onerror = (event) => {
                console.error(`Speech error: ${event.error}`);
                if (onError) onError(event);
                reject(event);
            };
            
            // Speak the word
            this.synth.speak(utterance);
        });
    }
    
    /**
     * Convert a word to an audio URL using speech synthesis
     * @param {string} word - The word to convert
     * @returns {string} URL to the audio or null if not supported
     */
    async wordToAudioURL(word) {
        // This is a fallback approach - browser APIs don't directly support
        // converting speech to downloadable audio
        return `assets/audio/words/${word.toLowerCase()}.mp3`;
    }
    
    /**
     * Get all available voices
     * @returns {Array} Array of SpeechSynthesisVoice objects
     */
    getVoices() {
        return this.voices;
    }
    
    /**
     * Check if speech synthesis is paused
     * @returns {boolean} True if paused
     */
    isPaused() {
        return this.isSpeechSupported && this.synth.paused;
    }
    
    /**
     * Pause speech synthesis
     */
    pause() {
        if (this.isSpeechSupported) this.synth.pause();
    }
    
    /**
     * Resume speech synthesis
     */
    resume() {
        if (this.isSpeechSupported) this.synth.resume();
    }
    
    /**
     * Cancel speech synthesis
     */
    cancel() {
        if (this.isSpeechSupported) this.synth.cancel();
    }
}

// Create and export singleton instance - make it globally accessible
const speechService = new SpeechService();
window.speechService = speechService; // Ensure global availability

console.log('Speech service initialized:', speechService.isSpeechSupported ? 'Supported' : 'Not supported');
