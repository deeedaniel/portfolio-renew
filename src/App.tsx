import { useState } from "react";
import { useEffect } from "react";

interface NowPlayingItem {
  album: string;
  album_image: string;
  artists: string[];
  name: string;
}

interface NowPlayingData {
  is_playing: boolean;
  item: NowPlayingItem | null;
}

interface TopTracksData {
  tracks: Track[];
}

interface Track {
  id: string;
  name: string;
  artists: string[];
  album: string;
  album_image: string;
  spotify_url: string;
  preview_url: string;
}

const App = () => {
  const [time, setTime] = useState(new Date());

  // const [count, setCount] = useState(0);
  const [selectedAscii, setSelectedAscii] = useState(String);
  const [expandWindow, setExpandWindow] = useState(String);
  const [selectedWindow, setSelectedWindow] = useState("me");

  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [topTracks, setTopTracks] = useState<TopTracksData | null>(null);

  // const [currentIndex, setCurrentIndex] = useState(0);

  const [experienceIndex, setExperienceIndex] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const [selectProject, setSelectProject] = useState("");
  const [selectExperience, setSelectExperience] = useState("");

  const experiencesData = [
    {
      title: "Full-Stack Intern @ TwinMind",
      window: "TwinMind",
      description:
        "Fully developed TwinMind Web-App utilizing Next.js, TailwindCSS.",
      image: "/twinmind_team.jpeg",
      links: [{ name: "Website", url: "#" }],
    },
    {
      title: "Web Dev Intern @ cooledtured",
      window: "cooledtured",
      description: ".",
      image: "/coding.png",
      links: [{ name: "Website", url: "#" }],
    },
    {
      title: "SWE Intern @ SCE",
      description: ".",
      image: "/coding.png",
      links: [{ name: "Website", url: "#" }],
    },
  ];

  const projectsData = [
    {
      title: "StudyBuddy | 1st @ SCE Hacks 1.0, SJSU",
      window: "StudyBuddy",
      description:
        "A web-app designed for students to receive friendly daily SMS reminders about their events and assignments. Created with React, Node.js, Express, OpenAI API, Canvas API, Google OAuth, Node-cron. Won first place overall at SCE Hacks 1.0 w/ Mintlify.",
      image: "/studybuddy.jpeg",
      links: [
        { name: "GitHub", url: "#" },
        { name: "Devpost", url: "#" },
        // { name: "Live Demo", url: "#" },
      ],
    },
    {
      title: "Chillguy.ai | 2nd @ Hack for Humanity, SCU",
      window: "Chillguy.ai",
      description:
        "An AI-powered mental wellness chatbot that provides a safe space for users to express their feelings and receive support. It uses sentiment analysis to offer appropriate responses and resources. Awarded second place for its social impact.",
      image: "/chillguy.jpeg",
      links: [{ name: "GitHub", url: "#" }],
    },
    {
      title: "VIVI | HackDavis",
      window: "VIVI",
      description:
        "A virtual companion application for the elderly, aimed at reducing loneliness and improving mental well-being. Features include voice-activated commands, daily check-ins, and connection to family members.",
      image: "/coding.png",
      links: [{ name: "Devpost", url: "#" }],
    },
    {
      title: "OfficeTracker | CS151",
      window: "OfficeTracker",
      description:
        "A desktop application for managing office resources and appointments, developed as a project for a software engineering course. It follows the MVC design pattern and was built using Java, JavaFX, CSV.",
      image: "/officetracker.jpg",
      links: [{ name: "GitHub", url: "#" }],
    },
  ];

  // pick random ascii art
  useEffect(() => {
    // if (count % 10 == 0) {
    setSelectedAscii(asciiList[Math.floor(Math.random() * asciiList.length)]);
    //}
  }, []);

  useEffect(() => {
    fetchNowPlaying().then((data) => setNowPlaying(data));
  }, []);

  // update time every second
  useEffect(() => {
    setInterval(() => {
      setTime(new Date());
    }, 1000);
  }, []);

  // update time every second (with cleanup)
  // useEffect(() => {
  //   const id = setInterval(() => setTime(new Date()), 1000);
  //   return () => clearInterval(id);
  // }, []);

  // // increment count every second using functional update (with cleanup)
  // useEffect(() => {
  //   const id = setInterval(() => setCount((c) => c + 1), 1000);
  //   return () => clearInterval(id);
  // }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedWindow === "experience") {
        if (e.key === "ArrowUp") {
          setExperienceIndex((prev) =>
            prev === 0 ? experiencesData.length - 1 : prev - 1
          );
        } else if (e.key === "ArrowDown") {
          setExperienceIndex((prev) => (prev + 1) % experiencesData.length);
        } else if (e.key === "Enter") {
          setSelectExperience(experiencesData[experienceIndex].title);
          console.log("hello");
          setExpandWindow("experience");
        }
      } else if (selectedWindow === "projects") {
        if (e.key === "ArrowUp") {
          setProjectIndex((prev) =>
            prev === 0 ? projectsData.length - 1 : prev - 1
          );
        } else if (e.key === "ArrowDown") {
          setProjectIndex((prev) => (prev + 1) % projectsData.length);
        } else if (e.key === "Enter") {
          setSelectProject(projectsData[projectIndex].title);
          setExpandWindow("projects");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedWindow, experienceIndex, projectIndex]);

  // useEffect(() => {
  //   (0);
  // }, [selectedWindow]);

  const asciiList = [
    `⣶⣶⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤
⠛⠛⠁⠀⠀⠀⣠⠔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠐⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠿
⠀⠀⠀⠀⠀⠀⢀⡤⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀
⠢⣄⣀⡠⠄⠒⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡠⠤⠀⠀⣠⠔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠒⢄⡀⠀⠀
⣀⣙⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⢚⡁⠤⡤⠒⠉⠁⠀⠀⠠⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠦⣀
⠋⠉⠃⠀⠉⠐⢲⠤⠀⠀⠀⠀⠀⡠⠊⢁⡜⠋⠁⠀⠀⢇⠀⠀⢶⡤⣀⣀⠈⠉⢁⣐⣠⠤⠐⠀⠀⠑⠦⡀⠀⠀⠀⠀⠀⠀⠀⢀⣀⡬
⠀⠀⡆⠀⢀⡜⣁⣀⠄⠀⠀⢠⠞⠁⢀⠞⠀⡀⠀⠀⠀⠀⡑⠤⣀⠙⠢⣀⠀⠉⠀⠀⠀⠀⠀⠀⢄⠀⠀⠈⢂⠀⠀⠀⠀⠈⠙⢧⠘⠇
⠀⠀⡇⠐⠛⠛⡴⠁⠀⠀⢠⠃⠀⢠⠊⢠⠊⠀⡰⠀⢠⠎⠀⠀⠀⢀⠉⠈⠉⠁⠐⢆⠀⠘⢆⠀⠀⠱⡄⠀⠀⢣⠀⠀⠀⠐⣶⠤⣷⡄
⣤⣤⡇⠀⣠⠞⠀⠀⠀⢀⡇⠀⢠⠇⢠⠃⠀⣴⠁⣰⡏⢀⡆⠀⠀⣾⠀⢰⣄⠀⠀⠈⢷⣄⠀⢣⠀⠀⠸⣦⡀⠈⡆⠀⠀⠀⠘⢆⢸⣷
⣿⣿⣯⣉⡁⠀⠀⠀⡀⣸⠀⢰⡟⠀⡎⢀⣾⡏⠐⣿⠀⠺⡇⠀⢰⣿⣆⠘⣿⠑⣄⠀⠸⣿⣷⡀⢷⡀⠀⢻⣷⡀⢳⡐⣦⣀⠀⠈⠻⣿
⣿⣿⣇⣠⣉⣉⣹⠏⣱⣿⢀⣿⠇⢸⡇⠈⣾⣇⢰⣹⡀⢸⣧⠀⢸⢀⣿⣆⣻⣾⡭⢷⡀⡿⠹⡇⢸⣷⡀⢸⡈⣧⣸⣷⠘⣷⣿⣷⣦⣾
⣿⡿⡏⠀⠀⠀⣽⣴⢿⠉⣦⣇⣼⠉⣿⣶⣿⣿⣿⣿⣧⣼⣌⢧⡀⠘⣷⡟⠳⣼⣶⣾⣿⣷⣾⣇⢸⣹⣥⣼⣉⢻⡏⢹⣄⢹⠉⠉⢹⣿
⣏⣀⡟⠀⠀⠀⠛⠁⡌⠀⢹⣡⢬⣦⣟⢿⠋⠁⠀⠠⣬⣟⠻⡄⠑⣄⠸⣤⢐⣿⠿⢭⣌⠁⠉⢻⡿⢻⣿⢯⠸⢻⠅⢸⣿⡾⠀⠀⢈⣿
⣿⣿⣷⠀⠀⠀⢀⡼⢁⣀⣼⠛⢸⠻⣿⠀⠀⢀⢰⣶⣿⣿⠀⠁⠀⠀⠙⠻⠋⢰⣦⣾⣿⡇⠀⠈⠁⣾⠏⡸⠀⣼⠀⢸⠈⠀⠀⠀⠘⠿
⢿⣏⣿⠘⣶⡶⠿⠻⠿⠶⠟⢦⣌⠓⢬⣇⠀⠈⠛⠿⠿⠛⠀⠀⢠⡀⠀⠀⠀⠐⠿⠿⠿⠖⠁⠀⢰⠓⠋⣤⣾⢿⣿⣿⡧⠤⠤⠤⠀⠀
⣿⣿⡟⢿⣽⣿⣦⡸⣷⣼⣿⡏⣻⣷⣤⣼⡶⠋⢳⠀⠀⠀⠀⠀⢿⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⢶⣾⠉⠙⢾⠿⣿⣇⠀⠀⠀⠀⠀
⡿⣾⣿⣟⢙⣿⣿⣥⣬⣼⣿⣿⣿⣿⣿⣃⣷⡀⠈⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠖⠳⣀⡼⣿⣿⣿⣉⣿⣿⣀⡀⠈⠀⠀⠦⢀⣀
⢷⣤⣿⢿⢹⣿⣿⣿⣿⣽⣿⣿⣠⣿⣯⠟⣿⢿⣷⣾⡀⠀⠀⠀⠀⡒⠀⠀⠀⠀⠀⣘⣴⣾⣿⣾⠷⢿⣬⣿⣿⡉⢙⣷⡖⡀⠀⠂⠈⠛
⣿⣿⣿⡿⣿⣿⣿⣿⣿⡿⢶⣿⡿⠛⠻⠛⠁⢸⣾⣿⣿⣷⣦⣄⡀⠀⠀⠀⣠⠴⠋⠹⣿⣧⣿⣿⣠⠈⠳⣄⣽⣿⣿⠛⢛⡓⢤⠁⠀⠛
⣿⣿⣷⣤⣼⣿⣿⣿⣿⡷⠾⠿⡇⠀⠀⠀⠀⠘⡌⢿⣿⡏⠈⠁⠉⠓⠒⠋⠀⠀⠀⢀⣼⣿⣿⣿⠏⠀⠀⠈⠀⠀⠈⢻⡋⢳⡀⠀⠀⠐
⣿⣿⣿⣿⢿⣿⣿⠋⠁⠀⠀⠀⢳⡀⠀⠀⠀⠀⢱⡈⢻⣿⡀⠀⠀⠀⠀⠀⠀⢀⣴⢿⣵⠟⢁⡎⠀⠀⠀⠀⠀⠀⢀⡰⠟⠶⣧⣄⠈⠉
⠉⣵⣶⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⠱⣄⠀⠀⠀⠀⠱⣄⡙⢿⣶⢦⡀⠀⢀⣤⣿⣷⣟⣡⠴⠋⠀⠀⠀⠀⢀⣠⠖⠉⠀⠀⠀⠈⠻⣧⣀
⣿⣿⣿⠟⠁⠀⠀⠀⣿⡀⢀⠀⠀⢀⡨⠷⣦⣀⣀⠀⠀⠉⠛⠻⡦⠭⠷⠏⡼⠛⠋⠁⠀⠀⠀⠀⠀⢀⡴⠋⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿
⣩⡿⠋⠀⠀⠀⠀⠀⣹⠷⠼⡖⠚⠁⠀⠀⠀⠀⠀⠙⠲⢤⣶⣤⡘⡆⠀⡜⢁⣀⡄⠀⠀⢀⣀⣠⠖⠋⠀⠀⠀⠀⠀⢸⡇⠀⠀⠀⠈⣿
⠀⠀⠀⠀⠀⣀⣠⠾⠃⠀⠀⠈⠲⢴⡶⠟⠛⢻⡿⠶⠦⣴⡛⠀⠙⣻⣶⠗⠛⣻⡟⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⢹`,
    `
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⠀⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠗⠀⠀⣀⣄⠀⢿⣿⣿⣿⠟⠁⢠⡆⠉⠙⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⣴⣿⡟⠀⠘⣿⣿⠋⠀⠀⠀⢠⣶⡀⠈⢻⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⢠⣿⠛⣶⠀⠀⣿⡟⠀⠀⠀⢠⣿⣿⡇⠀⠠⣽⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠅⠀⠀⣿⠏⠀⣿⠀⠀⣿⠁⠀⠀⢠⣿⠟⢻⡇⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⣼⣿⠀⢰⡟⠀⠀⠛⠀⠀⠀⣾⡇⠀⢸⡇⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠿⠃⠀⠈⠀⢀⠀⣀⣀⠀⠘⠟⠀⠀⡾⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠃⠀⠀⠀⢀⠂⠀⠈⠉⢴⣽⣿⠵⣿⡶⣂⣄⡀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⡟⠡⠆⢀⠀⠀⠀⠀⠄⠀⠈⠘⠏⢿⣶⣿⡿⢟⣱⣖⠒⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡟⣻⠏⣠⠄⠀⢀⡀⠀⠀⠀⠀⠈⠀⠀⠀⢸⣿⢦⠄⠙⣿⡇⠩⣭⣅⠈⢿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣟⣼⡇⠈⢀⣴⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠁⠀⢀⠀⠈⠰⣶⡤⠿⠃⢸⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⡟⠉⢠⡶⠋⠀⠀⠀⠀⠀⠀⠀⢀⣤⣤⣴⣶⣤⣄⡀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿
⣿⣿⣿⡏⢀⡠⠀⠀⠀⠀⠀⠀⠀⢀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣦⣄⠀⠀⠂⠀⠈⣿⣿⣿⣿
⣿⣿⣿⢃⠈⠀⢠⠀⠀⠀⠀⠀⢠⣿⣿⣿⠿⣩⣏⡙⣛⣛⣿⣿⣿⣿⣿⣿⣿⡿⢇⠀⠀⠄⠀⠘⣿⣿⣿
⣿⣿⣿⡎⠀⠀⠀⠀⠀⠀⠀⠠⣿⣿⣿⡟⣰⣿⠁⢀⠈⢿⣿⣿⣿⣿⢁⣴⠖⢲⣾⡇⠀⠀⠄⠀⣿⣿⣿
⣿⣿⣿⢀⠀⠀⠀⠀⠀⠀⠀⠀⣏⢿⣿⡇⣿⡇⠀⠀⠀⣼⣿⣿⣿⡇⣼⡏⠀⠀⣿⡇⠀⠀⠀⠀⣻⣿⣿
⣿⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⢸⣄⠻⣷⡘⣷⣀⣀⣴⣿⡟⠉⠛⠓⣿⡇⠀⢰⣿⡇⠀⠀⠀⣼⣿⣿⣿
⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀⠀⠙⢷⣌⠻⢿⣿⣿⣿⣿⣿⣦⣶⣿⣾⣧⣤⡾⠏⠀⠀⠀⠀⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⠶⢌⣉⣛⠛⠿⠿⠿⠿⠿⠛⠉⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣶⣄⠀⠀⠀⠀⠲⠀⠀⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⠈⠁⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠛⠻⠿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡏⠛⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡘⡻⣿⣿
⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⢨⡛⡛⣁⣿
⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠂⠀⠀⠀⠀⠀⠀⠀⠀⣠⣿⣿⣿
⣿⣿⣿⣿⠇⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⣠⣴⣾⣿⣿⣿⣿

`,
  ];

  // Spotify functions
  async function fetchNowPlaying() {
    const res = await fetch("/api/now-playing"); // on Vercel this resolves to your function
    if (!res.ok) {
      console.error(await res.text());
      return null;
    }
    return await res.json();
  }

  setInterval(async () => {
    const now = await fetchNowPlaying();
    setNowPlaying(now);
  }, 360000); // every 6 minutes

  useEffect(() => {
    async function fetchTopTracks() {
      const res = await fetch("/api/top-tracks"); // on Vercel this resolves to your function
      if (!res.ok) {
        console.error(await res.text());
        return null;
      }
      return await res.json();
    }

    // Wrap the async call in a function and invoke it
    (async () => {
      const top = await fetchTopTracks();
      setTopTracks(top);
    })();
  }, []);

  return (
    <div className="w-screen flex items-center justify-center bg-gray-800 text-white">
      {/* Bento box grid */}
      <div className="relative grid grid-cols-2 grid-rows-3 w-full mx-1 gap-2 bg-gray-900 rounded-2xl p-1.5 border border-gray-700">
        {/* Expanded overlay when user clicks */}
        {expandWindow && (
          <div className="absolute inset-0 z-20 transition-opacity duration-300">
            {expandWindow === "me" && (
              <div className="w-full h-full bg-black border border-gray-700 rounded-xl">
                <p className="text-black bg-gray-300 rounded-t-xl text-sm text-center relative">
                  me - zsh
                  <button className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
                  <button
                    className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("me")}
                  />
                </p>
                <div className="my-auto flex">
                  <p className="text-[4px] text-blue-100 font-mono whitespace-pre min-w-1/2 text-center">
                    {selectedAscii}
                  </p>
                  <div className="mx-auto  min-w-1/2 mt-2">
                    <p className="text-blue-300 text-sm">daniel@MacbookPro</p>
                    {/* <p className="ml-4">daniel's website</p> */}
                    <p className=" ml-4 text-xs">Full Stack</p>
                    <p className=" ml-4 text-xs">CS @ SJSU</p>
                    <p className=" ml-4 text-xs">{time.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            )}
            {expandWindow === "experience" && (
              <>
                {selectExperience !== "" ? (
                  <div className="w-full h-full bg-black border border-gray-700 rounded-xl">
                    <p
                      className={`text-black rounded-t-xl text-sm text-center relative ${
                        selectedWindow === "experience"
                          ? "bg-white"
                          : "bg-gray-400"
                      }`}
                    >
                      {selectExperience}
                      <p className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
                      <p
                        className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                        onClick={() => {
                          setExpandWindow("");
                          setSelectExperience("");
                        }}
                      />
                      <p className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2" />
                    </p>
                    <div className="m-4">
                      {(() => {
                        const selectedExperienceData = experiencesData.find(
                          (p) => p.title === selectExperience
                        );
                        if (selectedExperienceData) {
                          return (
                            <div>
                              <img
                                src={selectedExperienceData.image}
                                alt={selectedExperienceData.title}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                              />
                              <p className="text-gray-400 mt-2">
                                {selectedExperienceData.description}
                              </p>
                              <div className="mt-4">
                                {selectedExperienceData.links.map((link) => (
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={link.name}
                                    className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
                                  >
                                    {link.name}
                                  </a>
                                ))}
                              </div>
                              <button
                                className="mt-4 px-2 py-1 bg-gray-700 rounded"
                                onClick={() => setSelectExperience("")}
                              >
                                Back to experiences
                              </button>
                            </div>
                          );
                        }
                        return <p>Experience not found.</p>;
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-black border border-gray-700 rounded-xl">
                    <p
                      className={`text-black rounded-t-xl text-sm text-center relative ${
                        selectedWindow === "experience"
                          ? "bg-white"
                          : "bg-gray-400"
                      }`}
                    >
                      experience - zsh
                      <p className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
                      <p
                        className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                        onClick={() => setExpandWindow("")}
                      />
                      <p className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2" />
                    </p>
                    <div className="mt-2 mx-4">
                      {experiencesData.map((experience, index) => (
                        <div
                          key={index}
                          className={` rounded-md transition-all duration-150 cursor-pointer ${
                            index === experienceIndex
                              ? " text-white"
                              : "bg-transparent text-blue-300 hover:bg-gray-800"
                          }`}
                          onClick={() => setSelectExperience(experience.title)}
                        >
                          {experience.title}{" "}
                          {index == experienceIndex ? " <" : ""}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {expandWindow === "projects" && (
              <>
                {selectProject !== "" ? (
                  <div className="w-full h-full bg-black border border-gray-700 rounded-xl">
                    <p
                      className={`text-black rounded-t-xl text-sm text-center relative ${
                        selectedWindow === "projects"
                          ? "bg-white"
                          : "bg-gray-400"
                      }`}
                    >
                      {
                        projectsData.find((p) => p.title === selectProject)
                          ?.window
                      }
                      <p className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
                      <p
                        className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                        onClick={() => {
                          setExpandWindow("");
                          setSelectProject("");
                        }}
                      />
                      <p className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2" />
                    </p>
                    <div className="m-4">
                      {(() => {
                        const selectedProjectData = projectsData.find(
                          (p) => p.title === selectProject
                        );
                        if (selectedProjectData) {
                          return (
                            <div>
                              <img
                                src={selectedProjectData.image}
                                alt={selectedProjectData.title}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                              />
                              <p className="text-gray-400 mt-2">
                                {selectedProjectData.description}
                              </p>
                              <div className="mt-4">
                                {selectedProjectData.links.map((link) => (
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={link.name}
                                    className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
                                  >
                                    {link.name}
                                  </a>
                                ))}
                              </div>
                              <button
                                className="mt-4 px-2 py-1 bg-gray-700 rounded"
                                onClick={() => setSelectProject("")}
                              >
                                Back to projects
                              </button>
                            </div>
                          );
                        }
                        return <p>Project not found.</p>;
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-black border border-gray-700 rounded-xl">
                    <p
                      className={`text-black rounded-t-xl text-sm text-center relative ${
                        selectedWindow === "projects"
                          ? "bg-white"
                          : "bg-gray-400"
                      }`}
                    >
                      projects - zsh
                      <p className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
                      <p
                        className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                        onClick={() => setExpandWindow("")}
                      />
                      <p
                        className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setExpandWindow("projects")}
                      />
                    </p>
                    <div className="mt-2 mx-4">
                      {projectsData.map((project, index) => (
                        <div
                          key={index}
                          className={` rounded-md transition-all duration-150 cursor-pointer ${
                            index === projectIndex
                              ? " text-white"
                              : "bg-transparent text-blue-300 hover:bg-gray-800"
                          }`}
                          onClick={() => setSelectProject(project.title)}
                        >
                          {project.title}
                          {index === projectIndex ? " <" : ""}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {/* Main terminal window */}
        <div
          className={` bg-black rounded-xl col-span-2 flex border border-gray-700 flex-col ${
            expandWindow ? "opacity-0" : ""
          } transition-opacity duration-500`}
          onClick={() => {
            setSelectedWindow("me");
            console.log(selectedWindow);
          }}
        >
          <p
            className={`text-black  rounded-t-xl text-sm text-center relative ${
              selectedWindow === "me" ? "bg-white" : "bg-gray-400"
            }`}
          >
            me - zsh
            <button className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
            <button
              className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
              onClick={() => setExpandWindow("")}
            />
            <button
              className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setExpandWindow("me")}
            />
          </p>
          <div className="my-auto flex">
            <p className="text-[4px] text-blue-100 font-mono whitespace-pre min-w-1/2 text-center">
              {selectedAscii}
            </p>
            <div className="mx-auto  min-w-1/2 mt-2">
              <p className="text-blue-300 text-sm">daniel@MacbookPro</p>
              {/* <p className="ml-4">daniel's website</p> */}
              <p className=" ml-4 text-xs">Full-Stack</p>
              <p className=" ml-4 text-xs">CS @ SJSU</p>
              <p className=" ml-4 text-xs">San Jose, CA</p>
              <p className=" ml-4 text-xs">{time.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div
          className={` bg-black col-span-2 border border-gray-700 rounded-xl ${
            expandWindow ? "opacity-0" : ""
          } transition-opacity duration-500`}
          onClick={() => {
            setSelectedWindow("experience");
            console.log(selectedWindow);
          }}
        >
          <p
            className={`text-black rounded-t-xl text-sm text-center relative ${
              selectedWindow === "experience" ? "bg-white" : "bg-gray-400"
            }`}
          >
            experience - zsh
            <p className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
            <p className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2" />
            <p
              className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setExpandWindow("experience")}
            />
          </p>
          <div className="mt-2 mx-4">
            {experiencesData.map((experience, index) => (
              <div
                key={index}
                className={` rounded-md transition-all duration-150 cursor-pointer ${
                  index === experienceIndex
                    ? " text-white"
                    : "bg-transparent text-blue-300 hover:bg-gray-800"
                }`}
                onClick={() => {
                  setExpandWindow("experience");
                  setSelectExperience(experience.title);
                }}
              >
                {experience.title} {index == experienceIndex ? " <" : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div
          className={` bg-black col-span-2 border border-gray-700 rounded-xl ${
            expandWindow ? "opacity-0" : ""
          } transition-opacity duration-500`}
          onClick={() => {
            setSelectedWindow("projects");
            console.log(selectedWindow);
          }}
        >
          <p
            className={`text-black rounded-t-xl text-sm text-center relative ${
              selectedWindow === "projects" ? "bg-white" : "bg-gray-400"
            }`}
          >
            projects - zsh
            <p className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
            <p className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2" />
            <p
              className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setExpandWindow("projects")}
            />
          </p>
          <div className="mt-2 mx-4">
            {projectsData.map((project, index) => (
              <div
                key={index}
                className={` rounded-md transition-all duration-150 cursor-pointer ${
                  index === projectIndex
                    ? " text-white"
                    : "bg-transparent text-blue-300 hover:bg-gray-800"
                }`}
                onClick={() => {
                  setExpandWindow("projects");
                  setProjectIndex(index);
                  setSelectProject(project.title);
                }}
              >
                {project.title}
                {index === projectIndex ? " <" : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Music */}
        <div
          className={` bg-black col-span-2 border border-gray-700 rounded-xl ${
            expandWindow ? "opacity-0" : ""
          } transition-opacity duration-500`}
          onClick={() => {
            setSelectedWindow("music");
            console.log(selectedWindow);
          }}
        >
          <p
            className={`text-black rounded-t-xl text-sm text-center relative ${
              selectedWindow === "music" ? "bg-white" : "bg-gray-400"
            }`}
          >
            music - zsh
            <p className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
            <p className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2" />
            <p
              className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setExpandWindow("music")}
            />
          </p>
          <div className="mt-2 mx-4">
            {nowPlaying && nowPlaying.item ? (
              <div className="flex items-center">
                <img
                  src={nowPlaying.item.album_image}
                  alt={nowPlaying.item.album}
                  className="w-16 h-16 rounded-md mr-4"
                />
                <div>
                  <p className="font-bold">{nowPlaying.item.name}</p>
                  <p className="text-sm text-gray-400">
                    {nowPlaying.item.artists.join(", ")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {nowPlaying.item.album}
                  </p>
                </div>
              </div>
            ) : (
              <p>I'm not currently listening to anymore!</p>
            )}
            {topTracks && topTracks.tracks ? (
              <div className="flex items-center">
                {topTracks.tracks.map((track) => (
                  <div key={track.id}>{track.name}</div>
                ))}
              </div>
            ) : (
              <p>I'm not currently listening to anymore!</p>
            )}
          </div>
        </div>

        {/* CLI LLM about me */}
      </div>

      {/* App menu */}
      {/* <div className="absolute flex justify-center items-center gap-2 bottom-0 left-2 right-2 bg-white p-2 rounded-t-xl">
        <a href="https://github.com/deeedaniel">
          <img src="github-sign.png" alt="GitHub" className="w-6 h-6" />
        </a>
        <a href="https://www.linkedin.com/in/daniel-nguyenn/">
          <img src="linkedin.png" alt="LinkedIn" className="w-6 h-6" />
        </a>
      </div> */}
    </div>
  );
};

export default App;
