import { Search, Paperclip, Mail, Timer } from "lucide-react";
import Tooltip from "./Tooltip";

export const Taskbar = () => {
  return (
    <div className="flex w-97/100 lg:w-full max-w-sm sm:max-w-md lg:max-w-2xl fixed items-center gap-2 border border-gray-700 bottom-2 bg-gray-950 p-2 py-1 lg:p-1 rounded-xl justify-between px-3 lg:px-4 shadow-xl mx-2 lg:mx-0">
      {/* Desktop: Search/Email display, Mobile: Mail button */}
      <div className="min-w-0 flex-shrink">
        {/* Desktop version - shows email with search icon */}
        <div className="hidden lg:flex text-gray-200 bg-gray-800 p-1 px-3 rounded-lg items-center gap-2 border border-gray-700">
          <Search className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm bg-gray-800 p-1 px-3">
            nguyendaniel1312@gmail.com
          </p>
        </div>

        {/* Mobile version - mail button */}
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
      </div>

      {/* Icons section - larger touch targets on mobile */}
      <div className="flex justify-evenly gap-3 lg:gap-2 flex-shrink-0">
        <Tooltip text="Pomodoro Timer">
          <button
            onClick={() => {
              // You'll need to pass these as props or use a context
              // For now, this will just be a placeholder
              window.dispatchEvent(new CustomEvent("openTimer"));
            }}
            className="p-1"
          >
            <Timer className="w-8 h-8 lg:w-6 lg:h-6 transition-all duration-300 bg-white rounded-full p-1.5 lg:p-1 cursor-pointer text-black" />
          </button>
        </Tooltip>

        <Tooltip text="GitHub">
          <a
            href="https://github.com/deeedaniel"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1"
          >
            <img
              src="github_white.png"
              alt="GitHub"
              className="w-10 h-10 lg:w-8 lg:h-8 transition-all duration-300 object-contain"
            />
          </a>
        </Tooltip>

        <Tooltip text="LinkedIn">
          <a
            href="https://www.linkedin.com/in/daniel-nguyenn/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1"
          >
            <img
              src="linkedin_white.png"
              alt="LinkedIn"
              className="w-11 h-11 lg:w-9 lg:h-9 transition-all duration-300 object-contain"
            />
          </a>
        </Tooltip>

        <Tooltip text="Resume">
          <a
            href="/daniel_nguyen_resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-700 rounded-full p-2 lg:p-1 bg-white"
          >
            <Paperclip
              className="w-6 h-6 lg:w-5 lg:h-5 transition-all duration-300 object-contain"
              color="black"
            />
          </a>
        </Tooltip>
      </div>
    </div>
  );
};

export default Taskbar;
