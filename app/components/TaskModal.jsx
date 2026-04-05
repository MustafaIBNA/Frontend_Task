"use client";
import React, { useState } from "react";
import styles from "../page.module.css";

const TaskModal = ({
  column,
  editingTask,
  onCreateTask,
  onEditTask,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    title: editingTask?.title ?? "",
    description: editingTask?.description ?? "",
    priority: editingTask?.priority ?? "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.priority) return;

    if (editingTask) {
      // ✅ Edit
      onEditTask({
        ...editingTask,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
      });
    } else {
      // ✅ Create
      onCreateTask({ ...formData, column });
    }
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <h3>{editingTask ? "Edit Task" : "Add Task"}</h3>

        <input
          type="text"
          name="title"
          placeholder="Task Title"
          value={formData.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Task Description"
          value={formData.description}
          onChange={handleChange}
        />

        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="">Select Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <div className={styles.modalButtons}>
          <button type="button" onClick={handleSubmit}>
            {editingTask ? "Save Changes" : "Add Task"}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default TaskModal;
