// --- RECOVERY INSIGHTS/FACTS DATA ---
export const RECOVERY_FACTS = [
    "The Serenity Prayer was popularized by AA, but was originally written by theologian Reinhold Niebuhr.",
    "AA's Big Book was first published in 1939 and its core text (first 164 pages) remains unchanged.",
    "The 12 Traditions were developed to guide AA groups in their relationships with the world, not just to guide the individual.",
    "The motto 'Just for Today' is commonly used across many 12-Step fellowships to emphasize living in the present moment.",
    "The first Narcotics Anonymous meeting was held in Southern California in 1953.",
    "The concept of 'Higher Power' is intentionally non-religious and can be defined as 'God as we understood Him'.",
    "The opposite of addiction is often cited as connection, emphasizing the importance of fellowship.",
    "The 'HALT' acronym (Hungry, Angry, Lonely, Tired) is a fundamental tool for recognizing relapse triggers.",
    "The Step 4 inventory is 'searching and fearless' because admitting the 'exact nature' of wrongs releases their power.",
    "CA (Cocaine Anonymous) uses the same 12 Steps and 12 Traditions as AA.",
];

// --- Literature Data (Truncated for brevity) ---
export const literatureData = {
    aa_big_book: {
        title: "The Big Book (Alcoholics Anonymous)",
        pdfLink: "https://www.aa.org/sites/default/files/2021-11/en_bigbook_personalstories_1st.pdf",
        chapters: [
            { title: "The Doctor's Opinion", content: `WE of Alcoholics Anonymous believe that the reader will be interested in the medical estimate of the plan of recovery described in this book. Convinced medical men...` },
            { title: "Chapter 1: Bill's Story", content: `WAR FEVER ran high in the New England town to which we new, young officers from Plattsburg were assigned, and we were flattered...` },
            { title: "Chapter 5: How It Works", content: `RARELY HAVE we seen a person fail who has thoroughly followed our path. Those who do not recover are people who cannot or will not completely give themselves to this simple program...` },
        ]
    },
    na_basic_text: {
        title: "The Basic Text (Narcotics Anonymous)",
        pdfLink: "https://www.na.org/admin/include/spaw2/uploads/pdf/litfiles/us_english/Book/Sixth%20Edition%20Basic%20Text.pdf",
        chapters: [
            { title: "Who is an Addict?", content: `Most of us do not have to think twice about this question. We know! Our whole life and thinking was centered in drugs in one form or another...` },
            { title: "What is the Narcotics Anonymous Program?", content: `N.A. is a nonprofit fellowship or society of men and women for whom drugs had become a major problem. We are recovering addicts who meet regularly to help each other stay clean...` },
        ]
    }
};

// --- Journal Templates Data ---
export const journalTemplates = [
    { id: '', name: 'Select a Template...' },
    { id: 'gratitude', name: '3-Part Gratitude Check', template: 'Today I am grateful for:\n1. (Person/Relationship)\n2. (Experience/Event)\n3. (Small Detail)\n\nHow did this feeling of gratitude influence my day?' },
    { id: 'halt', name: 'The H.A.L.T. Check', template: 'Before reacting or craving, I will check:\n\n**H**ungry? (Yes/No): \n**A**ngry? (Yes/No): \n**L**onely? (Yes/No): \n**T**ired? (Yes/No): \n\nWhat action did I take to meet my true need?' },
    { id: 'resentment', name: 'Resentment Filter', template: 'Today I felt resentful toward: (Person/Situation)\n\nWhat did they do? \n\nWhat part of my self-esteem (pride, security, ambition) did this threaten? \n\nWhat is my part in this situation?' },
    { id: 'step_10', name: 'Step 10 Spot Check', template: 'Where was I wrong today? (Small admissions of fault or mistake)\n\nWas I mindful of others?\n\nDid I practice honesty in a difficult situation?\n\nIf I was wrong, did I promptly admit it?' },
];

// --- Coping Cards Data ---
export const copingStrategies = [
    { title: "Deep Breathing", description: "Inhale for 4s, hold for 7s, exhale for 8s. Repeat 3-5 times.", category: "Grounding", color: "from-blue-100 to-indigo-200", icon: "MapPinIcon" },
    { title: "5-4-3-2-1 Method", description: "Name: 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.", category: "Grounding", color: "from-blue-100 to-indigo-200", icon: "MapPinIcon" },
    { title: "Go for a Walk", description: "A 10-15 minute walk can change your scenery and mindset.", category: "Action", color: "from-green-100 to-emerald-200", icon: "PhoneIcon" },
    { title: "Play the Tape Through", description: "Think about the full consequences of giving in to a craving.", category: "Cognitive", color: "from-pink-100 to-red-200", icon: "ShieldIcon" },
    { title: "Call a Friend", description: "Talk about what you're feeling with your support network.", category: "Connection", color: "from-green-100 to-emerald-200", icon: "PhoneIcon" },
    { title: "Delay and Distract", description: "Wait 15 minutes. Do something to distract yourself in that time.", category: "Cognitive", color: "from-pink-100 to-red-200", icon: "ShieldIcon" },
];

export const MEETING_LINKS = {
    AA: {
        name: "Alcoholics Anonymous (AA)",
        description: "Find local, in-person, or online AA meetings.",
        link: "https://www.aa.org/find-meetings",
        instructions: "The official AA website provides local directories and search tools."
    },
    NA: {
        name: "Narcotics Anonymous (NA)",
        description: "Find local and online NA meetings.",
        link: "https://www.na.org/meetingsearch/",
        instructions: "Use the NA Meeting Locator to find times and locations in your area."
    },
    CA: {
        name: "Cocaine Anonymous (CA)",
        description: "Find CA meetings globally.",
        link: "https://www.ca.org/meetings/",
        instructions: "The CA website offers a global directory and online meeting resources."
    }
};

export const APP_VERSIONS = {
    DASHBOARD: '1.3.1',
    JOURNAL: '1.4.0', 
    GOALS: '1.1.1', 
    COPING: '2.1.0', 
    WORKBOOK: '1.4.1',
    LITERATURE: '1.1.0',
    RESOURCES: '1.0.0',
    SETTINGS: '1.0.1',
    MEETINGFINDER: '1.0.0',
};
