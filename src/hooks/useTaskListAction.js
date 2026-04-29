import { useEffect, useState,useRef } from "react";
import { useTaskManagerContext } from "../context/TaskManagerContext";

export const useTaskListAction = ({tasks,colId,column}) => {
  const {
    columns,
    onChangeColumn,
    onEditTask: onEdit,
    onDeleteTask: onDelete,
  } = useTaskManagerContext();

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTaskId, setConfirmTaskId] = useState(null);

  const yesButtonRef = useRef(null);
  const noButtonRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showConfirm) {
        if (event.key === "Escape") {
          cancelDelete();
        } else if (event.key === "Tab") {
          // Let default tab behavior work for navigation between buttons
          return;
        }
      }
    };

    if (showConfirm) {
      document.addEventListener("keydown", handleKeyDown);
      // Auto-focus the "No" button (safer default)
      setTimeout(() => {
        if (noButtonRef.current) {
          noButtonRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showConfirm]);

  const handleEdit = (taskId, text) => {
    setEditingTaskId(taskId);
    setEditText(text);
  };

  const handleSave = () => {
    if (!editText.trim()) return;

    onEdit?.(editingTaskId, editText.trim(), colId);

    setEditingTaskId(null);
    setEditText("");
  };

  const handleCancel = () => {
    setEditingTaskId(null);
    setEditText("");
  };

  const handleDelete = (taskId) => {
    setConfirmTaskId(taskId);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete?.(confirmTaskId, colId);

    setShowConfirm(false);
    setConfirmTaskId(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setConfirmTaskId(null);
  };

  const itemData = {
    tasks: safeTasks,
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
  };

  return {
    itemData,
    safeTasks,
    showConfirm,
    yesButtonRef,
    noButtonRef,
    confirmDelete,
    cancelDelete,
  };
};
