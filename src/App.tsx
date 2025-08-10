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

function App() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const [tasks, setTasks] = useState<Task[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    start: null,
    end: null,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("tasks");
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Handle drag start
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  // Handle drop on a date
  const handleDrop = (date: Date) => {
    if (draggedTask) {
      const originalStart = new Date(draggedTask.startDate);
      const dropDate = new Date(date);

      // Calculate difference in days
      const diffInDays = Math.round(
        (dropDate.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      const originalEnd = new Date(draggedTask.endDate);
      const newStart = new Date(originalStart);
      newStart.setDate(originalStart.getDate() + diffInDays);

      const newEnd = new Date(originalEnd);
      newEnd.setDate(originalEnd.getDate() + diffInDays);

      const updatedTasks = tasks.map((task) =>
        task.id === draggedTask.id
          ? {
              ...task,
              startDate: newStart.toISOString(),
              endDate: newEnd.toISOString(),
            }
          : task
      );
      setTasks(updatedTasks);
      setDraggedTask(null);
    }
  };

  // Handle task resize
  const handleResizeTask = (
    taskId: string,
    newStartDate: string,
    newEndDate: string
  ) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, startDate: newStartDate, endDate: newEndDate }
          : task
      )
    );
  };

  // Add or update a task
  const handleTaskSubmit = (task: Task) => {
    if (task.id) {
      // Update existing task
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    } else {
      // Add new task
      const newTask = {
        ...task,
        id: Date.now().toString(),
      };
      setTasks([...tasks, newTask]);
    }
    setShowTaskForm(false);
    setSelectedTask(null);
    setSelectionRange({ start: null, end: null });
  };

  // Delete a task
  const handleDeleteTask = (taskId: string | number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    setSelectedTask(null);
    setShowTaskForm(false);
  };

  // Start selection range
  const startSelection = (date: Date) => {
    setSelectionRange({ start: date, end: date });
  };

  // Update selection range
  const updateSelection = (date: Date) => {
    if (selectionRange.start) {
      setSelectionRange((prev) => ({
        start: prev.start,
        end: date,
      }));
    }
  };

  // End selection and open form
  const endSelection = () => {
    if (selectionRange.start && selectionRange.end) {
      // Ensure start is before end
      const start = new Date(selectionRange.start);
      const end = new Date(selectionRange.end);

      if (start > end) {
        setSelectionRange({ start: end, end: start });
      }

      setShowTaskForm(true);
    }
  };

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter((task) => {
    // Category filter
    if (
      selectedCategory.length > 0 &&
      !selectedCategory.includes(task.category)
    ) {
      return false;
    }

    // Time filter
    if (selectedTimeFilter) {
      const today = new Date();
      const days = parseInt(selectedTimeFilter);
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);

      // Check if task overlaps with the filter period
      return taskStart <= futureDate && taskEnd >= today;
    }

    // Search filter
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Navigate to previous month
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
                className="px-3 py-2 rounded border border-gray-300 text-white shadow-sm
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
                onClick={() => setCurrentDate(new Date())}
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
            tasks={filteredTasks}
            selectionRange={selectionRange}
            onStartSelection={startSelection}
            onUpdateSelection={updateSelection}
            onEndSelection={endSelection}
            onTaskClick={setSelectedTask}
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
