# TROUBLESHOOTING GUIDE

## Common Issues and Solutions

### Issue: Lesson doesn't appear on homepage

**Possible Causes:**
1. Missing comma after previous lesson
2. Syntax error in data.js
3. Duplicate lesson ID

**Solution:**
```javascript
// ❌ WRONG - No comma after lesson-2
{
    id: "lesson-2",
    ...
}
{
    id: "lesson-3",
    ...
}

// ✅ CORRECT - Comma after lesson-2
{
    id: "lesson-2",
    ...
},
{
    id: "lesson-3",
    ...
}
```

### Issue: "Lesson Not Found" error

**Possible Causes:**
1. The lesson ID in the URL doesn't match data.js
2. Typo in the lesson ID

**Solution:**
Make sure the `id` field exactly matches what's in the URL:
- URL: `lesson.html?id=lesson-3`
- data.js: `id: "lesson-3"`

### Issue: Audio player not working

**Possible Causes:**
1. Audio file path is wrong
2. File not uploaded
3. File format not supported

**Solutions:**
1. Check the path: `/audio/lesson-1.mp3` (starts with /)
2. Verify the file exists in the audio folder
3. Make sure it's an MP3 file
4. Try the Suno backup link

### Issue: Image not showing

**Possible Causes:**
1. Image path is wrong
2. File not uploaded
3. Filename doesn't match

**Solutions:**
1. Check the path: `/images/lesson-1.jpg`
2. Verify the file exists in the images folder
3. Check for typos in the filename
4. Make sure filename is lowercase if specified that way

### Issue: Page looks broken or weird

**Possible Causes:**
1. Missing closing quote or bracket in data.js
2. Browser cache showing old version

**Solutions:**
1. Check all quotes are paired: `" "` or `' '`
2. Check all brackets: `{ }` and `[ ]`
3. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

### Issue: Navigation buttons missing

**Possible Causes:**
1. Only one lesson in data.js
2. JavaScript error preventing load

**Solution:**
- Previous button only shows if there's a previous lesson
- Next button only shows if there's a next lesson
- First lesson won't have "Previous"
- Last lesson won't have "Next"

### Issue: Can't edit data.js

**Possible Causes:**
1. Using wrong program
2. File is read-only

**Solutions:**
1. Use any text editor:
   - Windows: Notepad, Notepad++, VS Code
   - Mac: TextEdit, VS Code, Sublime Text
2. Right-click → Properties → Uncheck "Read-only"

### Issue: Changes not appearing on live site

**Possible Causes:**
1. Didn't upload updated file
2. Browser cache
3. Hosting provider delay

**Solutions:**
1. Make sure you uploaded the updated data.js
2. Clear browser cache or hard refresh
3. Wait 5-10 minutes for changes to propagate
4. Try in incognito/private browsing mode

---

## How to Check for Errors

### In Your Browser:
1. Press F12 to open Developer Tools
2. Click "Console" tab
3. Refresh the page
4. Look for red error messages
5. Common errors:
   - "Unexpected token" = Missing comma or quote
   - "Cannot read property" = Typo in field name
   - "404 Not Found" = File path is wrong

### Testing data.js Syntax:
1. Copy all of data.js
2. Go to https://jsonlint.com (change mode to JavaScript)
3. Paste and validate
4. It will show you exactly where errors are

---

## Still Having Problems?

1. ✅ Check this guide first
2. ✅ Read the README.md
3. ✅ Look at the browser console (F12)
4. ✅ Compare your code to the working examples
5. ✅ Make sure you saved your changes
6. ✅ Make sure you uploaded the updated files

---

## Prevention Tips

1. **Make backups** - Save a copy of data.js before editing
2. **Add one lesson at a time** - Don't add 10 lessons at once
3. **Test locally first** - Open index.html in browser before uploading
4. **Use a good text editor** - VS Code or Notepad++ show syntax errors
5. **Copy existing lessons** - Don't type from scratch, copy and modify

---

**Most issues are simple syntax errors that are easy to fix once you spot them!**
