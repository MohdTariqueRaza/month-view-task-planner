import React from "react";
import { FiX } from "react-icons/fi";

interface FilterPanelProps {
  selectedCategory: string[];
  setSelectedCategory: (categories: string[]) => void;
  selectedTimeFilter: string | null;
  setSelectedTimeFilter: (value: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedTimeFilter,
  setSelectedTimeFilter,
  isOpen,
  onClose,
}) => {
  const categories = ["To Do", "In Progress", "Review", "Completed"];
  const timeFilters = [
    { value: "7", label: "Tasks within 1 week" },
    { value: "14", label: "Tasks within 2 weeks" },
    { value: "21", label: "Tasks within 3 weeks" },
  ];

  const toggleCategory = (category: string) => {
    if (selectedCategory.includes(category)) {
      setSelectedCategory(selectedCategory.filter((c) => c !== category));
    } else {
      setSelectedCategory([...selectedCategory, category]);
    }
  };

  return (
    <div
      className={`w-64 bg-white shadow-md p-4 fixed md:relative inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-indigo-700">Filters</h3>
        <button
          onClick={onClose}
          className="md:hidden text-gray-500 hover:text-gray-700"
          aria-label="Close filter panel"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2 text-gray-700">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedCategory.includes(category)}
                onChange={() => toggleCategory(category)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2 text-gray-700">Time Filter</h4>
        <div className="space-y-2">
          {timeFilters.map((filter) => (
            <label key={filter.value} className="flex items-center">
              <input
                type="radio"
                name="timeFilter"
                checked={selectedTimeFilter === filter.value}
                onChange={() => setSelectedTimeFilter(filter.value)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">{filter.label}</span>
            </label>
          ))}
          <label className="flex items-center">
            <input
              type="radio"
              name="timeFilter"
              checked={!selectedTimeFilter}
              onChange={() => setSelectedTimeFilter(null)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">All Tasks</span>
          </label>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500 p-2 bg-indigo-50 rounded-md">
        <p className="font-medium mb-1">Tip:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Drag across days to create a new task</li>
          <li>Drag tasks to move them</li>
          <li>Drag task edges to resize</li>
        </ul>
      </div>
    </div>
  );
};

export default FilterPanel;
