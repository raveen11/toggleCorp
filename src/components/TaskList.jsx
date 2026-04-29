import React, { useState, memo, useEffect, useRef, use } from "react";
import { FixedSizeList as List } from "react-window";
import { ColumnDropdown } from "./ColumnDropdown";
import { useTaskManagerContext } from "../context/TaskManagerContext";
import { useTaskListAction } from "../hooks/useTaskListAction";

const TaskRow = memo(({ index, style, data }) => {
  const {
    tasks,
    editingTaskId,
    editText,
    setEditText,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    onChangeColumn,
    columns,
    column,
  } = data;

  const task = tasks[index];

  if (!task) return null;

  return (
    <div style={{ ...style, marginBottom: 10 }}>
      <div className="task-card">
        <div className="task-header">
          <span className="task-id">#{task.id}</span>

          <div className="task-controls">
            <button
              onClick={() => handleEdit(task.id, task.text)}
              className="icon-btn edit"
              title="Edit"
            >
              ✏️
            </button>

            <button
              onClick={() => handleDelete(task.id)}
              className="icon-btn delete"
              title="Delete"
            >
              🗑️
            </button>

            <ColumnDropdown
              columns={columns}
              column={column}
              placeholder={
                task.columnId === 1
                  ? "ToDo"
                  : task.columnId === 2
                    ? "In Progress"
                    : task.columnId === 3
                      ? "Done"
                      : column?.name
              }
              onSelect={(col) =>
                onChangeColumn(task.id, col?.id, task.columnId)
              }
            />
          </div>
        </div>

        {editingTaskId === task.id ? (
          <div className="edit-container">
            <input
              type="text"
              className="edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />

            <button onClick={handleSave} className="edit-btn save">
              ✓
            </button>

            <button onClick={handleCancel} className="edit-btn cancel">
              ✗
            </button>
          </div>
        ) : (
          <div className="task-name">{task.text}</div>
        )}
      </div>
    </div>
  );
});

const TaskList = ({ column, tasks = [], colId }) => {
  const {
    columns,
    onChangeColumn,
    onEditTask: onEdit,
    onDeleteTask: onDelete,
  } = useTaskManagerContext();
  const {
    itemData,
    showConfirm,
    safeTasks,
    yesButtonRef,
    confirmDelete,
    noButtonRef,
    cancelDelete,
  } = useTaskListAction({ tasks, colId, column });

  return (
    <>
      <div className="task-list">
        <List
          height={550}
          width={"100%"}
          itemCount={safeTasks?.length}
          itemSize={120}
          itemData={itemData}
        >
          {TaskRow}
        </List>
      </div>

      {showConfirm && (
        <div className="confirm-popup">
          <div className="confirm-content">
            <p>Are you sure you want to delete this task?</p>

            <button
              ref={yesButtonRef}
              onClick={confirmDelete}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmDelete();
                }
              }}
              className="confirm-btn yes"
            >
              Yes
            </button>

            <button
              ref={noButtonRef}
              onClick={cancelDelete}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  cancelDelete();
                }
              }}
              className="confirm-btn no"
            >
              No
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskList;
