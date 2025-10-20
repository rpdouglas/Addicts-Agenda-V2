The Addict's Agenda
​🌟 Overview
​The Addict's Agenda is a self-contained, personal recovery companion designed to be accessible, private, and fast. Built using React and deployed via GitHub Pages, this application helps individuals track their sobriety, practice coping skills, work through recovery exercises, and maintain a daily journal.
​Crucially, this application is designed for maximum privacy: all user data is stored exclusively in your browser's Local Storage on the device you are currently using, not on any server or cloud database.
​✨ Features
​Sobriety Tracker: A real-time counter displaying days, hours, minutes, and seconds of continuous sobriety.
​Daily Journal: A private space for reflection.
​Includes an AI Helper powered by the Gemini API to generate writing prompts or reflective starting paragraphs.
​Supports editing and deleting entries.
​Coping Cards: A set of actionable strategies for managing cravings and emotional distress.
​Allows seamless transition to the Journal with a pre-populated reflection template.
​Recovery Workbook: Structured exercises for deep recovery work.
​Includes modules for General Recovery Exercises and the 12 Steps.
​Features a visual completion tracker to monitor progress.
​Recovery Literature: Direct access to key texts (AA's Big Book and NA's Basic Text), including in-app reading and links to download official PDFs.
​S.O.S. Resources: Quick access to essential national helplines for crises and treatment information.
​💾 Data Persistence and Privacy
​The application uses Local Storage, meaning:
​Privacy: Your sobriety date, journal entries, goals, and workbook progress are never transmitted to a server. They remain stored only in your web browser's data.
​Portability: Data will not sync across different devices or browsers.
​Persistence: Data remains available as long as you use the same browser on the same device and do not manually clear your browser's local storage/site data.
​🛠️ Technology Stack
​Frontend: React (via CDN/Babel for single-file deployment)
​Styling: Tailwind CSS (via CDN)
​Data Storage: Browser Local Storage
​AI Integration: Gemini API (used only for journal idea generation)
​🚀 Deployment (GitHub Pages)
​This application is designed to be hosted directly on GitHub Pages using a simple index.html file that includes React via CDN, eliminating the need for a complex Node.js build environment (like Vite or Create React App) for deployment.
​Repository Structure: The entire application resides within a single index.html file in the root of the repository.
​Hosting: To deploy:
​Go to Settings in your GitHub repository.
​Navigate to Pages.
​Set the Source to the main branch (or master) and select the root directory (/).
​The app will deploy to a URL like https://<YourUsername>.github.io/<YourRepoName>/.
