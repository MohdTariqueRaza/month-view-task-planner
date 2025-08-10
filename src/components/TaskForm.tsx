import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

import type { Task } from "../types/types";
interface Range {
  start: Date | null;
  end: Date | null;
}

interface TaskFormProps {
  task?: Task | null;
  range?: Range | null;
  onSubmit: (taskData: Task) => void;
  onDelete: (id: string | number) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  range,
  onSubmit,
  onDelete,
  onCancel,
}) => {
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("To Do");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setCategory(task.category || "To Do");
      setStartDate(
        task.startDate
          ? new Date(task.startDate).toISOString().split("T")[0]
          : ""
      );
      setEndDate(
        task.endDate ? new Date(task.endDate).toISOString().split("T")[0] : ""
      );
      setDescription(task.description || "");
    } else if (range && range.start && range.end) {
      setStartDate(new Date(range.start).toISOString().split("T")[0]);
      setEndDate(new Date(range.end).toISOString().split("T")[0]);
    } else {
      const today = new Date();
      setStartDate(today.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    }
  }, [task, range]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log(task, "tsaks");
    e.preventDefault();
    onSubmit({
      id: String(task?.id),
      title,
      category,
      startDate,
      endDate,
      description,
    });
  };

  const categoryOptions = [
    { value: "To Do", color: "bg-blue-500" },
    { value: "In Progress", color: "bg-yellow-500" },
    { value: "Review", color: "bg-purple-500" },
    { value: "Completed", color: "bg-green-500" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Close task form"
          >
            <FiX className="h-5 w-5" />
          </button>

          <h2 className="text-xl font-bold mb-4">
            {task ? "Edit Task" : "Create New Task"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Task Title*
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category*
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCategory(option.value)}
                    className={`flex items-center justify-center p-3 rounded-md border ${
                      category === option.value
                        ? "ring-2 ring-indigo-500 border-indigo-500"
                        : "border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${option.color} mr-2`}
                    ></div>
                    <span className="text-sm">{option.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Date*
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Date*
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between">
              <div>
                {task && (
                  <button
                    type="button"
                    onClick={() => onDelete(task.id!)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="space-x-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {task ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
