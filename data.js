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
        title: "Lesson 1: A Deep Dive into the Gospels",
        
        // REQUIRED: Scripture reference
        scripture: "Matthew, Mark, Luke - Overview",
        
        // REQUIRED: Short 1-2 sentence preview of the lesson
        summary_preview: "This foundational lesson explores the Synoptic Gospels—Matthew, Mark, and Luke—examining why we have four distinct accounts of Jesus's life and what makes each Gospel unique.",
        
        // REQUIRED: Full lesson summary (can be as long as you need)
        summary_full: "This lesson served as a foundational study of the Synoptic Gospels (Matthew, Mark, and Luke) to prepare for a deeper study into the Gospel of John. The session explored the definition of 'the gospel,' the literary genre of ancient biography, and the crucial concept of 'target audience' to explain why we have four distinct accounts of Jesus's life. The lesson began with a foundational question: 'What does gospel mean?' The word comes from the Greek euangelion, meaning 'good news,' often used in ancient times to announce a military victory. In a Christian context, quoting 1 Corinthians 15:1-4, the Gospel is the record that 'Christ died for our sins, according to the scriptures, that he was buried, and that he was raised on the 3rd day according to the scriptures.' The discussion then shifted to the genre of the Gospels. While we consider them biographies of Jesus, they must be understood through the lens of ancient biography, which differs significantly from modern biography. Ancient biographers focused on what they deemed most important, often skipping large sections of a person's life—like the missing portions of Jesus's life from infancy to age 12, and from age 12 to 30. The central question was, 'Why do we need four different accounts?' The main reason is that each Gospel was written for a specific target audience. Matthew wrote for Jewish Christians, using heavy Old Testament references (60-100 times) and Jewish terminology. Mark wrote for Gentile Romans, incorporating Latin words and explaining Jewish customs his audience wouldn't know. Luke, a Gentile physician, wrote the most comprehensive gospel with historical detail, universal scope, special emphasis on women (43 mentions), and unique parables. The lesson concluded by emphasizing that the different details in the Gospels are not contradictions. These differences are a hallmark of authentic, independent testimony, all pointing to the same foundational truth.",
        
        // REQUIRED: Short 1-2 sentence preview of how the song connects
        tie_in_preview: "The song 'Enough of the Road' captures the struggle of finding authentic words to share our faith story, inspired by the realization that each Gospel writer crafted their account for a specific audience.",
        
        // REQUIRED: Full explanation of the song's connection to the lesson
        tie_in_full: "Our journey began not with an answer, but with a surprisingly difficult question. When our group leader, Ben, asked us to define the word 'gospel'—a word we use all the time—a quiet struggle filled the room. The definition felt clear in our hearts, yet we couldn't find the words to succinctly express it. That shared, public challenge is captured in the song's opening verse, which takes the struggle and places it in an intimate, one-on-one context. The song opens in the 'lamplight of her kitchen,' where the narrator's 'old Sunday phrases' crumble, forcing a search for a more honest way to share their story. The lesson then pivoted from that personal struggle to a historical revelation. The leader introduced a concept new to many of us: that each of the gospel writers crafted their story for a specific 'target audience.' With this new perspective, the differences between the Gospels no longer seemed like weaknesses to be defended. Instead, they became a strength, serving as powerful evidence of the story's authenticity. Like variations in eyewitness accounts, the unique details in each testimony pointed to the same core truth. The song finds its answer by looking to their example. It realizes that each gospel writer crafted a story from their own experiences, intentionally tailoring it to a unique audience. The 'different kindling' represents their individual perspectives, unique details, and even the seemingly contradictory parts of their accounts. But all of that different kindling serves to reveal the one 'same bright fire': the single, unchanging truth of the Gospel. This realization is more than a permission slip; it's a lesson and a challenge that we, too, must tell the story in a way tailored for our audience. It frees us from the pressure of getting every detail perfect, reminding us that it doesn't have to be 'the whole map,' just 'enough of the road' to help someone find their way.",
        
        // REQUIRED: The title of the song
        song_title: "Enough of the Road",
        
        // OPTIONAL: Path to the song's image (can be /images/filename.jpg or a full URL)
        image_url: "images/lesson-1.png",
        
        // OPTIONAL: Path to the audio file (can be /audio/filename.mp3 or a full URL)
        audio_file: "audio/lesson-1.mp3",
        
        // OPTIONAL: Link to the song on Suno (backup for users who can't play the audio)
        suno_link: "https://suno.com/s/3DKxQRvElIiDWZXN"
    }, {
        id: "lesson-2",
        title: "Lesson 2: Reading the Gospels with Humility and Context",
        scripture: "Matthew 8:1-4",
        summary_preview: "This week, the group continued its introduction to the Gospels, moving from a recap of the previous week's discussion on the synoptic Gospels to the foundational principles of how to read and interpret scripture responsibly...",
        summary_full: "This week, the group continued its introduction to the Gospels, moving from a recap of the previous week's discussion on the synoptic Gospels (Matthew, Mark, and Luke) to the foundational principles of how to read and interpret scripture responsibly. The central theme was the importance of understanding context—historical, literary, and authorial—to avoid misinterpretation and truly hear what the text is communicating about Jesus.\n\nKey Principles of Gospel Interpretation:\n\nThe lesson began by establishing two foundational questions that should guide any reading of the Gospels:\n\n1. What does this communicate about Jesus? This should be the primary question, grounding the reader in the central purpose of a Gospel before moving to personal application.\n\n2. What is the primary point of the passage? Identifying the main idea is crucial before dissecting individual verses or details.\n\nTo answer these questions accurately, several layers of context must be considered:\n\n• Historical Context: The text was written for us, but not to us. We read it through a 21st-century lens, but it was written in a 1st-century world. Understanding the original setting is vital. An example given was the crucifixion, which was a deeply terrifying and offensive public spectacle to a 1st-century audience, a reality whose sharp edges have been dulled for modern readers.\n\n• Literary Context (The Bull's-Eye Method): A verse should never be read in isolation. The leader, Ben, illustrated this with a 'bull's-eye' analogy for study: Start with the individual verse, zoom out to the surrounding passage and chapter, zoom out further to the entire book or letter to grasp the author's overarching message, consider the author's other writings, expand to the context of the entire New Testament, and finally, consider the full context of all of Scripture.\n\nDescription vs. Prescription: The Most Important Principle\n\nThe most significant teaching point of the lesson was discerning between description and prescription. Everything in the Gospels describes an event, a setting, or a conversation. However, not everything is a direct prescription or command for Christians today.\n\n• The Core Illustration (Matthew 8:1-4): Ben used the story of Jesus healing the man with a skin disease as the key example. Jesus commanded the man, 'See that you do not tell anyone, but go show yourself to the priest and offer the gift that Moses prescribed.' This was a descriptive command for a specific person living under the Old Covenant. It is not prescriptive for believers today. If it were, every time we recovered from an illness, we would be required to bring two birds, two male lambs, and a ewe lamb to a priest. This powerful example made it clear that we cannot treat every command from Jesus in the Gospels as a direct, universal law for the church today.\n\nClass Discussion: The Danger of Misinterpretation\n\nThe principles discussed were brought to life through personal stories and class participation.\n\n• Ben's Psalm 23 Story: Ben shared his own experience as a teenager misreading Psalm 23 ('The Lord is my shepherd, I shall not want'). He interpreted the shepherd's guidance as oppressive because he didn't understand the context of a shepherd's care. The story served as a personal and powerful reminder of how easy it is to misread scripture when we lack humility and proper context.\n\n• Parenting and Context: A class member shared the challenge of teaching their children, noting that one daughter could quote scripture but missed the context entirely, highlighting the real-world importance of these interpretive skills. This led to an encouragement for the group to be a resource for one another when facing difficult questions from their children.\n\nPractical Wisdom for Reading:\n\n• Parables: A warning was given against the urge to allegorize every single detail in a parable. Doing so can cause you to 'miss the forest for the trees.' The meaning is found in the main point of the story, not in analyzing why a detail was 'two and not four.'\n\n• Admitting 'I Don't Know': The lesson emphasized the importance of humility. It's better to admit you don't know the answer to a question than to give a wrong one. This was framed in the context of both parenting and personal study.\n\nThe session concluded by affirming that preparing our hearts and minds with these principles is like stretching before a run—it makes us ready to engage with the text of the Gospels properly and to see what they truly reveal about Jesus Christ.",
        tie_in_preview: "This week's lesson didn't begin with a definition or a debate, but with a story — the simple, startling scene of a leper falling at Jesus' feet...",
        tie_in_full: "This week's lesson didn't begin with a definition or a debate, but with a story — the simple, startling scene of a leper falling at Jesus' feet. Ben read aloud from Matthew 8, where Jesus not only heals the man but gives him an unusual command: 'Don't tell anyone, but go show yourself to the priest and offer the gift Moses commanded.' At first it sounded straightforward, yet Ben invited us to pause and ask what it really meant. Was this a command for every believer in every age, or something spoken into one man's specific moment?\n\nThat pause reframed everything. If we took the words prescriptively, then every Christian who recovers from an illness would need to find a priest and bring lambs or birds for sacrifice. Clearly, Jesus was speaking into one man's world under the old covenant, not laying down a law for every believer in every age. The lesson became clear: if we treat every description as a prescription, we pile up burdens never meant for us. But if we treat everything as only description, we risk losing the weight of Christ's true commands. Wisdom comes in knowing the difference, and humility is the only posture that makes us willing to learn.\n\nThe song 'Standing at the Doorway' gives voice to that same humility. It confesses how quickly we rush into Scripture, 'circling what proves us right, shaping ancient voices into what we want to hear.' But it doesn't stay there. It invites us to pause, to stand at the threshold of God's Word with hearts prepared, asking, 'Teach us how to listen, teach us how to read.' The lyrics echo Ben's counsel to step back and look for the primary point before chasing details, reminding us that 'a line's not the page' and that only by zooming out do we 'let the story breathe its truth.' They also reflect his encouragement not to be afraid of admitting 'I don't know' when the meaning isn't clear — because humility is part of true understanding.\n\nWhat the lesson spelled out, the song makes personal. Both are urging us to slow down, to read with context, and to let Scripture draw us not into our own assumptions but into Christ Himself.\n\nReflective Question for the Reader:\n\nWhen you open your Bible, what are you most tempted to rush toward — a quick answer, a personal application, or a proof for what you already think? What would it look like this week to pause at the doorway, read the verse in its larger context, and ask God, 'Show me what this reveals about Jesus'?",
        song_title: "Standing at the Doorway",
        image_url: "images/lesson-2.png",
        audio_file: "audio/lesson-2.mp3",
        suno_link: "https://suno.com/s/qyxWoygzR74r0Aqd"
    }

    
    // ============================================
    // TO ADD A NEW LESSON:
    // 
    // 1. Add a comma after the closing } above
    // 2. Copy this template:
    // 
    // ,
    // {
    //     id: "lesson-2",
    //     title: "Lesson 2: Your Title Here",
    //     scripture: "John X:XX-XX",
    //     summary_preview: "Short preview here...",
    //     summary_full: "Full lesson text here...",
    //     tie_in_preview: "Short song connection here...",
    //     tie_in_full: "Full song explanation here...",
    //     song_title: "Song Title Here",
    //     image_url: "images/lesson-2.png",
    //     audio_file: "audio/lesson-2.mp3",
    //     suno_link: "https://suno.com/song/your-song-id"
    // }
    //
    // 3. Fill in all the fields
    // 4. Save the file
    // ============================================
];
