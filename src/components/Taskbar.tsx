import {
  FileUser,
  Timer,
  Linkedin,
  Github,
  Film,
  Sun,
  Moon,
} from "lucide-react";
import Tooltip from "./Tooltip";

export const Taskbar = ({ theme }: { theme: "dark" | "light" }) => {
  return (
    <div
      className={
        "flex w-fit max-w-sm sm:max-w-md lg:w-fit fixed items-center gap-2 bottom-2 p-2 py-2 lg:py-1 rounded-xl justify-between px-3 lg:p-2 shadow-xl mx-2 lg:mx-0 z-50 " +
        (theme === "dark"
          ? "border border-gray-700 bg-gray-950"
          : "border border-gray-300 bg-white")
      }
    >
      {/* <div className="min-w-0 flex-shrink">
        
        <div className="hidden lg:flex text-gray-200 bg-gray-800 p-1 px-3 rounded-lg items-center gap-2 border border-gray-700">
          <Search className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm bg-gray-800 p-1 px-3">
            nguyendaniel1312@gmail.com
          </p>
        </div>

       
        <div className="lg:hidden">
          <Tooltip text="Send Email">
            <a
              href="mailto:nguyendaniel1312@gmail.com"
              className="text-gray-200 bg-gray-800 p-2 rounded-lg flex items-center justify-center border border-gray-700 transition-all duration-300 hover:bg-gray-700"
            >
              <Mail className="w-6 h-6" />
            </a>
          </Tooltip>
        </div>
      </div> */}

      {/* Icons section - larger touch targets on mobile */}
      <div className="flex gap-3 lg:gap-2 w-full justify-center">
        <Tooltip text="Media Player">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("openMedia"));
            }}
            className={
              "border rounded-lg p-1 " +
              (theme === "dark"
                ? "border-gray-700 bg-gray-900"
                : "border-gray-300 bg-white")
            }
          >
            <Film
              className="w-7 h-7 object-contain"
              color={theme === "dark" ? "white" : "black"}
            />
          </button>
        </Tooltip>
        <Tooltip text="Pomodoro Timer">
          <button
            onClick={() => {
              // You'll need to pass these as props or use a context
              // For now, this will just be a placeholder
              window.dispatchEvent(new CustomEvent("openTimer"));
            }}
            className={
              "border rounded-lg p-1 " +
              (theme === "dark"
                ? "border-gray-700 bg-gray-900"
                : "border-gray-300 bg-white")
            }
          >
            <Timer
              className="w-7 h-7 object-contain"
              color={theme === "dark" ? "white" : "black"}
            />
          </button>
        </Tooltip>

        <Tooltip text="GitHub">
          <a
            href="https://github.com/deeedaniel"
            target="_blank"
            rel="noopener noreferrer"
            className={
              "border rounded-lg p-1 " +
              (theme === "dark"
                ? "border-gray-700 bg-gray-900"
                : "border-gray-300 bg-white")
            }
          >
            <Github
              className="w-7 h-7 object-contain"
              color={theme === "dark" ? "white" : "black"}
            />
          </a>
        </Tooltip>

        <Tooltip text="LinkedIn">
          <a
            href="https://www.linkedin.com/in/daniel-nguyenn/"
            target="_blank"
            rel="noopener noreferrer"
            className={
              "border rounded-lg p-1 " +
              (theme === "dark"
                ? "border-gray-700 bg-gray-900"
                : "border-gray-300 bg-white")
            }
          >
            <Linkedin
              className="w-7 h-7 object-contain"
              color={theme === "dark" ? "white" : "black"}
            />
          </a>
        </Tooltip>

        <Tooltip text="Resume">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("openResume"));
            }}
            className={
              "border rounded-lg p-1 " +
              (theme === "dark"
                ? "border-gray-700 bg-gray-900"
                : "border-gray-300 bg-white")
            }
          >
            <FileUser
              className="w-7 h-7 object-contain"
              color={theme === "dark" ? "white" : "black"}
            />
          </button>
        </Tooltip>
        <div className="border border-gray-300 rounded-full" />
        <Tooltip text={theme === "dark" ? "Light Mode" : "Dark Mode"}>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("toggleTheme"));
            }}
            className={
              "border rounded-lg p-1 " +
              (theme === "dark" ? "border-gray-700" : "border-gray-300 ")
            }
          >
            {theme === "dark" ? (
              <Sun
                className="w-7 h-7 object-contain"
                color={theme === "dark" ? "white" : "black"}
              />
            ) : (
              <Moon className="w-7 h-7 object-contain" color="black" />
            )}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default Taskbar;
