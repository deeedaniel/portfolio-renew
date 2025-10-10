import { Search } from "lucide-react";
import Tooltip from "./Tooltip";
import { Paperclip } from "lucide-react";

export const Taskbar = () => {
  return (
    <div className="hidden lg:flex w-2xl absolute items-center gap-2 border border-gray-700 bottom-2 bg-gray-950 p-1 rounded-xl justify-between px-4 shadow-xl">
      <p className="text-gray-200 bg-gray-800 p-1 px-3 rounded-lg flex items-center gap-2 border border-gray-700">
        <Search className="w-4 h-4 " />
        <p className="text-sm bg-gray-800 p-1 px-3">
          nguyendaniel1312@gmail.com
        </p>
      </p>
      <div className="flex justify-evenly gap-2 w-1/4">
        <Tooltip text="GitHub">
          <a
            href="https://github.com/deeedaniel"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="github_white.png"
              alt="GitHub"
              className="w-8 h-8 transition-all duration-300"
            />
          </a>
        </Tooltip>
        <Tooltip text="LinkedIn">
          <a
            href="https://www.linkedin.com/in/daniel-nguyenn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="linkedin_white.png"
              alt="LinkedIn"
              className="w-9 h-9  transition-all duration-300"
            />
          </a>
        </Tooltip>
        <Tooltip text="Resume">
          <a
            href="/daniel_nguyen_resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-700 rounded-full p-1 bg-white"
          >
            <Paperclip
              className="w-5 h-5  transition-all duration-300"
              color="black"
            />
          </a>
        </Tooltip>
      </div>
    </div>
  );
};

export default Taskbar;
