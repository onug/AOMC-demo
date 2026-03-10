# Voice Narration System (FREE - macOS)

Generate voice narration using **macOS built-in voices** — completely free, no API key required!

## Quick Start

### 1. Generate the Audio Files

```bash
cd narration
python3 generate-audio.py
```

That's it! No API keys, no accounts, no cost.

### 2. Run the Demo with Voice

```bash
cd ..
NARRATION=1 python3 demo.py
```

---

## Voice Options

macOS has several built-in voices. Default is **Samantha** (American female).

### List Available Voices
```bash
python3 generate-audio.py --list-voices
```

### Recommended Voices
| Voice | Description |
|-------|-------------|
| `Samantha` | American female (default) |
| `Allison` | American female |
| `Ava` | American female (premium quality) |
| `Karen` | Australian female |
| `Daniel` | British male |
| `Tom` | American male |

### Use a Different Voice
```bash
python3 generate-audio.py --voice Ava
```

---

## Commands

```bash
# Generate all audio (terminal, web, live demos)
python3 generate-audio.py

# Generate only terminal demo
python3 generate-audio.py --demo terminal

# Preview without generating
python3 generate-audio.py --dry-run

# Use a different voice
python3 generate-audio.py --voice Karen

# Adjust speech rate (words per minute)
python3 generate-audio.py --rate 150

# Regenerate all files
python3 generate-audio.py --force

# List available voices
python3 generate-audio.py --list-voices
```

---

## Upgrading Voice Quality

Want even better voices? macOS has premium voices you can download:

1. Open **System Settings** → **Accessibility** → **Spoken Content**
2. Click **System Voice** → **Manage Voices**
3. Download premium voices like **Ava (Enhanced)** or **Zoe (Enhanced)**

Then use them:
```bash
python3 generate-audio.py --voice "Ava (Enhanced)"
```

---

## File Structure

```
narration/
├── scripts/
│   ├── terminal-script.json    # Narration text
│   ├── web-script.json
│   └── live-script.json
├── audio/
│   ├── terminal/               # Generated audio files
│   ├── web/
│   └── live/
├── generate-audio.py           # This script
└── README.md
```

---

## Troubleshooting

### "command not found: say"
This script only works on macOS. The `say` command is built into every Mac.

### Audio sounds robotic
Try downloading enhanced voices in System Settings (see above).

### Want to regenerate one file?
Delete it and run the generator again:
```bash
rm audio/terminal/intro.mp3
python3 generate-audio.py --demo terminal
```
