This is my new portfolio website inspired by cool unix ricing, built with React, TypeScript, Tailwind CSS. Featuring a bento-box layout with keyboard nav, Spotify integration, LeetCode stats, and a custom AI chatbot using Gemini.

![Portfolio Dark Mode](https://github.com/user-attachments/assets/1a07da92-8e11-48ca-ac3d-87fcbf5722c3)
![Portfolio Light Mode](https://github.com/user-attachments/assets/baa7cb1e-0c06-4d42-b7aa-ebda70163d5f)

### Quick Start

1. **Clone or fork this repository**

```bash
git clone https://github.com/yourusername/portfolio-renew.git
cd portfolio-renew
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables** (see [API Setup](#-api-setup) section below)

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser** to `http://localhost:5173`

## Customization Guide

All your personal information is in ONE file: `src/data/info.ts`

### Step 1: Update Your Personal Info

Open `src/data/info.ts` and update the `personalInfo` object:

```typescript
export const personalInfo = {
  // Basic Info
  name: "Your Name",
  username: "yourname", // Used in terminal display (username@computer)
  computerName: "YourComputer", // Used in terminal display
  email: "your.email@example.com",
  title: "Your Title",
  education: "Your School/Program",
  graduationYear: "Month Year",
  location: "Your City, State",

  // Resume filename (must be in /public folder)
  resumeFileName: "your_resume.pdf",

  // Social Links
  socialLinks: {
    github: "https://github.com/yourusername",
    linkedin: "https://www.linkedin.com/in/yourprofile/",
    spotify: "https://open.spotify.com/user/your-spotify-username",
    leetcode: "https://leetcode.com/your-username/",
  },

  // About Me - Each string is a paragraph (HTML allowed)
  aboutMe: [
    "Hello! Welcome to my portfolio.",
    "Tell your story here...",
    'You can use <a href="https://example.com" class="text-blue-300 underline" target="_blank" rel="noopener noreferrer">HTML links</a> too!',
    // Add more paragraphs...
  ],
};
```

### Step 2: Add Your Experiences

In the same file, update `experiencesData`:

```typescript
export const experiencesData = [
  {
    title: "Your Job Title @ Company",
    window: "CompanyName",
    date: "Month Year - Present",
    description: "Describe what you did at this job...",
    image: "/your-company-image.jpg",
    links: [{ name: "Company Website", url: "https://company.com" }],
  },
  // Add more experiences...
];
```

### Step 3: Add Your Projects

```typescript
export const projectsData = [
  {
    title: "Your Project Name",
    window: "ProjectWindow",
    date: "Month Year",
    description: "Describe your project...",
    image: "/your-project-image.jpg",
    links: [
      { name: "GitHub", url: "https://github.com/yourusername/project" },
      { name: "Live Demo", url: "https://yourproject.com" },
    ],
  },
  // Add more projects...
];
```

### Step 4: Add Your Videos (Optional)

```typescript
export const videos = [
  {
    id: "your-youtube-id",
    title: "video title",
    embedUrl: "https://www.youtube.com/embed/your-youtube-id",
  },
  // Add more videos...
];
```

### Step 5: Add Your Images

Place your images in the `public/` folder:

- Company logos/photos for experiences
- Project screenshots
- Your resume PDF (filename must match `resumeFileName` in personalInfo)
- Any other images you want to use

### Step 6: Update LeetCode Username

In `src/data/info.ts`, update the `leetcodeUsername` field:

```typescript
export const personalInfo = {
  // ... other fields

  // Usernames for API integrations
  leetcodeUsername: "your-leetcode-username",
};
```

Then in `api/leetcode.js`, update line 4 to match:

```javascript
const username = "your-leetcode-username";
```

**That's it!** No need to edit `App.tsx` or other components.

## API Setup

This portfolio integrates with several APIs. Here's how to set them up:

### 1. Spotify API (Optional but Recommended)

**Why**: Shows what you're currently listening to and your top tracks

**Steps**:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/callback` (for development)
4. Note your `Client ID` and `Client Secret`
5. Create a `.env` file in your project root:

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REFRESH_TOKEN=your_refresh_token
```

6. Get your refresh token:
   - Run `npm run dev`
   - Visit `http://localhost:5173/api/login`
   - Authorize the app
   - You'll be redirected with a refresh token in the URL
   - Copy the refresh token to your `.env` file

### 2. LeetCode Stats (Optional)

**Why**: Displays your coding stats and submission calendar

**Steps**:

The LeetCode API is public, but you need to update the username in two places:

1. In `src/data/info.ts`:

```typescript
export const personalInfo = {
  // ... other fields
  leetcodeUsername: "your-leetcode-username",
};
```

2. In `api/leetcode.js`:

```javascript
const username = "your-leetcode-username";
```

No API keys needed!

### 3. Google Gemini AI (Optional but Recommended)

**Why**: Powers the AI chatbot that answers questions about you

**Steps**:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to your `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
```

4. Update the system prompt in `api/ask.js` to teach the AI about yourself:

```javascript
const systemPrompt = `You are Daniel's personal AI assistant. Here's what you should know about Daniel:
- Your background
- Your skills
- Your interests
- etc...
`;
```

### Environment Variables Summary

Create a `.env` file in the root directory with:

```env
# Spotify (Optional)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REFRESH_TOKEN=your_refresh_token

# Gemini AI (Optional)
GEMINI_API_KEY=your_gemini_api_key
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and sign in

3. Click "New Project" and import your repository

4. Add your environment variables in the Vercel dashboard:

   - Go to Project Settings → Environment Variables
   - Add all the variables from your `.env` file

5. Deploy! Vercel will automatically build and deploy your site

6. **Important**: After deployment, update your Spotify redirect URI:
   - Go to Spotify Developer Dashboard
   - Add your production URL: `https://yourdomain.com/api/callback`

## Project Structure

```
portfolio-renew/
├── api/                    # API endpoints (Vercel serverless functions)
│   ├── ask.js             # Gemini AI chatbot
│   ├── leetcode.js        # LeetCode stats
│   ├── now-playing.js     # Current Spotify track
│   ├── top-tracks.js      # Top Spotify tracks
│   └── spotify.js         # Spotify auth helpers
├── public/                 # Static assets (images, resume, etc.)
├── src/
│   ├── components/        # React components
│   │   ├── AnimatedEllipsis.tsx
│   │   ├── LeetCodeCalendar.tsx
│   │   ├── Taskbar.tsx
│   │   └── Tooltip.tsx
│   ├── data/
│   │   └── info.ts        # 🎯 YOUR DATA GOES HERE
│   ├── types/
│   │   └── indexs.ts      # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   ├── index.css          # Global styles
│   └── main.tsx           # Application entry point
├── .env                    # Environment variables (create this)
├── package.json
└── vite.config.ts
```

## Troubleshooting

### Spotify not working?

- Make sure your refresh token is valid
- Check that redirect URIs match in Spotify dashboard
- Verify environment variables are set correctly in Vercel

### LeetCode stats not showing?

- Verify your username is correct in `api/leetcode.js`
- Check that your LeetCode profile is public

### AI chatbot not responding?

- Verify your Gemini API key is correct
- Check API rate limits
- Update the system prompt with your information

### Build errors?

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Customization Tips

1. **Change Colors**: Edit Tailwind classes in components
2. **Add More Windows**: Create new sections in `App.tsx`
3. **Modify Layout**: Adjust grid layout in the main div
4. **Add Animations**: Use Tailwind's animation utilities
5. **Change Fonts**: Update `index.css` with your preferred fonts

## License

This project is open source and available under the MIT License. Feel free to use it as a template for your own portfolio!

## Credits

Created by [Daniel Nguyen](https://github.com/deeedaniel). Inspired by Linux terminal aesthetics and modern web design.

## Support

If you have questions or need help feel free to send me a DM on [LinkedIn](https://www.linkedin.com/in/daniel-nguyenn/)!

---

**⭐ If you use this template, consider giving it a star on GitHub!**
