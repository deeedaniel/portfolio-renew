import React, { useState, useEffect, useRef } from "react";
import type { NowPlayingData, TopTracksData } from "./types/indexs";
import { experiencesData, projectsData, asciiList } from "./data/info";
import { Taskbar } from "./components/Taskbar";

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
    experienceIndex,
    projectIndex,
    selectProject,
    selectedLinkIndex,
    selectExperience,
    selectedExperienceLinkIndex,
  ]);

  // Reset selected link index when project changes
  useEffect(() => {
    setSelectedLinkIndex(0);
  }, [selectProject]);

  // Reset selected experience link index when experience changes
  useEffect(() => {
    setSelectedExperienceLinkIndex(0);
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

  // ask question to Gemini
  async function askQuestion(q: String) {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    });
    const j = await res.json();
    return j.answer;
  }

  // handle command input
  const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && command) {
      setLastCommand(command);
      // This is where you'll make your API call
      const answer = await askQuestion(command);
      setResponse(answer);
      setCommand("");
    }
  };

  useEffect(() => {
    if (selectedWindow === "cli") {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [selectedWindow]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // keyboard navigation between for windows using < and >
  const windowOrder = ["me", "experience", "projects", "music", "cli"];

  useEffect(() => {
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
  }, [selectedWindow, expandWindow]);

  return (
    <div className="lg:h-screen w-screen flex items-center justify-center bg-gray-800 text-white">
      {/* Bento box grid */}
      <div className="relative grid grid-cols-2 lg:grid-cols-3 w-full mx-1 gap-2 bg-gray-900 rounded-2xl p-1.5 border border-gray-700 max-w-5xl lg:justify-center shadow-xl">
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
              <p className="text-blue-300 text-sm lg:text-lg">
                daniel@MacbookPro
              </p>
              <p className=" ml-4 text-xs lg:text-sm">Full-Stack</p>
              <p className=" ml-4 text-xs lg:text-sm">CS @ SJSU</p>
              <p className=" ml-4 text-xs lg:text-sm">San Jose, CA</p>
              <p className=" ml-4 text-xs lg:text-sm">
                {time.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div
          className={` bg-black col-span-2 lg:col-span-1 border border-gray-700 rounded-xl ${
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
          className={` bg-black col-span-2 lg:col-span-1 border border-gray-700 rounded-xl ${
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
              <p>
                i'm not currently listening to music,
                <br />
                but feel free to visit my{" "}
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

        {/* CLI LLM about me */}
        <div
          className={` bg-black col-span-2 lg:col-span-3 border border-gray-700 rounded-xl ${
            expandWindow ? "opacity-0" : ""
          } transition-opacity duration-500 pb-3 overflow-y-auto`}
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
          <div className="mt-2 mx-4 font-mono text-sm" onClick={focusInput}>
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
                    setResponse("...");
                    setCommand("");
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
          <div className="absolute inset-0 z-20 transition-opacity duration-300">
            {expandWindow === "me" && (
              <div className="w-full h-full bg-black border border-gray-700 rounded-xl">
                <p className="text-black bg-gray-300 rounded-t-xl text-sm text-center relative">
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
                <div className="my-auto flex">
                  <p className="text-[4px] text-blue-100 font-mono whitespace-pre min-w-1/2 text-center">
                    {selectedAscii}
                  </p>
                  <div className="mx-auto  min-w-1/2 mt-2">
                    <p className="text-blue-300 text-sm">daniel@MacbookPro</p>
                    {/* <p className="ml-4">daniel's website</p> */}
                    <p className=" ml-4 text-xs">Full Stack</p>
                    <p className=" ml-4 text-xs">CS @ SJSU</p>
                    <p className=" ml-4 text-xs">San Jose, CA</p>
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
                                        ? "< "
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
                                    ? "< "
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
                  <div className="w-full h-full bg-black border border-gray-700 rounded-xl">
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
                  <div className="w-full min-h-full bg-black border border-gray-700 rounded-xl">
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
                                      {index === selectedLinkIndex ? "< " : ""}
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
                                    ? "< "
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
                  <div className="w-full h-full bg-black border border-gray-700 rounded-xl">
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
            {expandWindow === "music" && (
              <div className="w-full h-full bg-black border border-gray-700 rounded-xl">
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
                    <p>i'm not currently listening to music anymore!</p>
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
                    <p>i'm not currently listening to music anymore!</p>
                  )}
                </div>
              </div>
            )}
            {expandWindow === "cli" && (
              <div className="w-full h-full bg-black border border-gray-700 rounded-xl flex flex-col">
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
                          setResponse("...");
                          setCommand("");
                        }
                      }}
                      className="bg-transparent border-none text-gray-200 w-full focus:outline-none ml-2"
                      placeholder="ask me anything about myself!"
                    />
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
