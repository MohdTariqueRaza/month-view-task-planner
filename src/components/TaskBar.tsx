import React, { useState } from "react";

interface Task {
  id: string | number;
  title: string;
  category: string;
  // add other task properties as needed
  [key: string]: unknown;
}

interface TaskBarProps {
  task: Task;
  onDragStart: (task: Task, event: React.DragEvent<HTMLDivElement>) => void;
  onClick: (task: Task) => void;
  onResize: (task: Task, edge: "left" | "right") => void;
  isSelected: boolean;
  isStart: boolean;
  isEnd: boolean;
}

const TaskBar: React.FC<TaskBarProps> = ({
  task,
  onDragStart,
  onClick,
  onResize,
  isSelected,
  isStart,
  isEnd,
}) => {
  const [resizing, setResizing] = useState<"left" | "right" | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onDragStart(task, e);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClick(task);
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    edge: "left" | "right"
  ) => {
    e.stopPropagation();
    setResizing(edge);
  };

  const handleMouseUp = () => {
    if (resizing) {
      onResize(task, resizing);
      setResizing(null);
    }
  };

  const handleMouseMove = () => {
    if (!resizing) return;

    const action = resizing === "left" ? "Start" : "End";
    alert(`Resizing task ${action} date`);
  };

  const getCategoryColor = (): string => {
    switch (task.category) {
      case "To Do":
        return "bg-blue-500";
      case "In Progress":
        return "bg-yellow-500";
      case "Review":
        return "bg-purple-500";
      case "Completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const colorClass = getCategoryColor();

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={`relative cursor-pointer rounded px-2 py-1 text-xs truncate text-white ${colorClass} ${
        isSelected ? "ring-2 ring-white ring-opacity-70" : ""
      }`}
      title={`${task.title} (${task.category})`}
    >
      {isStart && (
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize"
          onMouseDown={(e) => handleMouseDown(e, "left")}
        />
      )}

      <div className="truncate">{task.title}</div>

      {isEnd && (
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize"
          onMouseDown={(e) => handleMouseDown(e, "right")}
        />
      )}
    </div>
  );
};

export default TaskBar;
