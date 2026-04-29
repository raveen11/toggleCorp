import { createContext, useContext } from "react";
import { useTaskManager } from "../hooks/useTaskManager";

const TaskManagerContext = createContext();
export const TaskManagerProvider = ({ children }) => {
 
  const {
    columns,
    setColumns,
    addTask,
    addColumn,
    onEditTask,
    onDeleteTask,
    onChangeColumn,
    handleSearch,
    handleFilter,
  } = useTaskManager();

  return (
    <TaskManagerContext.Provider value={{
      columns,
      setColumns,
      addTask,
      addColumn,
      onEditTask,
      onDeleteTask,
      onChangeColumn,
      handleSearch,
      handleFilter,
    }}>
      {children}
    </TaskManagerContext.Provider>
  );
};

export const useTaskManagerContext = () => useContext(TaskManagerContext);