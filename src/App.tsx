import React, { useState, useEffect, useRef } from "react";
import type { NowPlayingData, TopTracksData } from "./types/indexs";
import { experiencesData, projectsData, asciiList } from "./data/info";
import { Taskbar } from "./components/Taskbar";
import { HeadphoneOff } from "lucide-react";
import { Play, Pause, RotateCcw } from "lucide-react";

const App = () => {
  const [time, setTime] = useState(new Date());

  // const [count, setCount] = useState(0);
  const [selectedAscii, setSelectedAscii] = useState(String); // picked ascii art
  const [expandWindow, setExpandWindow] = useState(String); // which window is expanded
  const [selectedWindow, setSelectedWindow] = useState("me"); // which window is selected

  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null); // now playing on spotify
  const [topTracks, setTopTracks] = useState<TopTracksData | null>(null); // top tracks on spotify

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

  // update time every second
  useEffect(() => {
    setInterval(() => {
      setTime(new Date());
    }, 1000);
  }, []);

  // handle keyboard navigation between list of exp & projs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    // keyboard navigation between for windows using < and >
    const windowOrder = isTimerOpen
      ? ["me", "experience", "projects", "music", "timer", "cli"]
      : ["me", "experience", "projects", "music", "cli"];

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
  }, [selectedWindow, expandWindow, isTimerOpen]);

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

  return (
    <div className="min-h-screen w-screen flex items-start justify-center bg-black text-white py-6 pb-24 lg:py-12 lg:pb-20 lg:bg-[url('/creation_of_adam.jpeg')] bg-fixed bg-cover bg-center overscroll-none">
      {/* Bento box grid */}
      <div className="relative grid grid-cols-2 lg:grid-cols-3 w-full mx-1 gap-2 bg-gray-900/40 bg-opacity-50 rounded-2xl p-1.5 border border-gray-700 max-w-5xl lg:justify-center shadow-xl">
        {/* Main terminal window */}
        <div
          className={` bg-black/80 rounded-xl col-span-2 flex border border-gray-700 flex-col ${
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
              <p className="text-blue-300 text-sm lg:text-lg">
                daniel@MacbookPro
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
                <p className="inline-block text-lg">☆</p> try using arrow keys &
                enter to navigate!
              </p>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div
          className={`bg-black/80 col-span-2 lg:col-span-1 border border-gray-700 rounded-xl ${
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
            <p className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer" />
            <p className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer" />
            <p
              className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setExpandWindow("experience")}
            />
          </p>
          <div className="my-2 mx-4">
            {experiencesData.map((experience, index) => (
              <div
                key={index}
                className={`rounded-md text-sm lg:text-base transition-all duration-150 cursor-pointer my-2 lg:my-1 ${
                  index === experienceIndex
                    ? " text-white font-bold"
                    : "bg-transparent text-blue-300"
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
          className={` bg-black/80 col-span-2 lg:col-span-1 border border-gray-700 rounded-xl ${
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
            <p className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer" />
            <p className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer" />
            <p
              className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setExpandWindow("projects")}
            />
          </p>
          <div className="mt-2 mx-4">
            {projectsData.map((project, index) => (
              <div
                key={index}
                className={` rounded-md text-sm lg:text-base transition-all duration-150 cursor-pointer my-2 lg:my-1 ${
                  index === projectIndex
                    ? " text-white font-bold"
                    : "bg-transparent text-blue-300"
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

        {/* Music */}
        <div
          className={` bg-black/80 ${
            isTimerOpen
              ? "col-span-2 lg:col-span-1"
              : "col-span-2 lg:col-span-2"
          } border border-gray-700 rounded-xl ${
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
            <p className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer" />
            <p className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer" />
            <p
              className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
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
                  <HeadphoneOff className="w-16 h-16 p-3 rounded-md mr-4 bg-gray-800" />
                  <div>
                    <p className="text-xs lg:text-sm font-medium">
                      i'm not currently listening to music {"("}or my spotify
                      api has been rate-limited ˙◠˙{")"}.
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
              <div className="flex flex-col mb-3">
                <p className="text-sm text-gray-200 mt-4">Top Tracks</p>
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
              <p className="text-sm text-gray-200 mt-4">
                fetching top tracks...
              </p>
            )}
          </div>
        </div>

        {/* Timer - only render when open */}
        {isTimerOpen && (
          <div
            className={` bg-black/80 col-span-2 lg:col-span-1 border border-gray-700 rounded-xl ${
              expandWindow ? "opacity-0" : ""
            } transition-opacity duration-500`}
            onClick={() => {
              setSelectedWindow("timer");
              console.log(selectedWindow);
            }}
          >
            <p
              className={`text-black rounded-t-xl text-sm text-center relative ${
                selectedWindow === "timer" ? "bg-white" : "bg-gray-400"
              }`}
            >
              pomodoro timer - zsh
              <p
                className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setIsTimerOpen(false)}
              />
              <p className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer" />
              <p
                className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setExpandWindow("timer")}
              />
            </p>
            <div className="mt-2 mx-4 flex flex-col items-center justify-center h-48">
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

        {/* CLI LLM about me */}
        <div
          className={`bg-black/80 col-span-2 lg:col-span-3 border border-gray-700 rounded-xl ${
            expandWindow ? "opacity-0" : ""
          } transition-opacity duration-500 pb-3 flex flex-col max-h-56`}
          onClick={() => {
            setSelectedWindow("cli");
            focusInput();
          }}
        >
          <p
            className={`text-black rounded-t-xl text-sm text-center relative top-0 ${
              selectedWindow === "cli" ? "bg-white" : "bg-gray-400"
            }`}
          >
            daniel-code - zsh
            <p
              className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setExpandWindow("")}
            />
            <p
              className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setExpandWindow("")}
            />
            <p
              className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setExpandWindow("cli")}
            />
          </p>
          <div
            className="mt-2 ml-4 font-mono text-sm flex-grow overflow-y-auto"
            onClick={focusInput}
          >
            {lastCommand && (
              <>
                <div className="flex items-center">
                  <span className="text-blue-400">❯</span>
                  <p className="ml-2 text-gray-200">{lastCommand}</p>
                </div>
                <p className="text-gray-200 whitespace-pre-wrap">{response}</p>
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
                className="bg-transparent border-none text-gray-200 w-full focus:outline-none ml-2"
                placeholder="ask me anything about myself!"
              />
            </div>
          </div>
        </div>

        {/* Expanded overlay when user clicks */}
        {expandWindow && (
          <div className="lg:absolute lg:inset-0 fixed inset-0 z-20 transition-opacity duration-300 lg:h-full h-screen max-h-screen overflow-y-auto flex items-center justify-center lg:items-stretch lg:justify-stretch">
            {expandWindow === "me" && (
              <div
                ref={meWindowRef}
                className="w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none bg-black/80 border border-gray-700 rounded-xl overflow-y-auto focus:outline-none relative"
                tabIndex={0}
              >
                <p className="text-black bg-gray-300 rounded-t-xl text-sm text-center sticky top-0 left-0 right-0">
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
                  <p className="text-[4px] text-blue-100 font-mono whitespace-pre min-w-1/2 text-center">
                    {selectedAscii}
                  </p>
                  <div className="mx-auto  min-w-1/2 mt-2">
                    <p className="text-blue-300 text-sm lg:text-lg">
                      daniel@MacbookPro
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
                      <p className="inline-block text-lg">☆</p> try using arrow
                      keys & enter to navigate!
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-5 max-w-2xl mx-auto mt-4 mb-10 px-4 ">
                  <p className="text-gray-200">Hello!</p>
                  <p className="text-gray-200">
                    Welcome to my portfolio, I hope you like it!
                  </p>
                  <p className="text-gray-200">
                    Back in high school, I took AP Computer Science for fun. I
                    thought it was a really fun class, so when applying to
                    colleges, I picked Computer Science as my major not really
                    knowing what it was about. Since then, I have really fell in
                    love with coding.
                  </p>
                  <p className="text-gray-200">
                    I'm currently in my third year at SJSU, and I'm expected to
                    graduate in May 2027. I'm also working part-time as a
                    full-stack developer at TwinMind.
                  </p>
                  <p className="text-gray-200">
                    Outside of school, I like to film & edit videos, playing
                    basketball, watching movies/shows/anime, and listening to
                    music.
                  </p>
                  <p className="text-gray-200">
                    I'm currently focused on improving my engineering skills and
                    searching for Summer 2026 internships.
                  </p>
                  <p className="text-gray-200">✉︎ nguyendaniel1312@gmail.com</p>
                </div>
              </div>
            )}
            {expandWindow === "experience" && (
              <>
                {selectExperience !== "" ? (
                  <div className="w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none bg-black/80 border border-gray-700 rounded-xl overflow-y-auto">
                    <p
                      className={`text-black rounded-t-xl text-sm text-center relative ${
                        selectedWindow === "experience"
                          ? "bg-white"
                          : "bg-gray-400"
                      }`}
                    >
                      {selectExperience}
                      <p
                        className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setExpandWindow("")}
                      />
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
                                className="w-full h-48 object-cover rounded-lg mb-4 max-w-2xl mx-auto"
                              />
                              <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
                                {selectedExperienceData.date}
                              </p>
                              <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
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
                                      className={`inline-block text-white rounded transition-all duration-150 ${
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
                  <div className="w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none bg-black/80 border border-gray-700 rounded-xl overflow-y-auto">
                    <p
                      className={`text-black rounded-t-xl text-sm text-center relative ${
                        selectedWindow === "experience"
                          ? "bg-white"
                          : "bg-gray-400"
                      }`}
                    >
                      experience - zsh
                      <p
                        className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setExpandWindow("")}
                      />
                      <p
                        className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setExpandWindow("")}
                      />
                      <p className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer" />
                    </p>
                    <div className="mt-2 mx-4">
                      {experiencesData.map((experience, index) => (
                        <div
                          key={index}
                          className={` rounded-md transition-all duration-150 cursor-pointer ${
                            index === experienceIndex
                              ? " text-white font-bold"
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
                  <div className="w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none bg-black/80 border border-gray-700 rounded-xl overflow-y-auto">
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
                      <p
                        className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setExpandWindow("")}
                      />
                      <p
                        className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => {
                          setExpandWindow("");
                          setSelectProject("");
                        }}
                      />
                      <p
                        className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
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
                              <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
                                {selectedProjectData.date}
                              </p>
                              <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
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
                                      className={`inline-block text-white rounded transition-all duration-150 ${
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
                  <div className="w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none bg-black/80 border border-gray-700 rounded-xl overflow-y-auto">
                    <p
                      className={`text-black rounded-t-xl text-sm text-center relative ${
                        selectedWindow === "projects"
                          ? "bg-white"
                          : "bg-gray-400"
                      }`}
                    >
                      projects - zsh
                      <p
                        className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setExpandWindow("")}
                      />
                      <p
                        className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setExpandWindow("")}
                      />
                      <p
                        className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setExpandWindow("projects")}
                      />
                    </p>
                    <div className="mt-2 mx-4">
                      {projectsData.map((project, index) => (
                        <div
                          key={index}
                          className={` rounded-md transition-all duration-150 cursor-pointer ${
                            index === projectIndex
                              ? " text-white font-bold"
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
              <div className="w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none bg-black/80 border border-gray-700 rounded-xl overflow-y-auto">
                <p
                  className={`text-black rounded-t-xl text-sm text-center relative ${
                    selectedWindow === "music" ? "bg-white" : "bg-gray-400"
                  }`}
                >
                  music - zsh
                  <button
                    className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
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
                        <HeadphoneOff className="w-16 h-16 p-3 rounded-md mr-4 bg-gray-800" />
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
                      <p className="text-sm text-gray-200 mt-4">Top Tracks</p>
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
            {expandWindow === "cli" && (
              <div className="w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none bg-black/80 border border-gray-700 rounded-xl flex flex-col overflow-y-auto">
                <p
                  className={`text-black rounded-t-xl text-sm text-center relative ${
                    selectedWindow === "cli" ? "bg-white" : "bg-gray-400"
                  }`}
                >
                  daniel-code - zsh
                  <button
                    className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
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
                        <p className="ml-2 text-gray-200">{lastCommand}</p>
                      </div>
                      <p className="text-gray-200 whitespace-pre-wrap">
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
                      className="bg-transparent border-none text-gray-200 w-full focus:outline-none ml-2"
                      placeholder="ask me anything about myself!"
                    />
                  </div>
                </div>
              </div>
            )}
            {expandWindow === "timer" && isTimerOpen && (
              <div className="w-full h-full lg:w-full lg:h-full max-w-4xl max-h-[90vh] lg:max-w-none lg:max-h-none bg-black/80 border border-gray-700 rounded-xl flex flex-col overflow-y-auto">
                <p
                  className={`text-black rounded-t-xl text-sm text-center relative ${
                    selectedWindow === "timer" ? "bg-white" : "bg-gray-400"
                  }`}
                >
                  pomodoro timer - zsh
                  <button
                    className="rounded-full p-1 bg-red-500 absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => {
                      setExpandWindow("");
                      // setIsTimerOpen(false);
                    }}
                  />
                  <button
                    className="rounded-full p-1 bg-yellow-500 absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setExpandWindow("")}
                  />
                  <button
                    className="rounded-full p-1 bg-green-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
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

      {/* Taskbar menu */}
      <Taskbar />
    </div>
  );
};

export default App;
