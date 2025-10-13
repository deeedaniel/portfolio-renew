import React, { useState, useEffect, useRef } from "react";
import type {
  NowPlayingData,
  TopTracksData,
  LeetCodeData,
} from "./types/indexs";
import { experiencesData, projectsData, asciiList } from "./data/info";
import { Taskbar } from "./components/Taskbar";
import { HeadphoneOff } from "lucide-react";
import { Play, Pause, RotateCcw } from "lucide-react";
import LeetCodeCalendar from "./components/LeetCodeCalendar";
import AnimatedEllipsis from "./components/AnimatedEllipsis";
import { videos } from "./data/info";

const App = () => {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;

      // Check OS theme preference if no saved preference
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      } else {
        return "light";
      }
    }
    return "dark";
  });
  const [time, setTime] = useState(new Date());

  // const [count, setCount] = useState(0);
  const [selectedAscii, setSelectedAscii] = useState(String); // picked ascii art
  const [expandWindow, setExpandWindow] = useState(String); // which window is expanded
  const [selectedWindow, setSelectedWindow] = useState("me"); // which window is selected

  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null); // now playing on spotify
  const [topTracks, setTopTracks] = useState<TopTracksData | null>(null); // top tracks on spotify
  const [leetCode, setLeetCode] = useState<LeetCodeData | null>(null); // leetcode stats
  // const [currentIndex, setCurrentIndex] = useState(0);

  const [experienceIndex, setExperienceIndex] = useState(0); // index of experience
  const [projectIndex, setProjectIndex] = useState(0); // index of project
  const [selectProject, setSelectProject] = useState(""); // selected project
  const [selectExperience, setSelectExperience] = useState(""); // selected experience
  const [selectedLinkIndex, setSelectedLinkIndex] = useState(0); // index of selected link within project
  const [selectedExperienceLinkIndex, setSelectedExperienceLinkIndex] =
    useState(0); // index of selected link within experience

  // cli
  const [command, setCommand] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  const [response, setResponse] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const meWindowRef = useRef<HTMLDivElement>(null);

  // timer state
  const [timerMinutes, setTimerMinutes] = useState(30); // default pomodoro time
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"work" | "break" | "longBreak">(
    "work"
  );
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [selectedTimerButton, setSelectedTimerButton] = useState(0); // 0 for start/pause, 1 for reset
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isMediaPlayerOpen, setIsMediaPlayerOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Add this near your other CLI state variables (around line 29)
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  // pick random ascii art
  useEffect(() => {
    // if (count % 10 == 0) {
    setSelectedAscii(asciiList[Math.floor(Math.random() * asciiList.length)]);
    //}
  }, []);

  useEffect(() => {
    fetchNowPlaying().then((data) => setNowPlaying(data));
  }, []);

  useEffect(() => {
    fetchLeetCode().then((data) => setLeetCode(data));
  }, []);

  // update time every second
  useEffect(() => {
    setInterval(() => {
      setTime(new Date());
    }, 1000);
  }, []);

  // handle keyboard navigation between list of exp & projs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isResumeOpen || isMediaPlayerOpen) return;

      if (selectedWindow === "me") {
        if (e.key === "Enter") {
          setExpandWindow("me");
        }
      }
      if (expandWindow === "me") {
        if (e.key === "Enter") {
          setExpandWindow("");
        } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          if (meWindowRef.current) {
            const scrollAmount = 50; // pixels to scroll
            if (e.key === "ArrowUp") {
              meWindowRef.current.scrollTop -= scrollAmount;
            } else {
              meWindowRef.current.scrollTop += scrollAmount;
            }
          }
        }
      }
      if (selectedWindow === "music") {
        if (e.key === "Enter") {
          setExpandWindow("music");
        }
      }
      if (expandWindow === "music") {
        if (e.key === "Enter") {
          setExpandWindow("");
        }
      }
      if (selectedWindow === "experience") {
        if (selectExperience) {
          // Navigation within expanded experience (for links)
          const selectedExperienceData = experiencesData.find(
            (exp) => exp.title === selectExperience
          );
          if (selectedExperienceData) {
            const totalItems = selectedExperienceData.links.length + 1; // +1 for "back to experiences" button

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setSelectedExperienceLinkIndex(
                (prev) => (prev - 1 + totalItems) % totalItems
              );
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setSelectedExperienceLinkIndex((prev) => (prev + 1) % totalItems);
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (
                selectedExperienceLinkIndex <
                selectedExperienceData.links.length
              ) {
                // Navigate to selected link
                window.open(
                  selectedExperienceData.links[selectedExperienceLinkIndex].url,
                  "_blank"
                );
              } else {
                // "back to experiences" button selected
                setSelectExperience("");
                setExpandWindow("");
              }
            }
          }
        } else {
          // Navigation between experiences (existing code)
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
        }
      } else if (selectedWindow === "projects") {
        if (selectProject) {
          // Navigation within expanded project (for links)
          const selectedProjectData = projectsData.find(
            (p) => p.title === selectProject
          );
          if (selectedProjectData) {
            const totalItems = selectedProjectData.links.length + 1; // +1 for "back to projects" button

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setSelectedLinkIndex(
                (prev) => (prev - 1 + totalItems) % totalItems
              );
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setSelectedLinkIndex((prev) => (prev + 1) % totalItems);
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (selectedLinkIndex < selectedProjectData.links.length) {
                // Navigate to selected link
                window.open(
                  selectedProjectData.links[selectedLinkIndex].url,
                  "_blank"
                );
              } else {
                // "back to projects" button selected
                setSelectProject("");
                setExpandWindow("");
              }
            }
          }
        } else {
          // Navigation between projects (existing code)
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
      }
      if (selectedWindow === "leetcode") {
        if (e.key === "Enter") {
          setExpandWindow("leetcode");
        }
      }
      if (expandWindow === "leetcode") {
        if (e.key === "Enter") {
          setExpandWindow("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedWindow,
    expandWindow,
    experienceIndex,
    projectIndex,
    selectProject,
    selectedLinkIndex,
    selectExperience,
    selectedExperienceLinkIndex,
    isResumeOpen,
    isMediaPlayerOpen,
  ]);

  // Reset selected link index when project changes - default to "back" button
  useEffect(() => {
    if (selectProject) {
      const selectedProjectData = projectsData.find(
        (p) => p.title === selectProject
      );
      if (selectedProjectData) {
        // Set to the "back" button index (which is after all links)
        setSelectedLinkIndex(selectedProjectData.links.length);
      }
    } else {
      setSelectedLinkIndex(0);
    }
  }, [selectProject]);

  // Reset selected experience link index when experience changes - default to "back" button
  useEffect(() => {
    if (selectExperience) {
      const selectedExperienceData = experiencesData.find(
        (exp) => exp.title === selectExperience
      );
      if (selectedExperienceData) {
        // Set to the "back" button index (which is after all links)
        setSelectedExperienceLinkIndex(selectedExperienceData.links.length);
      }
    } else {
      setSelectedExperienceLinkIndex(0);
    }
  }, [selectExperience]);

  // Spotify functions
  async function fetchNowPlaying() {
    const res = await fetch("/api/now-playing");
    if (!res.ok) {
      console.error(await res.text());
      return null;
    }
    return await res.json();
  }

  async function fetchLeetCode() {
    const res = await fetch("/api/leetcode");
    if (!res.ok) {
      console.error(await res.text());
      return null;
    }
    return await res.json();
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = await fetchNowPlaying();
      setNowPlaying(now);
    }, 360000); // every 6 minutes

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this runs only once on mount

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

  // ask question to Gemini with client-side streaming
  // Replace the existing askQuestion function (lines 276-314)
  async function askQuestion(q: string, onChunk: (chunk: string) => void) {
    // Build the conversation history including the new question
    const messages = [...chatHistory, { role: "user" as const, content: q }];

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }), // Send full conversation instead of just question
    });

    const data = await res.json();
    const fullResponse = data.answer;

    // Stream the response word by word for that authentic feel
    const words = fullResponse.split(" ");
    let currentText = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const chunk = (i === 0 ? "" : " ") + word;
      currentText += chunk;
      onChunk(chunk);

      // Variable delay based on word length and punctuation for natural feel
      let delay = 25 + Math.random() * 25; // Base 25-50ms

      // Longer pause after punctuation
      if (word.includes(".") || word.includes("!") || word.includes("?")) {
        delay += 200 + Math.random() * 100;
      } else if (word.includes(",") || word.includes(";")) {
        delay += 100 + Math.random() * 50;
      }

      // Shorter delay for short words
      if (word.length <= 2) {
        delay *= 0.7;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // After streaming is complete, update chat history
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: q },
      { role: "assistant", content: fullResponse },
    ]);
  }

  // handle command input
  const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && command) {
      setLastCommand(command);
      setResponse(""); // Clear previous response
      setCommand("");

      // Stream the response
      try {
        await askQuestion(command, (chunk: string) => {
          setResponse((prev) => prev + chunk);
        });
      } catch (error) {
        console.error("Error streaming response:", error);
        setResponse("sorry, something went wrong. try again?");
      }
    }
  };

  useEffect(() => {
    if (selectedWindow === "cli") {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [selectedWindow]);

  // Auto-focus the expanded me window for keyboard navigation
  useEffect(() => {
    if (expandWindow === "me" && meWindowRef.current) {
      meWindowRef.current.focus();
    }
  }, [expandWindow]);

  // theme toggle
  useEffect(() => {
    const handler = () =>
      setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    window.addEventListener("toggleTheme", handler);
    return () => window.removeEventListener("toggleTheme", handler);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const isDark = theme === "dark";
  const windowThemeClass = isDark
    ? "bg-black/80 border border-gray-700"
    : "bg-[#F6F6F6]/90 border border-gray-300";
  const gridThemeClass = isDark
    ? "bg-gray-900/40 border border-gray-700"
    : "bg-gray-100/60 border border-gray-300";
  const overlayThemeClass = isDark
    ? "bg-black/90 border border-gray-700"
    : "bg-white border border-gray-300";
  const headerClass = (selected: boolean) =>
    isDark
      ? selected
        ? "bg-white text-black"
        : "bg-gray-400 text-black"
      : selected
      ? "bg-gray-400 text-black"
      : "bg-gray-200 text-black";

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    // keyboard navigation between for windows using < and >

    if (isResumeOpen || isMediaPlayerOpen) return;

    const windowOrder = isTimerOpen
      ? ["me", "experience", "projects", "music", "timer", "cli"]
      : ["me", "experience", "projects", "music", "leetcode", "cli"];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (expandWindow) return;

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const currentIndex = windowOrder.indexOf(selectedWindow);
        let nextIndex;

        if (e.key === "ArrowRight") {
          nextIndex = (currentIndex + 1) % windowOrder.length;
        } else {
          // ArrowLeft
          nextIndex =
            (currentIndex - 1 + windowOrder.length) % windowOrder.length;
        }

        setSelectedWindow(windowOrder[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedWindow,
    expandWindow,
    isTimerOpen,
    isResumeOpen,
    isMediaPlayerOpen,
  ]);

  // Handle closing timer when it's the selected window
  useEffect(() => {
    if (!isTimerOpen && selectedWindow === "timer") {
      setSelectedWindow("music");
      setExpandWindow("");
    }
  }, [isTimerOpen, selectedWindow]);

  useEffect(() => {
    let interval: number;

    if (isTimerRunning && (timerMinutes > 0 || timerSeconds > 0)) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1);
          setTimerSeconds(59);
        }
      }, 1000);
    } else if (isTimerRunning && timerMinutes === 0 && timerSeconds === 0) {
      // Timer finished
      setIsTimerRunning(false);
      playNotificationSound();
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds]);

  // Add timer helper functions
  const playNotificationSound = () => {
    // Create audio context for notification sound
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleTimerComplete = () => {
    if (timerMode === "work") {
      setPomodoroCount((prev) => prev + 1);
      if (pomodoroCount + 1 >= 4) {
        setTimerMode("longBreak");
        setTimerMinutes(15);
        setPomodoroCount(0);
      } else {
        setTimerMode("break");
        setTimerMinutes(5);
      }
    } else {
      setTimerMode("work");
      setTimerMinutes(customMinutes);
    }
    setTimerSeconds(0);
  };

  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerMinutes(customMinutes);
    setTimerSeconds(0);
    setTimerMode("work");
    setPomodoroCount(0);
  };

  const setCustomTimer = (minutes: number) => {
    setCustomMinutes(minutes);
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  // Add event listener for taskbar timer button
  useEffect(() => {
    const handleOpenTimer = () => {
      setIsTimerOpen(true);
      setSelectedWindow("timer");
    };

    window.addEventListener("openTimer", handleOpenTimer);
    return () => window.removeEventListener("openTimer", handleOpenTimer);
  }, []);

  // Add event listener for taskbar resume button
  useEffect(() => {
    const handleOpenResume = () => {
      setIsResumeOpen(true);
    };

    window.addEventListener("openResume", handleOpenResume);
    return () => window.removeEventListener("openResume", handleOpenResume);
  }, []);

  // Add event listener for taskbar media player button
  useEffect(() => {
    const handleOpenMedia = () => {
      setIsMediaPlayerOpen(true);
    };

    window.addEventListener("openMedia", handleOpenMedia);
    return () => window.removeEventListener("openMedia", handleOpenMedia);
  }, []);

  // Handle keyboard navigation for resume overlay
  useEffect(() => {
    if (!isResumeOpen) return;

    setIsMediaPlayerOpen(false);

    const handleResumeKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsResumeOpen(false);
      }
    };

    window.addEventListener("keydown", handleResumeKeyDown);
    return () => window.removeEventListener("keydown", handleResumeKeyDown);
  }, [isResumeOpen]);

  // Handle keyboard navigation for media player overlay
  useEffect(() => {
    if (!isMediaPlayerOpen) return;

    setIsResumeOpen(false);

    const handleMediaKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMediaPlayerOpen(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentVideoIndex(
          (prev) => (prev - 1 + videos.length) % videos.length
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
      } else if (e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key) - 1;
        if (index < videos.length) {
          setCurrentVideoIndex(index);
        }
      }
    };

    window.addEventListener("keydown", handleMediaKeyDown);
    return () => window.removeEventListener("keydown", handleMediaKeyDown);
  }, [isMediaPlayerOpen, videos.length]);

  // Prevent background scrolling when window is expanded on mobile
  useEffect(() => {
    if (expandWindow) {
      // Lock body scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      // Unlock body scroll
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [expandWindow]);

  // Add this new state variable for expanded timer navigation (near the other timer states around line 45)
  const [selectedExpandedTimerButton, setSelectedExpandedTimerButton] =
    useState(0);
  // 0-1: start/pause and reset buttons, 2-6: custom timer buttons (5m, 15m, 30m, 45m, 60m)

  // Update the existing timer keyboard navigation useEffect to handle both compact and expanded modes
  useEffect(() => {
    if (selectedWindow !== "timer") return;

    const handleTimerKeyDown = (e: KeyboardEvent) => {
      if (expandWindow === "timer") {
        // Expanded timer navigation with two levels: start/reset (0-1) and custom timers (2-6)
        if (e.key === "ArrowUp") {
          e.preventDefault();
          // Move between levels: if in custom timers (2-6), go to start/reset level
          if (selectedExpandedTimerButton >= 2) {
            setSelectedExpandedTimerButton(0); // Go to start button
          } else {
            // If in start/reset level, go to custom timers
            setSelectedExpandedTimerButton(2); // Go to first custom timer (5m)
          }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          // Move between levels: if in start/reset (0-1), go to custom timers
          if (selectedExpandedTimerButton <= 1) {
            setSelectedExpandedTimerButton(2); // Go to first custom timer (5m)
          } else {
            // If in custom timers, go to start/reset level
            setSelectedExpandedTimerButton(0); // Go to start button
          }
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          if (selectedExpandedTimerButton <= 1) {
            // Navigate within start/reset level (0-1)
            setSelectedExpandedTimerButton((prev) => (prev === 0 ? 1 : 0));
          } else {
            // Navigate within custom timer level (2-6)
            setSelectedExpandedTimerButton((prev) => Math.max(2, prev - 1));
          }
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          if (selectedExpandedTimerButton <= 1) {
            // Navigate within start/reset level (0-1)
            setSelectedExpandedTimerButton((prev) => (prev === 1 ? 0 : 1));
          } else {
            // Navigate within custom timer level (2-6)
            setSelectedExpandedTimerButton((prev) => Math.min(6, prev + 1));
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (selectedExpandedTimerButton === 0) {
            isTimerRunning ? pauseTimer() : startTimer();
          } else if (selectedExpandedTimerButton === 1) {
            resetTimer();
          } else {
            // Custom timer buttons (2-6 correspond to [5, 15, 30, 45, 60])
            const customTimes = [5, 15, 30, 45, 60];
            const timeIndex = selectedExpandedTimerButton - 2;
            setCustomTimer(customTimes[timeIndex]);
          }
        }
      } else {
        // Compact timer navigation (existing code)
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedTimerButton((prev) => (prev === 0 ? 1 : 0));
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedTimerButton((prev) => (prev === 1 ? 0 : 1));
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (selectedTimerButton === 0) {
            isTimerRunning ? pauseTimer() : startTimer();
          } else {
            resetTimer();
          }
        }
      }
    };

    window.addEventListener("keydown", handleTimerKeyDown);
    return () => window.removeEventListener("keydown", handleTimerKeyDown);
  }, [
    selectedWindow,
    selectedTimerButton,
    selectedExpandedTimerButton,
    isTimerRunning,
    expandWindow,
  ]);

  // Add effect to listen for OS theme changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e: MediaQueryListEvent) => {
        // Only update theme if user hasn't manually set a preference
        const savedTheme = localStorage.getItem("theme");
        if (!savedTheme) {
          setTheme(e.matches ? "dark" : "light");
        }
      };

      // Listen for changes in OS theme preference
      mediaQuery.addEventListener("change", handleChange);

      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  return (
    <div
      className={`${
        isDark
          ? "bg-black text-white lg:bg-[url('/creation_of_adam.jpeg')]"
          : "bg-white text-black lg:bg-[url('/creation_of_adam_light.jpg')]"
      } min-h-screen w-screen flex items-center justify-center py-6 pb-24 lg:py-8 lg:pb-20 bg-fixed bg-cover bg-center overscroll-none`}
    >
      {/* Bento box grid */}
      <div
        className={`relative grid grid-cols-2 lg:grid-cols-4 lg:row-span-4 w-full mx-1 gap-2 rounded-2xl p-1.5 ${gridThemeClass} max-w-6xl lg:justify-center shadow-xl lg:min-h-[70vh]`}
      >
        {/* Main terminal window */}
        <div
          className={` ${windowThemeClass} rounded-xl col-span-2 flex flex-col order-1 ${
            expandWindow ? "opacity-0" : ""
          } transition-opacity duration-500`}
          onClick={() => {
            setSelectedWindow("me");
            console.log(selectedWindow);
          }}
        >
          <p
            className={`rounded-t-xl text-sm text-center relative ${headerClass(
              selectedWindow === "me"
            )}`}
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
            <p
              className={`text-[4px] font-mono whitespace-pre min-w-1/2 text-center ${
                isDark ? "text-blue-100" : "text-[#000000]"
              }`}
            >
              {selectedAscii}
            </p>
            <div className="mx-auto  min-w-1/2 mt-2">
              <p
                className={`${
                  isDark ? "text-blue-300" : "text-[#2A8EE0]"
                } text-sm lg:text-lg`}
              >
                daniel@MacbookPro
              </p>
              <p className="text-[9px] lg:text-sm mb-2">
                nguyendaniel1312@gmail.com
              </p>
              <p className=" ml-4 text-xs lg:text-sm">Full-Stack</p>
              <p className=" ml-4 text-xs lg:text-sm">Junior CS @ SJSU</p>
              {/* <p className=" ml-4 text-xs lg:text-sm">
                Expected Grad: May 2027
              </p> */}
              <p className=" ml-4 text-xs lg:text-sm">San Jose, CA</p>
              <p className=" ml-4 text-xs lg:text-sm">
                {time.toLocaleTimeString()}
              </p>
              <p className=" ml-4 mt-2 text-xs hidden lg:block text-gray-400">
                <p className="inline-block text-lg">☆</p> try arrows keys &
                enter!
              </p>
              <button
                className=" ml-4 mt-2 mb-2 text-xs block text-left text-gray-400 underline"
                onClick={() => {
                  setExpandWindow("me");
                }}
              >
                click me to read more!
              </button>
            </div>
          </div>
        </div>

        {/* Music */}
        <div
          className={` ${windowThemeClass} ${
            isTimerOpen
              ? "col-span-2 lg:col-span-1"
              : "col-span-2 lg:col-span-1 lg:row-span-1"
          } rounded-xl order-2 ${
            expandWindow ? "opacity-0" : ""
          } transition-opacity duration-500`}
          onClick={() => {
            setSelectedWindow("music");
            console.log(selectedWindow);
          }}
        >
          <p
            className={`rounded-t-xl text-sm text-center relative ${headerClass(
              selectedWindow === "music"
            )}`}
          >
            music - zsh
            <button className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
            <button className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2" />
            <button
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
              <p>
                <div className="flex items-center">
                  <HeadphoneOff
                    className={`w-16 h-16 p-3 rounded-md mr-4 ${
                      isDark ? "bg-gray-800" : "bg-gray-200"
                    }`}
                  />
                  <div>
                    <p className="text-xs lg:text-sm font-medium">
                      i'm not currently listening to music {"("}or my spotify
                      api has been rate-limited ˙◠˙{")"}.
                    </p>
                    <p className="text-xs text-gray-400">
                      visit my{" "}
                      <a
                        href="https://open.spotify.com/user/cringedlol"
                        className={`${
                          isDark ? "text-blue-400" : "text-[#2A8EE0]"
                        } underline`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        spotify
                      </a>
                      !
                    </p>
                  </div>
                </div>
              </p>
            )}
            {topTracks && topTracks.tracks ? (
              <div className="flex flex-col mb-3">
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  } mt-4`}
                >
                  Top Tracks
                </p>
                {topTracks.tracks.map((track) => (
                  <div key={track.id} className="flex items-center mt-1.5">
                    <img
                      src={track.album_image}
                      alt={track.album}
                      className="w-8 h-8 rounded-md mr-4"
                    />
                    <div className="text-sm text-gray-400">{track.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className={`text-sm text-gray-200 mt-4 ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                fetching top tracks...
              </p>
            )}
          </div>
        </div>

        {/* LeetCode */}
        {!isTimerOpen && (
          <div
            className={` ${windowThemeClass} col-span-2 lg:col-span-1 rounded-xl order-7 row-start-6 lg:row-start-2 ${
              expandWindow ? "opacity-0" : ""
            } transition-opacity duration-500`}
            onClick={() => {
              setSelectedWindow("leetcode");
              console.log(selectedWindow);
            }}
          >
            <p
              className={`rounded-t-xl text-sm text-center relative ${headerClass(
                selectedWindow === "leetcode"
              )}`}
            >
              leetcode - zsh
              <button className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
              <button className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2" />
              <button
                className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setExpandWindow("leetcode")}
              />
            </p>
            <div className="w-full flex flex-col items-center justify-center my-2">
              {leetCode && leetCode.totalSolved ? (
                <div className="flex items-center gap-4">
                  <img
                    src="/leetcode_color.png"
                    alt="LeetCode Logo"
                    className="w-16 h-16 bg-gray-100 rounded-xl p-1"
                  />
                  <div className="flex-grow">
                    <p
                      className={`text-sm font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      total solved: {leetCode.totalSolved}
                    </p>
                    <div className="flex flex-col justify-between text-sm">
                      <p className="text-green-400">
                        easy: {leetCode.easySolved}
                      </p>
                      <p className="text-yellow-400">
                        medium: {leetCode.mediumSolved}
                      </p>
                      <p className="text-red-400">
                        hard: {leetCode.hardSolved}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p
                  className={`text-sm text-gray-200 mt-4 p-4 ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  fetching leetcode stats...
                </p>
              )}
              {leetCode && leetCode.submissionCalendar && (
                <LeetCodeCalendar
                  submissionCalendar={leetCode.submissionCalendar}
                  isDark={isDark}
                />
              )}
            </div>
          </div>
        )}

        {/* CLI LLM about me */}
        <div
          className={`${windowThemeClass} col-span-2 lg:col-span-1 lg:row-span-2 rounded-xl order-3 ${
            expandWindow ? "opacity-0" : ""
          } transition-opacity duration-500 flex flex-col min-h-0`}
          onClick={() => {
            setSelectedWindow("cli");
            focusInput();
          }}
        >
          <p
            className={`rounded-t-xl text-sm text-center relative top-0 ${headerClass(
              selectedWindow === "cli"
            )}`}
          >
            daniel-code - zsh
            <button
              className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2"
              onClick={() => setExpandWindow("")}
            />
            <button
              className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
              onClick={() => setExpandWindow("")}
            />
            <button
              className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setExpandWindow("cli")}
            />
          </p>
          <div
            className="font-mono text-sm flex-grow overflow-y-auto lg:h-0"
            onClick={focusInput}
          >
            {lastCommand && (
              <>
                <div className="flex items-center py-2 px-4">
                  <span className="text-blue-400">❯</span>
                  <p
                    className={`ml-2 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {lastCommand}
                  </p>
                </div>
                {!response && (
                  <p
                    className={`${
                      isDark ? "text-gray-200" : "text-gray-800"
                    } whitespace-pre-wrap px-4`}
                  >
                    hmm
                    <AnimatedEllipsis />
                  </p>
                )}
                <p
                  className={`${
                    isDark ? "text-gray-200" : "text-gray-800"
                  } whitespace-pre-wrap px-4`}
                >
                  {response}
                </p>
              </>
            )}
            <div className="flex items-center py-2 px-4">
              <span className="text-blue-400">❯</span>
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCommand(e);
                  }
                }}
                className={`bg-transparent border-none ${
                  isDark
                    ? "text-gray-200 placeholder:text-gray-400"
                    : "text-gray-800 placeholder:text-gray-400"
                } w-full focus:outline-none ml-2`}
                placeholder="ask me anything!"
              />
            </div>
          </div>
        </div>

        {/* Experience */}
        <div
          className={`${windowThemeClass} col-span-2 lg:col-span-1 rounded-xl order-4 row-start-2 ${
            expandWindow ? "opacity-0" : ""
          } transition-opacity duration-500`}
          onClick={() => {
            setSelectedWindow("experience");
            console.log(selectedWindow);
          }}
        >
          <p
            className={`rounded-t-xl text-sm text-center relative ${headerClass(
              selectedWindow === "experience"
            )}`}
          >
            experience - zsh
            <button className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
            <button className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2" />
            <button
              className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setExpandWindow("experience")}
            />
          </p>
          <div className="my-2 mx-4">
            {experiencesData.map((experience, index) => (
              <div
                key={index}
                className={`rounded-md text-sm lg:text-base transition-all duration-150 cursor-pointer my-2 lg:my-1 ${
                  index === experienceIndex
                    ? `${
                        isDark ? "text-white" : "text-gray-800"
                      } font-bold underline`
                    : `bg-transparent ${
                        isDark ? "text-blue-300" : "text-[#75b8eb]"
                      }`
                }`}
                onClick={() => {
                  setExpandWindow("experience");
                  setSelectExperience(experience.title);
                }}
              >
                {experience.title} {index == experienceIndex ? " ❮" : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div
          className={` ${windowThemeClass} col-span-2 lg:col-span-1 rounded-xl order-5 row-start-3 lg:row-start-2 ${
            expandWindow ? "opacity-0" : ""
          } transition-opacity duration-500`}
          onClick={() => {
            setSelectedWindow("projects");
            console.log(selectedWindow);
          }}
        >
          <p
            className={`rounded-t-xl text-sm text-center relative ${headerClass(
              selectedWindow === "projects"
            )}`}
          >
            projects - zsh
            <button className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
            <button className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2" />
            <button
              className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setExpandWindow("projects")}
            />
          </p>
          <div className="mt-2 mx-4">
            {projectsData.map((project, index) => (
              <div
                key={index}
                className={` rounded-md text-sm lg:text-base transition-all duration-150 cursor-pointer my-2 lg:my-1 ${
                  index === projectIndex
                    ? `${
                        isDark ? "text-white" : "text-gray-800"
                      } font-bold underline`
                    : `bg-transparent ${
                        isDark ? "text-blue-300" : "text-[#75b8eb]"
                      }`
                }`}
                onClick={() => {
                  setExpandWindow("projects");
                  setProjectIndex(index);
                  setSelectProject(project.title);
                }}
              >
                {project.title}
                {index === projectIndex ? " ❮" : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Timer - only render when open */}
        {isTimerOpen && (
          <div
            className={` ${windowThemeClass} col-span-2 lg:col-span-1 rounded-xl order-6 ${
              expandWindow ? "opacity-0" : ""
            } transition-opacity duration-500`}
            onClick={() => {
              setSelectedWindow("timer");
              console.log(selectedWindow);
            }}
          >
            <p
              className={`rounded-t-xl text-sm text-center relative ${headerClass(
                selectedWindow === "timer"
              )}`}
            >
              pomodoro timer - zsh
              <button
                className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2"
                onClick={() => setIsTimerOpen(false)}
              />
              <button className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2" />
              <button
                className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setExpandWindow("timer")}
              />
            </p>
            <div className="mt-4 mx-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-mono mb-2">
                {String(timerMinutes).padStart(2, "0")}:
                {String(timerSeconds).padStart(2, "0")}
              </div>
              {/* <div className="text-xs text-gray-400 mb-2">
                {timerMode === "work"
                  ? "Work Time"
                  : timerMode === "break"
                  ? "Short Break"
                  : "Long Break"}
              </div> */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={isTimerRunning ? pauseTimer : startTimer}
                  className={`p-1 rounded hover:bg-gray-700 ${
                    selectedTimerButton === 0 ? " " : ""
                  }`}
                >
                  {isTimerRunning ? (
                    <div className="flex items-center gap-2">
                      <Pause className="w-4 h-4" />
                      <p
                        className={
                          selectedTimerButton === 0 ? "font-bold underline" : ""
                        }
                      >
                        pause
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <p
                        className={
                          selectedTimerButton === 0 ? "font-bold underline" : ""
                        }
                      >
                        start
                      </p>
                    </div>
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className={`p-1 rounded hover:bg-gray-700 ${
                    selectedTimerButton === 1 ? "" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <p
                      className={
                        selectedTimerButton === 1 ? "font-bold underline" : ""
                      }
                    >
                      reset
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setExpandWindow("timer")}
                  className={`p-1 rounded hover:bg-gray-700 ${
                    selectedTimerButton === 2 ? "" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* <Pencil className="w-4 h-4" />
                    <p
                      className={
                        selectedTimerButton === 2 ? "font-bold underline" : ""
                      }
                    >
                      edit
                    </p> */}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expanded overlay when user clicks */}
        {expandWindow && (
          <div className="lg:absolute lg:inset-0 fixed inset-0 z-20 transition-opacity duration-300 lg:h-full h-screen max-h-screen overflow-y-auto flex items-center justify-center lg:items-stretch lg:justify-stretch">
            {expandWindow === "me" && (
              <div
                ref={meWindowRef}
                className={`w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none ${windowThemeClass} rounded-xl overflow-y-auto focus:outline-none relative pb-24 lg:pb-0 overscroll-none`}
                tabIndex={0}
              >
                <p
                  className={`rounded-t-xl text-sm text-center sticky top-0 left-0 right-0 ${headerClass(
                    true
                  )}`}
                >
                  me - zsh
                  <button
                    className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setExpandWindow("me")}
                  />
                </p>
                <div className=" flex mt-6">
                  <p
                    className={`text-[4px] ${
                      isDark ? "text-blue-100" : "text-black"
                    } font-mono whitespace-pre min-w-1/2 text-center`}
                  >
                    {selectedAscii}
                  </p>
                  <div className="mx-auto  min-w-1/2 mt-2">
                    <p
                      className={`${
                        isDark ? "text-blue-300" : "text-[#75b8eb]"
                      } text-sm lg:text-lg`}
                    >
                      daniel@MacbookPro
                    </p>
                    <p className="text-[9px] lg:text-sm mb-2">
                      nguyendaniel1312@gmail.com
                    </p>
                    <p className=" ml-4 text-xs lg:text-sm">Full-Stack</p>
                    <p className=" ml-4 text-xs lg:text-sm">CS @ SJSU</p>
                    <p className=" ml-4 text-xs lg:text-sm">
                      Expected Grad: May 2027
                    </p>
                    <p className=" ml-4 text-xs lg:text-sm">San Jose, CA</p>
                    <p className=" ml-4 text-xs lg:text-sm">
                      {time.toLocaleTimeString()}
                    </p>
                    <p className=" ml-4 mt-2 text-xs hidden lg:block text-gray-400">
                      <p className="inline-block text-lg">☆</p> try arrows keys
                      & enter!
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-5 max-w-2xl mx-auto mt-4 mb-10 px-4 ">
                  <p
                    className={`text-gray-200 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Hello!
                  </p>
                  <p
                    className={`text-gray-200 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Welcome to my portfolio, I hope you like it!
                  </p>
                  <p
                    className={`text-gray-200 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Back in high school, I took AP Computer Science for fun. I
                    thought it was a really fun class, so when applying to
                    colleges, I picked Computer Science as my major not really
                    knowing what it was about. Since then, I have really fell in
                    love with coding.
                  </p>
                  <p
                    className={`text-gray-200 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    I'm currently in my third year at SJSU, and I'm expected to
                    graduate in May 2027. I'm also working part-time as a
                    full-stack developer at TwinMind.
                  </p>
                  <p
                    className={`text-gray-200 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Outside of school, I like to film & edit videos, playing
                    basketball, watching movies/shows/anime, and listening to
                    music.
                  </p>
                  <p
                    className={`text-gray-200 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    I'm currently focused on improving my engineering skills and
                    searching for Summer 2026 internships.
                  </p>
                  {/* <p
                    className={`text-gray-200 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    ✉︎ nguyendaniel1312@gmail.com
                  </p> */}
                  <button
                    className="text-gray-400 text-left underline"
                    onClick={() => setExpandWindow("")}
                  >
                    back to main page ❮
                  </button>
                </div>
              </div>
            )}
            {expandWindow === "experience" && (
              <>
                {selectExperience !== "" ? (
                  <div
                    className={`w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none ${windowThemeClass} rounded-xl overflow-y-auto pb-36 lg:pb-0 overscroll-none`}
                  >
                    <p
                      className={`rounded-t-xl text-sm text-center sticky top-0 ${headerClass(
                        selectedWindow === "experience"
                      )}`}
                    >
                      {selectExperience}
                      <button
                        className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setExpandWindow("")}
                      />
                      <button
                        className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                        onClick={() => {
                          setExpandWindow("");
                          setSelectExperience("");
                        }}
                      />
                      <button className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2" />
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
                                className="w-full h-48 object-cover rounded-lg mb-4 max-w-2xl mx-auto"
                              />
                              <p
                                className={`text-gray-300 mt-2 max-w-2xl mx-auto ${
                                  isDark ? "text-gray-200" : "text-gray-800"
                                }`}
                              >
                                {selectedExperienceData.date}
                              </p>
                              <p
                                className={`text-gray-400 mt-2 max-w-2xl mx-auto ${
                                  isDark ? "text-gray-200" : "text-gray-800"
                                }`}
                              >
                                {selectedExperienceData.description}
                              </p>
                              <div className="mt-4 max-w-2xl mx-auto flex flex-col">
                                {selectedExperienceData.links.map(
                                  (link, index) => (
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      key={link.name}
                                      className={`inline-block  rounded transition-all duration-150 ${
                                        isDark
                                          ? "text-gray-200"
                                          : "text-gray-800"
                                      } ${
                                        index === selectedExperienceLinkIndex
                                          ? " font-bold"
                                          : ""
                                      }`}
                                    >
                                      {link.name}{" "}
                                      {index === selectedExperienceLinkIndex
                                        ? "❮ "
                                        : ""}
                                    </a>
                                  )
                                )}
                                <button
                                  className={`mt-2 rounded self-start transition-all duration-150 ${
                                    selectedExperienceLinkIndex ===
                                    selectedExperienceData.links.length
                                      ? "font-bold"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setSelectExperience("");
                                    setExpandWindow("");
                                  }}
                                >
                                  back to experiences{" "}
                                  {selectedExperienceLinkIndex ===
                                  selectedExperienceData.links.length
                                    ? "❮ "
                                    : ""}
                                </button>
                              </div>
                            </div>
                          );
                        }
                        return <p>Experience not found.</p>;
                      })()}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none ${windowThemeClass} rounded-xl overflow-y-auto overscroll-none`}
                  >
                    <p
                      className={`rounded-t-xl text-sm text-center relative ${headerClass(
                        selectedWindow === "experience"
                      )}`}
                    >
                      experience - zsh
                      <button
                        className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2"
                        onClick={() => setExpandWindow("")}
                      />
                      <button
                        className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                        onClick={() => setExpandWindow("")}
                      />
                      <button className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2" />
                    </p>
                    <div className="mt-2 mx-4">
                      {experiencesData.map((experience, index) => (
                        <div
                          key={index}
                          className={` rounded-md transition-all duration-150 cursor-pointer ${
                            index === experienceIndex
                              ? " text-white font-bold underline"
                              : "bg-transparent text-blue-300"
                          }`}
                          onClick={() => setSelectExperience(experience.title)}
                        >
                          {experience.title}{" "}
                          {index == experienceIndex ? " ❮" : ""}
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
                  <div
                    className={`w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none ${windowThemeClass} rounded-xl overflow-y-auto pb-36 lg:pb-0 overscroll-none`}
                  >
                    <p
                      className={`rounded-t-xl text-sm text-center sticky top-0 ${headerClass(
                        selectedWindow === "projects"
                      )}`}
                    >
                      {
                        projectsData.find((p) => p.title === selectProject)
                          ?.window
                      }
                      <button
                        className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2"
                        onClick={() => setExpandWindow("")}
                      />
                      <button
                        className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                        onClick={() => {
                          setExpandWindow("");
                          setSelectProject("");
                        }}
                      />
                      <button
                        className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setExpandWindow("projects")}
                      />
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
                                className="mx-auto h-48 object-contain rounded-lg mb-4"
                              />
                              <p
                                className={`text-gray-300 mt-2 max-w-2xl mx-auto ${
                                  isDark ? "text-gray-200" : "text-gray-800"
                                }`}
                              >
                                {selectedProjectData.date}
                              </p>
                              <p
                                className={`text-gray-400 mt-2 max-w-2xl mx-auto ${
                                  isDark ? "text-gray-200" : "text-gray-800"
                                }`}
                              >
                                {selectedProjectData.description}
                              </p>
                              <div className="mt-4 max-w-2xl mx-auto flex flex-col">
                                {selectedProjectData.links.map(
                                  (link, index) => (
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      key={link.name}
                                      className={`inline-block ${
                                        isDark
                                          ? "text-gray-200"
                                          : "text-gray-800"
                                      } rounded transition-all duration-150 ${
                                        index === selectedLinkIndex
                                          ? " font-bold"
                                          : ""
                                      }`}
                                    >
                                      {link.name}{" "}
                                      {index === selectedLinkIndex ? "❮ " : ""}
                                    </a>
                                  )
                                )}
                                <button
                                  className={`mt-2 max-w-2xl self-start rounded transition-all duration-150 ${
                                    selectedLinkIndex ===
                                    selectedProjectData.links.length
                                      ? " font-bold"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setSelectProject("");
                                    setExpandWindow("");
                                  }}
                                >
                                  back to projects{" "}
                                  {selectedLinkIndex ===
                                  selectedProjectData.links.length
                                    ? "❮ "
                                    : ""}
                                </button>
                              </div>
                            </div>
                          );
                        }
                        return <p>Project not found.</p>;
                      })()}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none ${windowThemeClass} rounded-xl overflow-y-auto`}
                  >
                    <p
                      className={`rounded-t-xl text-sm text-center relative ${headerClass(
                        selectedWindow === "projects"
                      )}`}
                    >
                      projects - zsh
                      <button
                        className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2"
                        onClick={() => setExpandWindow("")}
                      />
                      <button
                        className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                        onClick={() => setExpandWindow("")}
                      />
                      <button
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
                              ? " text-white font-bold underline"
                              : "bg-transparent text-blue-300"
                          }`}
                          onClick={() => setSelectProject(project.title)}
                        >
                          {project.title}
                          {index === projectIndex ? " ❮" : ""}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {expandWindow === "music" && (
              <div
                className={`w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none ${windowThemeClass} rounded-xl overflow-y-auto overscroll-none`}
              >
                <p
                  className={`rounded-t-xl text-sm text-center sticky top-0 ${headerClass(
                    selectedWindow === "music"
                  )}`}
                >
                  music - zsh
                  <button
                    className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
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
                    <p>
                      <div className="flex items-center">
                        <HeadphoneOff
                          className={`w-16 h-16 p-3 rounded-md mr-4 ${
                            isDark ? "bg-gray-800" : "bg-gray-200"
                          }`}
                        />
                        <div>
                          <p className="text-xs lg:text-sm font-medium">
                            i'm not currently listening to music {"("}or my
                            spotify api has been rate-limited ˙◠˙{")"}.
                          </p>
                          <p className="text-xs text-gray-400">
                            visit my{" "}
                            <a
                              href="https://open.spotify.com/user/cringedlol"
                              className="text-blue-400 underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              spotify
                            </a>
                            !
                          </p>
                        </div>
                      </div>
                    </p>
                  )}
                  {topTracks && topTracks.tracks ? (
                    <div className="flex flex-col">
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-200" : "text-gray-800"
                        } mt-4`}
                      >
                        Top Tracks
                      </p>
                      {topTracks.tracks.map((track) => (
                        <div
                          key={track.id}
                          className="flex items-center mt-1.5"
                        >
                          <img
                            src={track.album_image}
                            alt={track.album}
                            className="w-8 h-8 rounded-md mr-4"
                          />
                          <div className="text-sm text-gray-400">
                            {track.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>top tracks loading...</p>
                  )}
                </div>
              </div>
            )}
            {expandWindow === "leetcode" && (
              <div
                className={`w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none ${windowThemeClass} rounded-xl overflow-y-auto overscroll-none`}
              >
                <p
                  className={`${
                    isDark ? "text-white" : "text-gray-800"
                  } rounded-t-xl text-sm text-center sticky top-0 z-10`}
                >
                  leetcode - zsh
                  <button
                    className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("leetcode")}
                  />
                </p>
                <div className="w-full flex flex-col items-center justify-center mt-4">
                  {leetCode && leetCode.totalSolved ? (
                    <div className="flex items-center gap-4">
                      <img
                        src="/leetcode_color.png"
                        alt="LeetCode Logo"
                        className="w-16 h-16 bg-white rounded-full p-1"
                      />
                      <div className="flex-grow">
                        <p
                          className={`text-sm font-bold ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          total solved: {leetCode.totalSolved}
                        </p>
                        <div className="flex flex-col  justify-between text-sm">
                          <p className="text-green-400">
                            easy: {leetCode.easySolved}
                          </p>
                          <p className="text-yellow-400">
                            medium: {leetCode.mediumSolved}
                          </p>
                          <p className="text-red-400">
                            hard: {leetCode.hardSolved}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p
                      className={`text-sm text-gray-200 mt-4 ${
                        isDark ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      fetching leetcode stats...
                    </p>
                  )}
                  {leetCode && leetCode.submissionCalendar && (
                    <div className="min-w-xs lg:min-w-md">
                      <LeetCodeCalendar
                        submissionCalendar={leetCode.submissionCalendar}
                        viewMode="month"
                        isDark={isDark}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            {expandWindow === "cli" && (
              <div
                className={`w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none ${windowThemeClass} rounded-xl flex flex-col overflow-y-auto overscroll-none`}
              >
                <p
                  className={`rounded-t-xl text-sm text-center sticky top-0 ${headerClass(
                    selectedWindow === "cli"
                  )}`}
                >
                  daniel-code - zsh
                  <button
                    className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("cli")}
                  />
                </p>
                <div
                  className="mt-2 mx-4 font-mono text-sm flex-grow overflow-y-auto"
                  onClick={focusInput}
                >
                  {lastCommand && (
                    <>
                      <div className="flex items-center">
                        <span className="text-blue-400">❯</span>
                        <p
                          className={`ml-2 ${
                            isDark ? "text-gray-200" : "text-gray-800"
                          }`}
                        >
                          {lastCommand}
                        </p>
                      </div>
                      {!response && (
                        <p
                          className={`${
                            isDark ? "text-gray-200" : "text-gray-800"
                          } whitespace-pre-wrap`}
                        >
                          hmm
                          <AnimatedEllipsis />
                        </p>
                      )}
                      <p
                        className={`${
                          isDark ? "text-gray-200" : "text-gray-800"
                        } whitespace-pre-wrap`}
                      >
                        {response}
                      </p>
                    </>
                  )}
                  <div className="flex items-center">
                    <span className="text-blue-400">❯</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCommand(e);
                        }
                      }}
                      className={`bg-transparent border-none ${
                        isDark
                          ? "text-gray-200 placeholder:text-gray-400"
                          : "text-gray-800 placeholder:text-gray-400"
                      } w-full focus:outline-none ml-2`}
                      placeholder="ask me anything about myself!"
                    />
                  </div>
                </div>
              </div>
            )}
            {expandWindow === "timer" && isTimerOpen && (
              <div
                className={`w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none ${windowThemeClass} rounded-xl flex flex-col overflow-y-auto overscroll-none`}
              >
                <p
                  className={`rounded-t-xl text-sm text-center sticky top-0 ${headerClass(
                    selectedWindow === "timer"
                  )}`}
                >
                  pomodoro timer - zsh
                  <button
                    className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2"
                    onClick={() => {
                      setExpandWindow("");
                      // setIsTimerOpen(false);
                    }}
                  />
                  <button
                    className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setExpandWindow("timer")}
                  />
                </p>
                <div className="flex-grow flex flex-col items-center justify-center p-8">
                  <div className="text-6xl font-mono mb-4">
                    {String(timerMinutes).padStart(2, "0")}:
                    {String(timerSeconds).padStart(2, "0")}
                  </div>
                  {/* <div className="text-lg text-gray-400 mb-6">
                    {timerMode === "work"
                      ? "Work Time"
                      : timerMode === "break"
                      ? "Short Break"
                      : "Long Break"}
                  </div> */}
                  <div className="text-sm text-gray-500 mb-8">
                    pomodoros completed: {pomodoroCount}/4
                  </div>

                  <div className="flex gap-4 mb-8">
                    <button
                      onClick={isTimerRunning ? pauseTimer : startTimer}
                      className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                        selectedExpandedTimerButton === 0 ? "font-bold" : ""
                      }`}
                    >
                      {isTimerRunning ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                      <span
                        className={
                          selectedExpandedTimerButton === 0
                            ? "font-bold underline"
                            : ""
                        }
                      >
                        {isTimerRunning ? "pause" : "start"}
                      </span>
                    </button>
                    <button
                      onClick={resetTimer}
                      className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                        selectedExpandedTimerButton === 1 ? "" : ""
                      }`}
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span
                        className={
                          selectedExpandedTimerButton === 1
                            ? "font-bold underline"
                            : ""
                        }
                      >
                        reset
                      </span>
                    </button>
                  </div>

                  <div className=" max-w-md">
                    <p className="text-sm text-gray-400 mb-4">
                      custom timer (minutes):
                    </p>
                    <div className="flex gap-2 mb-4">
                      {[5, 15, 30, 45, 60].map((minutes, index) => (
                        <button
                          key={minutes}
                          onClick={() => setCustomTimer(minutes)}
                          className={`px-3 py-2 rounded text-sm transition-colors ${
                            customMinutes === minutes
                              ? "font-bold text-blue-300"
                              : ""
                          } ${
                            selectedExpandedTimerButton === index + 2 ? "" : ""
                          }`}
                        >
                          <span
                            className={
                              selectedExpandedTimerButton === index + 2
                                ? "font-bold underline"
                                : ""
                            }
                          >
                            {minutes}m
                          </span>
                        </button>
                      ))}
                    </div>
                    {/* <input
                      type="number"
                      min="0"
                      max="120"
                      value={customMinutes}
                      onChange={(e) =>
                        setCustomTimer(parseInt(e.target.value) || 25)
                      }
                      className="w-full p-2 rounded text-center"
                      placeholder="Custom minutes"
                    /> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resume overlay window */}
      {isResumeOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsResumeOpen(false);
            }
          }}
        >
          <div
            className={`w-full lg:w-1/2 h-[70vh] max-w-4xl max-h-[90vh] ${overlayThemeClass} rounded-xl flex flex-col shadow-2xl`}
          >
            <div
              className={`rounded-t-xl text-sm text-center relative ${headerClass(
                true
              )}`}
            >
              daniel_nguyen_resume.pdf
              <button
                className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-red-600 transition-colors"
                onClick={() => setIsResumeOpen(false)}
              />
              <button
                className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                onClick={() => setIsResumeOpen(false)}
              />
              <button className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
            <a
              href="/daniel_nguyen_resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 mx-4 mt-4 underline"
            >
              click to view in new tab
            </a>
            <div className="flex-1 p-4 overflow-hidden">
              <iframe
                src="/daniel_nguyen_resume.pdf#view=FitH&zoom=page-fit"
                className="w-full h-full rounded-lg border border-gray-600"
                title="Daniel Nguyen Resume"
              />
            </div>
          </div>
        </div>
      )}

      {/* Media Player overlay window */}
      {isMediaPlayerOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsMediaPlayerOpen(false);
            }
          }}
        >
          <div
            className={`w-full h-[70vh] max-w-5xl max-h-[90vh] ${overlayThemeClass} rounded-xl flex flex-col shadow-2xl`}
          >
            <div
              className={`rounded-t-xl text-sm text-center relative ${headerClass(
                true
              )}`}
            >
              {videos[currentVideoIndex].title} - Media Player
              <button
                className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-red-600 transition-colors"
                onClick={() => setIsMediaPlayerOpen(false)}
              />
              <button
                className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2"
                onClick={() => setIsMediaPlayerOpen(false)}
              />
              <button className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              {/* Video Player */}
              <div className="flex-1 mb-4">
                <iframe
                  src={videos[currentVideoIndex].embedUrl}
                  className="w-full h-full rounded-lg border border-gray-600"
                  title={videos[currentVideoIndex].title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Controls */}
              <div className="rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() =>
                      setCurrentVideoIndex(
                        (prev) => (prev - 1 + videos.length) % videos.length
                      )
                    }
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    ← previous
                  </button>

                  {/* <div className="flex gap-2">
                    {videos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentVideoIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentVideoIndex
                            ? "bg-white"
                            : "bg-gray-500"
                        }`}
                      />
                    ))}
                  </div> */}
                  {/* <div className="text-xs text-gray-400 text-center">
                    use ← → arrow keys to switch videos, esc to close
                  </div> */}

                  <button
                    onClick={() =>
                      setCurrentVideoIndex((prev) => (prev + 1) % videos.length)
                    }
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Taskbar menu */}
      <Taskbar theme={theme} />
    </div>
  );
};

export default App;
