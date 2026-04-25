# Tenth Hour Lyric Checker

`check-lyrics` is a Python tool for validating Tenth Hour songwriting against the manifesto and the Suno production rules. It runs against locked lyrics, Suno Musical Scripts, and Style of Music prompts.

It's the automated companion to **Stages 12 (Singing Test)** and **15 (AI Tell Pass)** of the [Tenth Hour Songwriting Process](../../Library/Mobile%20Documents/com~apple~CloudDocs/Music/Tenth%20Hour%20/Songwriting%20Process.md). The tool catches what regex can catch; it does not replace the human work of singing the song aloud or comparing it against the kin.

## What it does

### Lyric mode (default)

Run on the locked clean lyrics file before pasting into Suno.

- **Singability**: per-line syllable counts, line-ending vowel openness, opening-line consonant clusters, register classification (anthemic / confessional / sparse)
- **Rhyme structure**: scheme detection per stanza
- **AI tells (14 patterns)**: archaic-poetic language, common cliches, register-shift words
- **Modern psych language (10 patterns)**: words that don't belong in biblical-era witness contexts
- **Suspect-word frequency**: thresholds for words like "yet", "still", "amidst", "shall", "behold"
- **Stage 15 patterns**:
  - Triadic constructions ("the road, the night, the silence")
  - Adjective-noun AI defaults ("quiet certainty," "trembling hands," etc.)
  - "And the X verbed" closings
  - Literary words stacked (whisper/echo/shadow/stillness/hush)
  - Abstractions disguised as images ("the weight of waiting")
  - Tense consistency check
  - Line-opener cadence check
- **Punctuation**: em-dash count, ellipsis count, ellipses-in-opening (Suno-aware)

Outputs an overall score (0-100) plus categorized findings (ERROR / WARNING / INFO).

### Suno script mode (`--suno`)

Validates the Musical Script that gets pasted into Suno's Lyrics field.

- Forbidden tags: `[Spoken Word]`, `[Pause]`, `[Hold]`
- Bracket length: max 5 words for plain tags, max 12 for parameterized (with colons)
- `[Breath]` tag immediately before first sung line (causes mumbling)
- Ellipses in first 1-2 sung lines (causes hesitation)
- Hyphen-split words ("be-cause", "for-given")
- Progressive CAPS check across choruses (informational)
- Plus all the regular lyric checks on the sung text

### Style prompt mode (`--style`)

Validates the Style of Music prompt that gets pasted into Suno's Style field.

- Mandatory elements: Unpolished, Analog warmth, Raw production/feel, NOT pop, NOT synth, NOT Auto-Tune
- Tag count ceiling (warns at >12 main tags — past 10, Suno averages signals into mush)
- Genre-first ordering (informational — Suno weights earlier tags more)

### Codex Sage review (`--codex-review`)

Optional qualitative pass via the [OpenAI Codex CLI](https://github.com/openai/codex). Catches things regex misses: generic lines, voice slips, lines that "sound AI" without tripping a specific rule, theological accuracy concerns. Slow (1-3 minutes per call) — use on locked drafts before final Suno generation.

## Installation

```bash
pip3 install --user -r requirements.txt
python3 -c "import nltk; nltk.download('cmudict')"
chmod +x check-lyrics
```

For convenience, symlink to your `~/bin/`:

```bash
ln -s "$(pwd)/check-lyrics" ~/bin/check-lyrics
```

For Codex Sage review, also install the Codex CLI: `brew install codex` (or per OpenAI's docs).

## Usage

```bash
# lyric checks (default)
./check-lyrics path/to/locked-lyrics.txt
./check-lyrics path/to/locked-lyrics.txt --label "Lesson 18 song"
./check-lyrics path/to/locked-lyrics.txt --verbose       # show all info findings

# Suno Musical Script validation
./check-lyrics path/to/script.txt --suno

# Style of Music prompt validation
./check-lyrics path/to/style.txt --style

# Add Codex Sage qualitative pass
./check-lyrics path/to/locked-lyrics.txt --codex-review

# JSON output (for scripting)
./check-lyrics path/to/locked-lyrics.txt --json
```

## Calibration

Calibrated against 19 narrative-folk benchmark songs from artists in The Tenth Hour's lane:

**Tier 1 — Christian-adjacent peers**: Rich Mullins, Andrew Peterson, Josh Garrels, Sandra McCracken, Jars of Clay, NEEDTOBREATHE, The Welcome Wagon, The Porter's Gate, Caedmon's Call

**Tier 2 — Secular peers (similar craft)**: The Band, Sufjan Stevens, Jason Isbell, The Avett Brothers, Fleet Foxes, Mumford & Sons

**Tier 3 — Anti-patterns**: synthetic AI-tell-ridden lyrics designed to fire every blacklist rule

A good Tenth Hour-style song scores **60-80**. The synthetic anti-pattern scored 30 with 6 errors and 26 warnings. No Tier 1 song scored below 60.

## Output severity

- **ERROR** — must fix before Suno generation (forbidden Suno tags, theological errors, modern psych language)
- **WARNING** — judgment call (AI tells, suspect-word frequency, syllable variance, voice register concerns)
- **INFO** — descriptive only (weak line endings, line-opener distribution under threshold) — no score deduction

## Score formula (lyric mode)

- 60% singability (avg ending strength × 6)
- 40% findings deductions (ERROR -10 each, WARNING -3 each, INFO 0)

INFO findings are descriptive only — they do not deduct from the score. The avg ending singability already reflects what the info notes are reporting on.

## When to skip

- The tool catches **patterns**. It does not catch:
  - Lines that fit the patterns but feel honest in context
  - Lines that fail the patterns but are gold (e.g., a deliberately abstracted moment)
  - Voice slips that need ear, not regex
  - Generic lines that fit no specific blacklist

That's what the Codex Sage pass (`--codex-review`) and Stage 14 (Compare Against Kin) are for. The tool is a fast first pass, not a verdict.
