import React, { useState, useEffect } from "react";
import Column from "../components/Column";
import TaskManager from "../components/TaskManager";
import { useTaskManager } from "../hooks/useTaskManager";
import { TaskManagerProvider } from "../context/TaskManagerContext";

const Wrapper = () => {
  return (
    <TaskManagerProvider>
      <div className="wrapper" style={{ marginTop: "15px" }}>
        <TaskManager />
        <Column />
      </div>
    </TaskManagerProvider>
  );
};
export default Wrapper;
