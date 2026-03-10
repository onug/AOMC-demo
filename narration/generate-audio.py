#!/usr/bin/env python3
"""
macOS Voice Narration Generator (FREE - No API Required!)
ONUG Agentic AI Overlay Demo

Generates audio files from narration scripts using macOS built-in voices.

Usage:
    # Generate all narration
    python3 generate-audio.py
    
    # Generate for specific demo
    python3 generate-audio.py --demo terminal
    
    # Preview without generating
    python3 generate-audio.py --dry-run
    
    # Use a different voice
    python3 generate-audio.py --voice Samantha
    
    # List available voices
    python3 generate-audio.py --list-voices

Requirements:
    - macOS (uses built-in 'say' command)
    - No API key needed!
    - Completely FREE!
"""

import os
import sys
import json
import argparse
import subprocess
from pathlib import Path


# Default voice - Samantha is a good professional female voice on macOS
DEFAULT_VOICE = "Samantha"


def list_voices():
    """List all available macOS voices."""
    print("\nAvailable macOS Voices:")
    print("=" * 60)
    try:
        result = subprocess.run(
            ["say", "-v", "?"],
            capture_output=True,
            text=True
        )
        
        # Filter for English voices and format nicely
        voices = []
        for line in result.stdout.strip().split("\n"):
            if "en_" in line or "en-" in line:
                parts = line.split()
                voice_name = parts[0]
                voices.append(voice_name)
        
        print("English voices:")
        for v in sorted(set(voices)):
            marker = " ← (default)" if v == DEFAULT_VOICE else ""
            print(f"  • {v}{marker}")
        
        print("\nRecommended for professional narration:")
        print("  • Samantha - American female (default)")
        print("  • Allison - American female")
        print("  • Ava - American female (premium)")
        print("  • Karen - Australian female")
        print("  • Daniel - British male")
        print("  • Tom - American male")
        print("\nTo use a voice: python3 generate-audio.py --voice Ava")
        
    except Exception as e:
        print(f"Error listing voices: {e}")


def load_script(script_path: Path) -> dict:
    """Load narration script from JSON file."""
    with open(script_path, 'r') as f:
        return json.load(f)


def generate_audio(text: str, output_path: Path, voice: str, rate: int) -> bool:
    """Generate audio from text using macOS say command."""
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # First generate AIFF (say's native format)
        aiff_path = output_path.with_suffix('.aiff')
        
        result = subprocess.run(
            ["say", "-v", voice, "-r", str(rate), "-o", str(aiff_path), text],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"  Error: {result.stderr}")
            return False
        
        # Convert AIFF to MP3 using afconvert (built into macOS)
        result = subprocess.run(
            ["afconvert", "-f", "mp4f", "-d", "aac", str(aiff_path), str(output_path.with_suffix('.m4a'))],
            capture_output=True,
            text=True
        )
        
        # Also keep as AIFF and rename to mp3 for compatibility
        # (The demo player will work with AIFF renamed to mp3 on macOS)
        os.rename(aiff_path, output_path)
        
        return True
        
    except Exception as e:
        print(f"  Error: {e}")
        return False


def process_demo(demo_name: str, scripts_dir: Path, audio_dir: Path, 
                 voice: str, rate: int, dry_run: bool, force: bool) -> tuple:
    """Process all segments for a demo, return (success_count, total_count)."""
    script_path = scripts_dir / f"{demo_name}-script.json"
    
    if not script_path.exists():
        print(f"Script not found: {script_path}")
        return (0, 0)
    
    script = load_script(script_path)
    segments = script.get("segments", [])
    
    print(f"\n{'='*60}")
    print(f"Processing: {demo_name} demo ({len(segments)} segments)")
    print(f"{'='*60}")
    
    output_dir = audio_dir / demo_name
    success_count = 0
    
    for i, segment in enumerate(segments):
        segment_id = segment["id"]
        text = segment["text"]
        duration = segment.get("duration_estimate", "?")
        output_path = output_dir / f"{segment_id}.mp3"
        
        print(f"\n[{i+1}/{len(segments)}] {segment_id} (~{duration}s)")
        print(f"  Text: {text[:60]}{'...' if len(text) > 60 else ''}")
        
        if dry_run:
            print(f"  → Would save to: {output_path}")
            success_count += 1
        else:
            # Skip if file already exists (unless force)
            if output_path.exists() and not force:
                print(f"  ⏭️  Already exists, skipping")
                success_count += 1
                continue
                
            print(f"  Generating...", end=" ", flush=True)
            if generate_audio(text, output_path, voice, rate):
                print(f"✓ Done")
                success_count += 1
            else:
                print(f"✗ Failed")
    
    return (success_count, len(segments))


def main():
    parser = argparse.ArgumentParser(
        description="Generate voice narration using macOS built-in voices (FREE!)"
    )
    parser.add_argument(
        "--demo", 
        choices=["terminal", "web", "live", "all"],
        default="all",
        help="Which demo to generate audio for"
    )
    parser.add_argument(
        "--voice",
        default=DEFAULT_VOICE,
        help=f"macOS voice to use (default: {DEFAULT_VOICE})"
    )
    parser.add_argument(
        "--rate",
        type=int,
        default=175,
        help="Speech rate in words per minute (default: 175)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview segments without generating audio"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate all files even if they exist"
    )
    parser.add_argument(
        "--list-voices",
        action="store_true",
        help="List available macOS voices"
    )
    parser.add_argument(
        "--scripts-dir",
        type=Path,
        default=Path(__file__).parent / "scripts",
        help="Directory containing script JSON files"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).parent / "audio",
        help="Directory for generated audio files"
    )
    
    args = parser.parse_args()
    
    # List voices and exit
    if args.list_voices:
        list_voices()
        sys.exit(0)
    
    # Check we're on macOS
    if sys.platform != "darwin":
        print("Error: This script requires macOS (uses the 'say' command)")
        print("For other platforms, use the OpenAI version: generate-audio-openai.py")
        sys.exit(1)
    
    # Determine which demos to process
    if args.demo == "all":
        demos = ["terminal", "web", "live"]
    else:
        demos = [args.demo]
    
    print("=" * 60)
    print("🎤 AOMC Demo Voice Narration Generator")
    print("   Using macOS Built-in Voices (FREE!)")
    print("=" * 60)
    print(f"Voice: {args.voice}")
    print(f"Rate: {args.rate} wpm")
    print(f"Scripts: {args.scripts_dir}")
    print(f"Output: {args.output_dir}")
    print(f"Mode: {'DRY RUN' if args.dry_run else 'GENERATE'}")
    
    # Process each demo
    total_success = 0
    total_segments = 0
    
    for demo in demos:
        success, total = process_demo(
            demo, 
            args.scripts_dir, 
            args.output_dir,
            args.voice,
            args.rate,
            args.dry_run,
            args.force
        )
        total_success += success
        total_segments += total
    
    # Summary
    print(f"\n{'='*60}")
    print(f"✅ COMPLETE: {total_success}/{total_segments} segments")
    if not args.dry_run:
        print(f"📁 Audio files saved to: {args.output_dir}")
    print(f"💰 Cost: FREE!")
    print(f"{'='*60}")
    
    if not args.dry_run and total_success > 0:
        print(f"\n🎉 Now run your demo with voice:")
        print(f"   cd ..")
        print(f"   NARRATION=1 python3 demo.py")
    
    print()


if __name__ == "__main__":
    main()
