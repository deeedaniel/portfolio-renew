import React from "react";
import Tooltip from "./Tooltip";

interface SubmissionCalendarProps {
  submissionCalendar: {
    [timestamp: string]: number;
  };
  viewMode?: "week" | "month";
}

const LeetCodeCalendar: React.FC<SubmissionCalendarProps> = ({
  submissionCalendar,
  viewMode = "week",
}) => {
  const today = new Date();

  const getSubmissionCount = (date: Date) => {
    const calendarDay = date.getDate();
    const calendarMonth = date.getMonth();
    const calendarYear = date.getFullYear();

    const matchingTimestamp = Object.keys(submissionCalendar).find((ts) => {
      const submissionDate = new Date(parseInt(ts) * 1000);
      return (
        submissionDate.getFullYear() === calendarYear &&
        submissionDate.getMonth() === calendarMonth &&
        submissionDate.getDate() === calendarDay
      );
    });
    return matchingTimestamp ? submissionCalendar[matchingTimestamp] : 0;
  };

  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-700";
    if (count <= 2) return "bg-green-800";
    if (count <= 5) return "bg-green-600";
    if (count <= 10) return "bg-green-400";
    return "bg-green-200";
  };

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  if (viewMode === "month") {
    const year = today.getFullYear();
    const month = today.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const daysInMonth = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      daysInMonth.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const firstDayOfMonth = startDate.getDay();
    const monthName = today.toLocaleString("default", { month: "long" });

    return (
      <div className="flex flex-col items-center mt-4 w-full px-4">
        <p className="text-white text-sm mb-2 self-center">
          {monthName.toLowerCase()} {year}
        </p>
        <div className="grid grid-cols-7 gap-1 w-full text-center text-xs text-gray-400">
          {daysOfWeek.map((day, i) => (
            <div key={i}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-1 w-full">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          {daysInMonth.map((day, index) => {
            const count = getSubmissionCount(day);
            const color = getColor(count);
            return (
              <Tooltip
                key={index}
                text={`${count} submissions on ${day.toDateString()}`}
              >
                <div
                  className={`w-full aspect-square flex items-center justify-center rounded-sm ${color}`}
                >
                  <span className="text-white text-xs">{day.getDate()}</span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>
    );
  }

  // Default to weekly view
  const currentDayOfWeek = today.getDay(); // 0=Sunday, 6=Saturday
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - currentDayOfWeek); // Start of the week (Sunday)
  startDate.setHours(0, 0, 0, 0);

  const daysInWeek = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    daysInWeek.push(day);
  }

  return (
    <div className="flex flex-col items-center mt-4 w-full px-4">
      <p className="text-white text-sm mb-2 self-center">week's submissions</p>
      <div className="grid grid-cols-7 gap-2 w-full text-center">
        {daysInWeek.map((day, index) => {
          const count = getSubmissionCount(day);
          const color = getColor(count);
          return (
            <Tooltip
              key={index}
              text={`${count} submissions on ${day.toLocaleDateString()}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">
                  {daysOfWeek[index]}
                </span>
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-sm ${color}`}
                >
                  <span className="text-white text-xs">{day.getDate()}</span>
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default LeetCodeCalendar;
