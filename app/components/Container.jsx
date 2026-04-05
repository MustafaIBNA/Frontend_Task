"use client";
import React, { useState } from "react";
import Task from "./Task";
import TaskSkeleton from "./TaskSkeleton";
import TaskModal from "./TaskModal";
import { Droppable } from "@hello-pangea/dnd";
const Container = ({
  styles,
  todo,
  column,
  tasks = [],
  isLoading,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  className,
}) => {
  const filteredTasks = tasks.filter((task) => task.column === column);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleEditClick = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  return (
    <div className={styles.container + " " + className}>
      <h2 className={styles.containerTitle}>
        <span className={styles.containerTitleIcon}></span>
        {todo}
        <span className={styles.tasksCounter}>{filteredTasks.length}</span>
      </h2>

      <Droppable droppableId={column}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {isLoading
              ? [1, 2].map((i) => <TaskSkeleton key={i} />)
              : filteredTasks.map((task, index) => (
                  <Task
                    key={task.id}
                    index={index}
                    taskId={task.id}
                    task={task}
                    styles={styles}
                    taskTitle={task.title}
                    taskDesc={task.description}
                    priority={task.priority}
                    onEditClick={() => handleEditClick(task)}
                    onDeleteTask={onDeleteTask}
                  />
                ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {showModal && (
        <TaskModal
          column={column}
          editingTask={editingTask}
          onCreateTask={onCreateTask}
          onEditTask={onEditTask}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
        />
      )}

      <button
        className={styles.addTask}
        type="button"
        onClick={() => setShowModal(true)}
      >
        + Add Task
      </button>
    </div>
  );
};

export default Container;
