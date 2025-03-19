# Creating Word Pronunciation Audio Files

## Method 1: Using Google Text-to-Speech (Easy)

1. Go to https://ttsmp3.com/ (uses Google's TTS engine)
2. Steps:
   - Select your preferred voice (US English voices like "Matthew" or "Joanna" are good for clear pronunciation)
   - Type a single word in the text field (e.g., "cat")
   - Click "Convert to MP3"
   - Listen to preview and adjust voice if needed
   - Click "Download" button to save the MP3
   - Rename the file to match your word (e.g., "cat.mp3")
   - Repeat for all words

## Method 2: Using Natural Readers (Higher Quality)

1. Go to https://www.naturalreaders.com/online/
2. Steps:
   - Type your word in the text field
   - Select a premium voice (they offer free usage up to a limit)
   - Click the play button to preview
   - Click the download button (looks like a downward arrow)
   - Save the file as MP3
   - Rename the file to match your word

## Method 3: Recording from Browser (For Any TTS Service)

If a site doesn't allow direct downloads:

1. Use https://dictation.io/speech or any TTS site
2. Set up audio recording software:
   - On Windows: Open Voice Recorder app
   - On Mac: Open QuickTime and select File > New Audio Recording
   - Or use Audacity for more control
3. Steps:
   - Play the word pronunciation on the website
   - Record the audio with your recording software
   - Trim any silence before/after the word
   - Save as MP3

## Processing Tips for Better Quality

1. Use Audacity (free, open-source) to process files:
   - Trim silence at beginning and end
   - Normalize volume (Effect > Normalize)
   - Add a short fade-in and fade-out
   - Export as MP3 at 128kbps

## Batch Processing

For your six required words (cat, dog, fish, cake, bird, jump):

1. Create a text file with each word on a separate line
2. Some TTS services allow batch processing with pauses
3. Record the full audio and then split in Audacity:
   - Use the "Add Label at Selection" to mark each word
   - Then use "File > Export Multiple" to save each section as a separate file

## Organizing Files

Save all files in the assets folder structure:
```
c:\Users\Admin\spelling\assets\audio\words\
```

Make sure filenames match exactly what's referenced in your script.js:
- cat.mp3
- dog.mp3
- fish.mp3
- cake.mp3
- bird.mp3
- jump.mp3
