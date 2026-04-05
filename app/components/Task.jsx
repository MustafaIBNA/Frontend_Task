"use client";
import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
const priorityStyles = {
  High: { color: "#DC2626", background: "#FEE2E2" },
  Medium: { color: "#D97706", background: "#FEF3C7" },
  Low: { color: "#4B5563", background: "#F3F4F6" },
};
const Task = ({
  styles,
  taskTitle,
  taskDesc,
  priority,
  taskId,
  index,
  onDeleteTask,
  onEditClick,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    // Draggable
    <Draggable draggableId={String(taskId)} index={index}>
      {(provided) => (
        <div
          className={styles.task}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className={styles.taskHeader}>
            <h3 className={styles.title}>{taskTitle}</h3>

            <div className={styles.menuWrapper}>
              <button
                type="button"
                className={styles.menuButton}
                onClick={() => setShowMenu(!showMenu)}
              >
                ⋮
              </button>

              {showMenu && (
                <>
                  <div
                    className={styles.menuOverlay}
                    onClick={() => setShowMenu(false)}
                  />
                  <div className={styles.menu}>
                    <button
                      type="button"
                      onClick={() => {
                        onEditClick();
                        setShowMenu(false);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteTask(taskId);
                        setShowMenu(false);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <p className={styles.description}>{taskDesc}</p>
          <span
            className={styles.priority}
            style={priorityStyles[priority] ?? priorityStyles.Low}
          >
            {priority}
          </span>{" "}
        </div>
      )}
    </Draggable>
  );
};

export default Task;
