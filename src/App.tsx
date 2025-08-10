import { useState, useEffect } from "react";
import Calendar from "./components/Calendar";
import TaskForm from "./components/TaskForm";
import FilterPanel from "./components/FilterPanel";
import { FiMenu } from "react-icons/fi";
import type { Task } from "./types/types";

interface SelectionRange {
  start: Date | null;
  end: Date | null;
}

// Create date without time components in local timezone
const createLocalDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// Format date to YYYY-MM-DD for consistent storage
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Parse formatted date string to local date
const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

function App() {
  const [currentDate, setCurrentDate] = useState<Date>(
    createLocalDate(new Date())
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    start: null,
    end: null,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("tasks");
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        const tasksWithDates = parsedTasks.map((task: Task) => ({
          ...task,
          startDate: formatDateString(new Date(task.startDate)),
          endDate: formatDateString(new Date(task.endDate)),
        }));
        setTasks(tasksWithDates);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleDragStart = (task: Task) => {
    setDraggedTaskId(task.id);
  };

  const handleDrop = (date: Date) => {
    if (draggedTaskId) {
      const draggedTask = tasks.find((t) => t.id === draggedTaskId);
      if (draggedTask) {
        const dropDate = createLocalDate(date);
        const originalStart = parseDateString(draggedTask.startDate);

        // Calculate day difference
        const diffInDays = Math.round(
          (dropDate.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Calculate new dates
        const newStart = new Date(originalStart);
        newStart.setDate(originalStart.getDate() + diffInDays);

        const originalEnd = parseDateString(draggedTask.endDate);
        const duration = Math.round(
          (originalEnd.getTime() - originalStart.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const newEnd = new Date(newStart);
        newEnd.setDate(newStart.getDate() + duration);

        // Update task
        const updatedTasks = tasks.map((task) =>
          task.id === draggedTaskId
            ? {
                ...task,
                startDate: formatDateString(newStart),
                endDate: formatDateString(newEnd),
              }
            : task
        );

        setTasks(updatedTasks);
      }
      setDraggedTaskId(null);
    }
  };

  const handleResizeTask = (
    taskId: string,
    newStartDate: string,
    newEndDate: string
  ) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              startDate: newStartDate,
              endDate: newEndDate,
            }
          : task
      )
    );
  };

  const handleTaskSubmit = (task: Task) => {
    if (task.id && task.id !== "undefined") {
      // Update existing task
      const updatedTask = {
        ...task,
        startDate: formatDateString(new Date(task.startDate)),
        endDate: formatDateString(new Date(task.endDate)),
      };

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === task.id ? updatedTask : t))
      );
      setSelectedTask(updatedTask);
    } else {
      // Create new task
      const start = selectionRange.start
        ? createLocalDate(selectionRange.start)
        : createLocalDate(new Date());
      const end = selectionRange.end
        ? createLocalDate(selectionRange.end)
        : start;

      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        category: task.category || "Uncategorized",
        startDate: formatDateString(start),
        endDate: formatDateString(end),
      };

      setTasks((prevTasks) => [...prevTasks, newTask]);
      setSelectedTask(newTask);

      // Reset filters and search
      setSelectedTimeFilter(null);
      setSearchQuery("");
      setSelectedCategory([]);

      // Set calendar view to task's start date
      setCurrentDate(start);
    }
    setShowTaskForm(false);
    setSelectionRange({ start: null, end: null });
  };

  const handleDeleteTask = (taskId: string | number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    setSelectedTask(null);
    setShowTaskForm(false);
  };

  const startSelection = (date: Date) => {
    const normalized = createLocalDate(date);
    setSelectionRange({ start: normalized, end: normalized });
  };

  const updateSelection = (date: Date) => {
    if (selectionRange.start) {
      setSelectionRange((prev) => ({
        start: prev.start,
        end: createLocalDate(date),
      }));
    }
  };

  const endSelection = () => {
    if (selectionRange.start && selectionRange.end) {
      let start = createLocalDate(selectionRange.start);
      let end = createLocalDate(selectionRange.end);

      // Ensure start is before end
      if (start > end) {
        [start, end] = [end, start];
      }

      setSelectedTask(null);
      setShowTaskForm(true);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskForm(true);
  };

  const filteredTasks = tasks.filter((task) => {
    const taskStart = parseDateString(task.startDate);
    const taskEnd = parseDateString(task.endDate);
    const today = createLocalDate(new Date());

    // Category filter
    if (
      selectedCategory.length > 0 &&
      !selectedCategory.includes(task.category || "Uncategorized")
    ) {
      return false;
    }

    // Time filter
    if (selectedTimeFilter) {
      const days = parseInt(selectedTimeFilter);
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + days);

      return taskStart <= futureDate && taskEnd >= today;
    }

    // Search filter
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden mr-3 p-2 rounded-md hover:bg-indigo-700 focus:outline-none"
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold">Task Planner</h1>
            </div>
            <div className="mt-2 flex md:mt-0 space-x-2">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 rounded border border-gray-300 text-black shadow-sm
             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
             placeholder-gray-400"
              />

              <button
                onClick={prevMonth}
                className="px-3 py-1 bg-indigo-700 rounded-md hover:bg-indigo-800 focus:outline-none"
              >
                &larr; Prev
              </button>
              <button
                onClick={() => setCurrentDate(createLocalDate(new Date()))}
                className="px-3 py-1 bg-indigo-700 rounded-md hover:bg-indigo-800 focus:outline-none"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="px-3 py-1 bg-indigo-700 rounded-md hover:bg-indigo-800 focus:outline-none"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <FilterPanel
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedTimeFilter={selectedTimeFilter}
          setSelectedTimeFilter={setSelectedTimeFilter}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-auto p-4">
          <Calendar
            currentDate={currentDate}
            tasks={filteredTasks.map((task) => ({
              ...task,
              startDate: parseDateString(task.startDate).toISOString(),
              endDate: parseDateString(task.endDate).toISOString(),
            }))}
            selectionRange={selectionRange}
            onStartSelection={startSelection}
            onUpdateSelection={updateSelection}
            onEndSelection={endSelection}
            onTaskClick={handleTaskClick}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onResizeTask={handleResizeTask}
            selectedTask={selectedTask}
            searchQuery={searchQuery}
          />
        </main>
      </div>

      {showTaskForm && (
        <TaskForm
          task={selectedTask}
          range={selectionRange}
          onSubmit={handleTaskSubmit}
          onDelete={handleDeleteTask}
          onCancel={() => {
            setShowTaskForm(false);
            setSelectedTask(null);
            setSelectionRange({ start: null, end: null });
          }}
        />
      )}
    </div>
  );
}

export default App;
