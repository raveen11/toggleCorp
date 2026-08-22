import React from "react";
import { TaskManagerProvider } from "../context/TaskManagerContext";
import ReactFlow from "../components/ReactFlow/ReactFlow";

const Wrapper = () => {
  return (
    <TaskManagerProvider>
      <div className="wrapper">
        <ReactFlow />
      </div>
    </TaskManagerProvider>
  );
};
export default Wrapper;
