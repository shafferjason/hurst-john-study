# QUICK START GUIDE
## Get Your Site Online in 10 Minutes

### Step 1: Download Everything
You already have all the files! The folder contains:
- ✅ index.html (homepage)
- ✅ lesson.html (lesson template)
- ✅ style.css (all styling)
- ✅ data.js (your lesson content - with 3 sample lessons)
- ✅ README.md (full documentation)
- ✅ audio/ folder (place MP3s here)
- ✅ images/ folder (place images here)

### Step 2: Test Locally (Optional)
1. Open `index.html` in your web browser
2. Click through the sample lessons
3. Everything should work except audio/images (those files don't exist yet)

### Step 3: Choose Your Hosting

#### OPTION A: GitHub Pages (Free, Recommended)
1. Go to https://github.com and create a free account
2. Click "New Repository" 
3. Name it: `john-study` (or whatever you want)
4. Upload all files from this folder
5. Go to Settings → Pages
6. Enable GitHub Pages from the "main" branch
7. Your site is live at: `https://YOUR-USERNAME.github.io/john-study`

#### OPTION B: Netlify (Free, Easiest)
1. Go to https://www.netlify.com
2. Drag this entire folder onto their homepage
3. Done! Your site is live immediately

#### OPTION C: Your Own Web Host
Upload all files and folders to your hosting provider via FTP.

### Step 4: Add Your First Real Lesson
1. Download your song from Suno as MP3
2. Save a song image (JPG or PNG)
3. Place audio in `/audio/` folder as `lesson-4.mp3`
4. Place image in `/images/` folder as `lesson-4.jpg`
5. Open `data.js` in any text editor
6. Scroll to the bottom
7. Add a comma after lesson-3's closing `}`
8. Copy the template and fill in your content
9. Save and upload `data.js`

### Step 5: You're Done!
The site will automatically:
- Add your lesson to the homepage list
- Create the lesson page with all content
- Generate Previous/Next navigation
- Embed the audio player
- Everything just works!

---

## The Magic: Only Edit ONE File

To add lessons 4, 5, 6, 7... forever:
**You only edit data.js**

The HTML template files never need to be touched.

---

## Sample data.js Entry

```javascript
,
{
    id: "lesson-4",
    title: "Lesson 4: Nicodemus Visits Jesus",
    scripture: "John 3:1-21",
    summary_preview: "A Pharisee comes to Jesus by night...",
    summary_full: "Full text here...",
    tie_in_preview: "The song explores being born again...",
    tie_in_full: "Full explanation here...",
    song_title: "Born Again",
    image_url: "/images/lesson-4.jpg",
    audio_file: "/audio/lesson-4.mp3",
    suno_link: "https://suno.com/song/xyz123"
}
```

---

## Need Help?

1. Read the full README.md
2. Check your browser console (F12) for errors
3. Make sure all quotes and commas are correct in data.js

**You've got this! 🎉**
