import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";
import TaskBar from "./TaskBar";

import type { Task } from "../types/types";

interface SelectionRange {
  start: Date | null;
  end: Date | null;
}

interface CalendarProps {
  currentDate: Date;
  tasks: Task[];
  selectionRange: SelectionRange;
  onStartSelection: (date: Date) => void;
  onUpdateSelection: (date: Date) => void;
  onEndSelection: () => void;
  onTaskClick: (task: Task) => void;
  // onDragStart: (task: Task, e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (task: Task) => void;
  onDrop: (date: Date) => void;
  onResizeTask: (
    taskId: string,
    newStartDate: string,
    newEndDate: string
  ) => void;
  selectedTask?: Task | null;
  searchQuery?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  tasks,
  selectionRange,
  onStartSelection,
  onUpdateSelection,
  onEndSelection,
  onTaskClick,
  onDragStart,
  onDrop,
  onResizeTask,
  selectedTask,
  searchQuery,
}) => {
  const month = format(currentDate, "MMMM");
  const year = format(currentDate, "yyyy");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Group tasks by date string
  const tasksByDate: Record<
    string,
    (Task & { isStart: boolean; isEnd: boolean })[]
  > = {};

  tasks.forEach((task) => {
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    let current = new Date(start);

    while (current <= end) {
      const dateStr = current.toDateString();
      if (!tasksByDate[dateStr]) {
        tasksByDate[dateStr] = [];
      }
      tasksByDate[dateStr].push({
        ...task,
        isStart: isSameDay(current, start),
        isEnd: isSameDay(current, end),
      });
      current = addDays(current, 1);
    }
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleMouseDown = (date: Date) => {
    onStartSelection(date);
  };

  const handleMouseEnter = (date: Date) => {
    if (selectionRange.start) {
      onUpdateSelection(date);
    }
  };

  const handleMouseUp = () => {
    if (selectionRange.start && selectionRange.end) {
      onEndSelection();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 bg-indigo-600 text-white text-center">
        <h2 className="text-xl font-semibold">
          {month} {year}
        </h2>
        {searchQuery && (
          <div className="mt-2 text-sm">
            Showing tasks matching:{" "}
            <span className="font-semibold">"{searchQuery}"</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 bg-indigo-100 border-b border-indigo-200">
        {weekdays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-indigo-800"
          >
            {day}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7 bg-white"
        onMouseUp={handleMouseUp}
        onDragOver={handleDragOver}
      >
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);
          const dayTasks = tasksByDate[day.toDateString()] || [];

          const isSelected =
            selectionRange.start &&
            selectionRange.end &&
            day >=
              new Date(
                Math.min(
                  selectionRange.start.getTime(),
                  selectionRange.end.getTime()
                )
              ) &&
            day <=
              new Date(
                Math.max(
                  selectionRange.start.getTime(),
                  selectionRange.end.getTime()
                )
              );

          return (
            <div
              key={index}
              className={`min-h-24 border-r border-b p-1 relative ${
                index % 7 === 0 ? "border-l" : ""
              } ${
                !isCurrentMonth
                  ? "bg-gray-50"
                  : isDayToday
                  ? "bg-indigo-50"
                  : ""
              }`}
              onMouseDown={() => isCurrentMonth && handleMouseDown(day)}
              onMouseEnter={() => isCurrentMonth && handleMouseEnter(day)}
              onDrop={(e) => {
                e.preventDefault();
                if (isCurrentMonth) onDrop(day);
              }}
            >
              <div className="text-right">
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${
                    isDayToday
                      ? "bg-indigo-600 text-white"
                      : isSelected
                      ? "bg-indigo-200"
                      : isCurrentMonth
                      ? "text-gray-700"
                      : "text-gray-400"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                {dayTasks.map((task) => (
                  <TaskBar
                    key={`${task.id}-${day.toISOString()}`}
                    task={task}
                    // Wrap handlers to pass event along with task for correct types
                    onDragStart={() => onDragStart(task)}
                    onClick={() => onTaskClick(task)}
                    // onClick here expects only task, so event is optional (you can pass or not)
                    onResize={() => onResizeTask(String(task.id), "", "")}
                    isSelected={selectedTask?.id === task.id}
                    isStart={task.isStart}
                    isEnd={task.isEnd}
                  />
                ))}
              </div>

              {isSelected && (
                <div className="absolute inset-0 bg-indigo-100 opacity-50 pointer-events-none"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
