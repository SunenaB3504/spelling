# Spelling Adventure 📚✨SDS-GenAlpha 📚✨

An interactive, AI-powered spelling application designed to help students practice and improve their spelling skills through engaging activities and personalized feedback.

![Spelling Adventure Screenshot](assets/img/screenshot.png)

## 🌟 Features

- **Adaptive Difficulty Levels**: Progress through three difficulty levels with words appropriate for different skill levels
- **AI-Powered Pronunciation**: Uses browser speech synthesis for word pronunciation
- **Multiple Learning Modes**:
  - **Assessment Mode**: Evaluate spelling skills and track progress
  - **Spelling Bee Game**: Fun, interactive way to practice spelling
  - **Custom Word Generator**: Practice any word with AI pronunciation
- **Progress Tracking**: Points, badges, and level advancement saved between sessions
- **Accessibility Features**: High contrast mode and adjustable text sizes
- **Responsive Design**: Works on desktops, tablets, and mobile devices

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, or Safari)
- Internet connection for initial loading

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/spelling-adventure.git
   ```

2. No build process required! Open `index.html` in your web browser:
   ```
   cd spelling-adventure
   open index.html  # On macOS
   # OR
   start index.html  # On Windows
   ```

3. For the best experience, use a web server:
   - With Python: `python -m http.server`
   - With Node.js: `npx serve`
   - With VS Code: Use the Live Server extension

## 📊 Project Structure

```
spelling-adventure/
├── index.html               # Main application entry point
├── styles.css               # Core styling
├── script.js                # Main application logic
├── js/
│   ├── speechService.js     # AI speech synthesis service
│   └── wordLists.js         # Word collections by difficulty level
├── assets/
│   ├── audio/
│   │   ├── words/           # Word pronunciation audio files
│   │   └── ui/              # UI sound effects
│   └── img/                 # Images and icons
└── docs/                    # Documentation
```

## 💻 Usage

1. **Dashboard**: Select your desired activity or adjust settings
2. **Assessment Mode**: Test your spelling skills to advance levels
3. **Spelling Bee Game**: Practice spelling with themed word collections
4. **Custom Words**: Enter any word to hear its pronunciation

### Level Progression

- **Level 1**: Basic 3-4 letter words
- **Level 2**: Intermediate 4-5 letter words
- **Level 3**: Advanced 5+ letter words

Progress is automatically saved in your browser's local storage.

## ⚙️ Technical Details

- **Pure JavaScript**: No frameworks or libraries required
- **Web Speech API**: Used for AI pronunciation
- **LocalStorage API**: Saves user progress between sessions
- **CSS Variables**: For theming and accessibility options
- **Responsive Design**: CSS Grid and Flexbox for layout

## 🔧 Customization

### Adding More Words

Edit the `js/wordLists.js` file to add more words to existing levels or create new themed collections:

```javascript
const newThemeWords = [
    { word: "example", audio: "assets/audio/words/example.mp3" },
    // Add more words
];

window.wordLists.game.newTheme = newThemeWords;
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- Speech synthesis powered by the Web Speech API
- Icons from Font Awesome Powered
- Fonts from Google Fontsd by the Web Speech API
