// ============================================
// HURST CLASS STUDY: LESSON DATA
// ============================================
// 
// HOW TO ADD A NEW LESSON:
// 
// 1. Copy the entire lesson object template below (from the opening { to the closing },)
// 2. Paste it at the end of the array (before the final ];)
// 3. Fill in your content for each field
// 4. Make sure each lesson has a unique "id"
// 5. Save this file
// 
// IMPORTANT: 
// - Each lesson object must be separated by a comma
// - The "id" must be unique and lowercase with hyphens (e.g., "lesson-1", "lesson-2")
// - Keep the quotes around text values
// - You can use both /audio/filename.mp3 OR full URLs like https://example.com/audio.mp3
// 
// ============================================

const lessonData = [
    {
        // REQUIRED: Unique identifier (used in the URL)
        id: "lesson-1",
        
        // REQUIRED: The lesson title
        title: "Lesson 1: The Word Became Flesh",
        
        // REQUIRED: Scripture reference
        scripture: "John 1:1-14",
        
        // REQUIRED: Short 1-2 sentence preview of the lesson
        summary_preview: "In the beginning was the Word, and the Word was with God, and the Word was God. John opens his Gospel with a profound declaration of Jesus' divine nature and His role in creation.",
        
        // REQUIRED: Full lesson summary (can be as long as you need)
        summary_full: "John's Gospel begins not with the birth of Jesus, but with a theological statement that echoes Genesis 1:1. The 'Word' (Logos in Greek) refers to Jesus Christ, who existed from eternity past. This Word was not merely with God, but was fully God Himself. Through Him, all things were created, and in Him was life and light. John emphasizes that this eternal Word became flesh and dwelt among us—the incarnation. Jesus, the Creator, humbled Himself to enter His creation as a human being. The glory revealed in Jesus is the glory of the Father's only Son, full of grace and truth. This foundational passage establishes Jesus' deity, His creative power, and His mission to bring light into the darkness of this world.",
        
        // REQUIRED: Short 1-2 sentence preview of how the song connects
        tie_in_preview: "This song celebrates the power and authority of God's Word, echoing John's declaration that through the Word all things were made.",
        
        // REQUIRED: Full explanation of the song's connection to the lesson
        tie_in_full: "The song 'By the Word' draws directly from John 1:1-3, celebrating the creative power of God's Word. Just as John declares that 'all things were made through Him,' the song reminds us that God spoke creation into existence. The lyrics emphasize that the same Word that created the universe became flesh to dwell among us. This musical reflection helps us grasp the magnitude of the incarnation—the eternal, all-powerful Word chose to become vulnerable flesh to bring us grace and truth. The song invites us to worship the One through whom all things exist and in whom we find life.",
        
        // REQUIRED: The title of the song
        song_title: "By the Word",
        
        // OPTIONAL: Path to the song's image (can be /images/filename.jpg or a full URL)
        image_url: "/images/lesson-1.jpg",
        
        // OPTIONAL: Path to the audio file (can be /audio/filename.mp3 or a full URL)
        audio_file: "/audio/lesson-1.mp3",
        
        // OPTIONAL: Link to the song on Suno (backup for users who can't play the audio)
        suno_link: "https://suno.com/song/abc123"
    },
    
    {
        id: "lesson-2",
        title: "Lesson 2: The First Disciples",
        scripture: "John 1:35-51",
        summary_preview: "Andrew, Peter, Philip, and Nathanael encounter Jesus and immediately recognize Him as the Messiah, demonstrating the transformative power of meeting Christ.",
        summary_full: "After John the Baptist identifies Jesus as the Lamb of God, two of John's disciples begin to follow Jesus. One of them, Andrew, immediately finds his brother Simon Peter and brings him to Jesus, who gives Simon the new name 'Peter' (rock). The next day, Jesus finds Philip and calls him to follow. Philip, in turn, finds Nathanael and tells him they have found the Messiah. When Nathanael expresses skepticism about anything good coming from Nazareth, Philip simply invites him: 'Come and see.' Jesus' encounter with Nathanael demonstrates His divine knowledge—He saw Nathanael under the fig tree before Philip called him. Nathanael's response is immediate worship: 'Rabbi, You are the Son of God! You are the King of Israel!' Jesus promises that Nathanael will see even greater things—heaven opened and angels ascending and descending on the Son of Man. This passage shows us the pattern of discipleship: encounter Jesus, be transformed, and invite others to 'come and see.'",
        tie_in_preview: "This song captures the invitation to 'come and see' Jesus, emphasizing that encountering Christ changes everything.",
        tie_in_full: "The song 'Come and See' reflects Philip's simple but profound invitation to Nathanael. When faced with skepticism, Philip didn't argue—he invited Nathanael to experience Jesus for himself. The song reminds us that Christianity is not primarily about winning arguments, but about introducing people to a Person. When we encounter Jesus—truly see Him for who He is—our lives are forever changed. The lyrics echo Jesus' promise to Nathanael that he would see 'greater things,' pointing us to the reality that every encounter with Christ opens our eyes to more of His glory. The song challenges us to both accept the invitation to 'come and see' Jesus ourselves, and to extend that same invitation to others who are searching.",
        song_title: "Come and See",
        image_url: "/images/lesson-2.jpg",
        audio_file: "/audio/lesson-2.mp3",
        suno_link: "https://suno.com/song/def456"
    },
    
    {
        id: "lesson-3",
        title: "Lesson 3: Water into Wine",
        scripture: "John 2:1-11",
        summary_preview: "At a wedding in Cana, Jesus performs His first miracle, turning water into wine and revealing His glory to His disciples.",
        summary_full: "Jesus, His mother Mary, and His disciples attend a wedding feast in Cana of Galilee. When the wine runs out—a significant social embarrassment for the host—Mary brings the problem to Jesus. His response, 'My hour has not yet come,' indicates an awareness of His mission and divine timing. Nevertheless, Mary instructs the servants to do whatever Jesus tells them. Jesus commands them to fill six stone water jars (used for Jewish purification ceremonies) with water—about 120-180 gallons total. When the servants draw some out and take it to the master of the feast, he discovers it has become wine, and not just any wine, but the finest wine of the celebration. John notes that this was the first of Jesus' signs, revealing His glory, and His disciples believed in Him. This miracle demonstrates Jesus' power over creation, His concern for human needs (even social ones), and serves as a sign pointing to His identity as the Messiah who would provide abundance and joy.",
        tie_in_preview: "This song celebrates the abundant life Jesus brings, transforming ordinary moments into extraordinary blessings.",
        tie_in_full: "The song 'New Wine' connects to Jesus' first miracle by celebrating the transformation He brings to our lives. Just as Jesus turned water into wine—and not just any wine, but the best wine—He transforms our ordinary existence into abundant life. The stone jars used for ceremonial washing represent the old covenant and religious ritual; Jesus transforms them into vessels of celebration and joy. The lyrics remind us that Jesus doesn't just fix our problems; He exceeds our expectations and provides more than we could ask or imagine. When the master of the feast tasted the wine, he was amazed that the best had been saved for last. This points to the truth that what Jesus offers surpasses everything the world provides. The song invites us to bring our empty vessels to Jesus, trusting that He will fill them with something far better than we could have obtained on our own.",
        song_title: "New Wine",
        image_url: "/images/lesson-3.jpg",
        audio_file: "/audio/lesson-3.mp3",
        suno_link: "https://suno.com/song/ghi789"
    }
    
    // ============================================
    // TO ADD A NEW LESSON:
    // 
    // 1. Add a comma after the closing } above
    // 2. Copy this template:
    // 
    // ,
    // {
    //     id: "lesson-4",
    //     title: "Lesson 4: Your Title Here",
    //     scripture: "John X:XX-XX",
    //     summary_preview: "Short preview here...",
    //     summary_full: "Full lesson text here...",
    //     tie_in_preview: "Short song connection here...",
    //     tie_in_full: "Full song explanation here...",
    //     song_title: "Song Title Here",
    //     image_url: "/images/lesson-4.jpg",
    //     audio_file: "/audio/lesson-4.mp3",
    //     suno_link: "https://suno.com/song/your-song-id"
    // }
    //
    // 3. Fill in all the fields
    // 4. Save the file
    // ============================================
];
