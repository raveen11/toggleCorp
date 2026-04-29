import { useState, useCallback, useEffect } from "react";
import { dummyColumns, getRandomColor } from "../utils/helper";

export const useTaskManager = () => {
  const [columns, setColumns] = useState(dummyColumns);

  useEffect(() => {
    const savedData = localStorage.getItem("columns");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const newColumns = parsedData.map((column) => ({
        ...column,
        tasks: column.tasks || [],
        bgColor: column.bgColor || getRandomColor(),
      }));
      setColumns(newColumns);
      localStorage.setItem("columns", JSON.stringify(newColumns));
    }
  }, []);

  const addTask = (newTask) => {
    if (newTask.trim() !== "") {
      const todoIndex = columns?.findIndex((column) => column.id === 1);
      const newColumns = [...columns];
      newColumns[todoIndex].tasks.push({
        id: Date.now(),
        text: newTask,
        columnId: 1,
      });
      setColumns(newColumns);
      localStorage.setItem("columns", JSON.stringify(newColumns));
    }
  };
  const addColumn = (column) => {
    if (column.name.trim() !== "") {
      const newColumns = [...columns];
      newColumns.push({ ...column, tasks: [], bgColor: getRandomColor() });
      setColumns(newColumns);
      localStorage.setItem("columns", JSON.stringify(newColumns));
    }
  };

  const onEditTask = (id, newText, colId) => {
    const columnIndex = columns?.findIndex((column) => column.id === colId);
    const newColumns = [...columns];
    const taskIndex = newColumns[columnIndex].tasks.findIndex(
      (task) => task.id === id,
    );
    newColumns[columnIndex].tasks[taskIndex] = {
      ...newColumns[columnIndex].tasks[taskIndex],
      text: newText,
    };
    setColumns(newColumns);
    localStorage.setItem("columns", JSON.stringify(newColumns));
  };
  const onDeleteTask = (id, colId) => {
    const columnIndex = columns?.findIndex((column) => column.id === colId);
    const newColumns = [...columns];
    newColumns[columnIndex].tasks = newColumns[columnIndex].tasks.filter(
      (task) => task.id !== id,
    );
    setColumns(newColumns);
    localStorage.setItem("columns", JSON.stringify(newColumns));
  };

  const onChangeColumn = (taskId, newColumnId, oldColumnId) => {
    const taskIndex = columns?.findIndex((column) => column.id === oldColumnId);
    const task = columns[taskIndex].tasks.find((task) => task.id === taskId);
    if (task) {
      const newColumns = [...columns];
      newColumns[taskIndex].tasks = newColumns[taskIndex].tasks.filter(
        (task) => task.id !== taskId,
      );
      const newColumnIndex = newColumns.findIndex(
        (column) => column.id === newColumnId,
      );
      newColumns[newColumnIndex].tasks.push({ ...task, columnId: newColumnId });
      setColumns(newColumns);
      localStorage.setItem("columns", JSON.stringify(newColumns));
    }
  };

  const handleSearch = (searchTerm) => {
    const query = String(searchTerm || "").toLowerCase();
    const savedData = localStorage.getItem("columns");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const newColumns = parsedData.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => {
          const textMatch = task.text.toLowerCase().includes(query);
          const idMatch = String(task.id).toLowerCase().includes(query);
          return textMatch || idMatch;
        }),
      }));
      setColumns(newColumns);
    }
  };

  const handleFilter = (filterColumn) => {
    const savedData = localStorage.getItem("columns");
    const parsedData = JSON.parse(savedData);
    if (parsedData && filterColumn?.id !== 0) {
      const newColumns = parsedData?.map((column) => ({
        ...column,
        tasks: column.id === filterColumn.id ? column.tasks : [],
      }));
      setColumns(newColumns);
    } else {
      setColumns(parsedData);
    }
  };
  return {
    columns,
    setColumns,
    addTask,
    addColumn,
    onEditTask,
    onDeleteTask,
    onChangeColumn,
    handleSearch,
    handleFilter,
  };
};
