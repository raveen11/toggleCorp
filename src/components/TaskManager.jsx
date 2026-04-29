import React, { useState, useEffect, useRef } from "react";
import { ColumnDropdown } from "./ColumnDropdown";
import { dummyColumns, getRandomColor } from "../utils/helper";
import { useTaskManagerContext } from "../context/TaskManagerContext";
import { useTaskAction } from "../hooks/useTaskAction";

const TaskManager = () => {
  const { columns = dummyColumns } = useTaskManagerContext();
  const {
    searchTerm,
    handleSearchChange,
    handleFilterSelect,
    filterColumn,
    openAddModal,
    isModalOpen,
    closeAddModal,
    inputRef,
    setNewText,
    handleAddColumn,
    handleAddTask,
    newText,
  } = useTaskAction();


  return (
    <div className="taskmanager-panel">
      <div className="taskmanager-bar">
        <div className="search-field">
          <input
            className="search-input"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search tasks..."
          />
        </div>

        <div className="filter-field">
          <ColumnDropdown
            columns={[{ id: 0, name: "All" }, ...columns]}
            onSelect={handleFilterSelect}
            placeholder={filterColumn?.name || "Filter by status"}
          />
        </div>

        <button className="add-task-btn" onClick={() => openAddModal("task")}>
          + Add Task
        </button>
        <button className="add-task-btn" onClick={() => openAddModal("column")}>
          + Add Column
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeAddModal}>
          <div
            className="modal-box"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                {isModalOpen === "task" ? "Add New Task" : "Add New Column"}
              </div>
              <button className="modal-close" onClick={closeAddModal}>
                ✕
              </button>
            </div>

            <div className="modal-content">
              <label>
                <input
                  ref={inputRef}
                  className="modal-input"
                  type="text"
                  value={newText}
                  onChange={(event) => setNewText(event.target.value)}
                  placeholder={
                    isModalOpen === "task"
                      ? "Enter task name"
                      : "Enter column name"
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newText.trim()) {
                      if (isModalOpen === "task") {
                        handleAddTask();
                      } else if (isModalOpen === "column") {
                        handleAddColumn();
                      }
                    }
                  }}
                />
              </label>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={closeAddModal}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    closeAddModal();
                  }
                }}
              >
                Cancel
              </button>
              <button
                className="modal-btn save"
                onClick={() =>
                  isModalOpen === "task" ? handleAddTask() : handleAddColumn()
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (isModalOpen === "task") {
                      handleAddTask();
                    } else if (isModalOpen === "column") {
                      handleAddColumn();
                    }
                  }
                }}
              >
                {isModalOpen === "task" ? "Add Task" : "Add Column"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
