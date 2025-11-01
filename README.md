# Hurst Class Study: Book of John

A minimalist, dark-mode website for hosting Bible study lessons with integrated music.

## 📁 What's Included

- **index.html** - The main homepage that lists all lessons
- **lesson.html** - The template page that displays individual lessons
- **style.css** - All the styling (dark mode, layout, etc.)
- **data.js** - THE ONLY FILE YOU NEED TO EDIT to add new lessons

## 🚀 How to Get Started

### Option 1: GitHub Pages (Recommended - Free & Easy)

1. Create a free GitHub account at https://github.com
2. Create a new repository (call it something like "john-study")
3. Upload these 4 files to the repository
4. Create two folders in your repository:
   - `audio` (for MP3 files)
   - `images` (for lesson images)
5. Go to Settings → Pages → Enable GitHub Pages
6. Your site will be live at: `https://your-username.github.io/john-study`

### Option 2: Any Web Host

Upload all files to your web hosting provider along with the `audio` and `images` folders.

## ✏️ How to Add a New Lesson

**You only need to edit ONE file: data.js**

1. Open `data.js` in any text editor (Notepad, TextEdit, VS Code, etc.)
2. Scroll to the bottom
3. Add a comma after the last lesson's closing `}`
4. Copy the template from the comments at the bottom
5. Fill in your content
6. Save the file
7. Upload to your website

### Example:

```javascript
,
{
    id: "lesson-4",
    title: "Lesson 4: Jesus Cleanses the Temple",
    scripture: "John 2:13-25",
    summary_preview: "Your short preview here...",
    summary_full: "Your full lesson text here...",
    tie_in_preview: "How the song connects...",
    tie_in_full: "Full explanation...",
    song_title: "Holy Ground",
    image_url: "/images/lesson-4.jpg",
    audio_file: "/audio/lesson-4.mp3",
    suno_link: "https://suno.com/song/your-id"
}
```

## 🎵 Adding Audio Files

### Method 1: Download from Suno and Host

1. Download your song as MP3 from Suno
2. Rename it (e.g., `lesson-4.mp3`)
3. Upload to your `audio` folder
4. In data.js, use: `audio_file: "/audio/lesson-4.mp3"`

### Method 2: Use the Suno Link Only

If you don't want to download/upload:
1. Leave `audio_file` empty or remove that line
2. Just include the `suno_link`
3. Users will click through to listen on Suno

### Method 3: Both (Recommended)

Include both for the best experience:
- `audio_file` for the embedded player
- `suno_link` as a backup

## 🖼️ Adding Images

1. Save your image as JPG or PNG
2. Rename it (e.g., `lesson-4.jpg`)
3. Upload to your `images` folder
4. In data.js, use: `image_url: "/images/lesson-4.jpg"`

## 📱 Features

- ✅ Fully responsive (works on phones, tablets, computers)
- ✅ Dark mode (easy on the eyes)
- ✅ Accordion text expansion (keeps the page clean)
- ✅ Auto-generated navigation (Previous/Next buttons)
- ✅ HTML5 audio player with Suno backup
- ✅ No database needed
- ✅ No coding required to add lessons

## 🔧 Folder Structure

```
your-website/
├── index.html
├── lesson.html
├── style.css
├── data.js
├── audio/
│   ├── lesson-1.mp3
│   ├── lesson-2.mp3
│   └── lesson-3.mp3
└── images/
    ├── lesson-1.jpg
    ├── lesson-2.jpg
    └── lesson-3.jpg
```

## ❓ Troubleshooting

**Lesson not showing up?**
- Make sure you added a comma after the previous lesson
- Check that the `id` is unique
- Make sure all quotes are matching

**Audio not playing?**
- Check that the file path is correct
- Make sure the MP3 file is uploaded
- Try the Suno backup link

**Images not loading?**
- Verify the file path matches the filename exactly
- Check that images are in the `/images/` folder

## 💡 Tips

1. **Test locally first**: Open `index.html` in your browser before uploading
2. **Use descriptive IDs**: `lesson-1`, `lesson-2` (not random names)
3. **Keep backups**: Save a copy of `data.js` before making major changes
4. **Start simple**: Add one lesson at a time to make sure it works

## 🎨 Customization

Want to change colors or fonts? Edit `style.css`:
- Background color: Line 13 (`background-color: #1a1a1a;`)
- Text color: Line 14 (`color: #e0e0e0;`)
- Link color: Line 60 (`color: #6eb5ff;`)

## 📞 Need Help?

If you get stuck:
1. Double-check the syntax in `data.js`
2. Make sure all quotes and commas are correct
3. Test in your browser's console (F12) for error messages

---

**Built with simplicity in mind for the Tenth Hour ministry.**
