import React, { use } from "react";
import TaskList from "./TaskList";
import { useTaskManagerContext } from "../context/TaskManagerContext";

export default function Column() {
 const {columns,onChangeColumn,onEditTask,onDeleteTask}=useTaskManagerContext();

  return (
    <div
      className="columns-container"
      style={{ display: "flex", gap: "20px", justifyContent: "space-between",flexWrap:"wrap" }}
    >
      {columns?.map((column) => (
        <div
          key={column.id}
          className="column"
          style={{
            flex: 1,
            height: "calc(100vh - 100px)",
            backgroundColor: column.bgColor,
            borderRadius: "8px",
            padding: "10px",
            overflowY: "auto",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px 0",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              color: "#333",
            }}
          >
            {column.name}
          </h2>
          <TaskList
            tasks={column.tasks}
            onChangeColumn={onChangeColumn}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            colId={column.id}
            columns={columns}
            column={column}
          />
        </div>
      ))}
    </div>
  );
}
