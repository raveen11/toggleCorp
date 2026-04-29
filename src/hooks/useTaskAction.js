import { useEffect, useState,useRef } from "react";
import { useTaskManagerContext } from "../context/TaskManagerContext";
import { getRandomColor } from "../utils/helper";

export const useTaskAction = () => {
  const {
    columns,
    addTask,
    addColumn,
    onEditTask,
    onDeleteTask,
    onChangeColumn,
    handleSearch:onSearch,
    handleFilter:onFilter,
  } = useTaskManagerContext();

  const [newText, setNewText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterColumn, setFilterColumn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const SEARCH_DEBOUNCE_MS = 300;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isModalOpen) {
        if (event.key === "Escape") {
          closeAddModal();
        } else if (event.key === "Enter") {
          if (isModalOpen === "task") {
            handleAddTask();
          } else if (isModalOpen === "column") {
            handleAddColumn();
          }
        }
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (onSearch) onSearch(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleFilterSelect = (column) => {
    setFilterColumn(column);
    if (onFilter) onFilter(column);
  };

  const openAddModal = (type) => {

    setIsModalOpen(type);
    setNewText("");
    setNewTaskColumn(null);
  };

  const closeAddModal = () => {
    setIsModalOpen(false);
  };

  const handleAddTask = () => {
    if (!newText.trim()) return;
    if (addTask) {
      addTask(newText.trim());
    }
    setIsModalOpen(false);
  };

  const handleAddColumn = () => {
    if (!newText.trim()) return;
    const newColumn = {
      id: columns.length + 1,
      name: newText.trim(),
      bgColor: getRandomColor(),
    };
    if (addColumn) {
      addColumn(newColumn);
    }
    setIsModalOpen(false);
  };


  return {
    newText,
    setNewText,
    searchTerm,
    setSearchTerm,
    setFilterColumn,
    setIsModalOpen,
    setNewTaskColumn,
    inputRef,
    handleSearchChange,
    handleFilterSelect,
    openAddModal,
    closeAddModal,
    handleAddTask,
    handleAddColumn,
    isModalOpen,
  };
};
