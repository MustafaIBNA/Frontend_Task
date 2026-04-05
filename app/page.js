"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Container from "./components/Container";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DragDropContext } from "@hello-pangea/dnd";

async function fetchTasks() {
  const response = await fetch("http://localhost:4000/tasks");
  if (!response.ok) throw new Error("Failed to fetch tasks");
  const data = await response.json();
  return data.sort((a, b) => a.order - b.order);
}
export default function Home() {
  const [localTasks, setLocalTasks] = useState([]);

  const { data, error, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    select: (data) => {
      setLocalTasks(data);
      return data;
    },
  });

  const createTask = useMutation({
    mutationFn: (newTask) =>
      fetch("http://localhost:4000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      }).then((res) => res.json()),
    onSuccess: (newTask) => {
      setLocalTasks((prev) => [...prev, newTask]); // ✅
    },
  });

  const deleteTask = useMutation({
    mutationFn: (taskId) =>
      fetch(`http://localhost:4000/tasks/${taskId}`, { method: "DELETE" }),
    onMutate: (taskId) => {
      setLocalTasks((prev) => prev.filter((task) => task.id !== taskId)); // ✅
    },
  });

  const editTask = useMutation({
    mutationFn: (updatedTask) =>
      fetch(`http://localhost:4000/tasks/${updatedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      }).then((res) => res.json()),
    onMutate: (updatedTask) => {
      setLocalTasks((prev) =>
        prev.map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
        ),
      ); // ✅
    },
  });
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const taskToUpdate = localTasks.find(
      (task) => String(task.id) === String(draggableId),
    );
    if (!taskToUpdate) return;

    const updatedTask = { ...taskToUpdate, column: destination.droppableId };

    let reorderedTasks;
    setLocalTasks((prev) => {
      const withoutTask = prev.filter(
        (task) => String(task.id) !== String(draggableId),
      );
      const destinationTasks = withoutTask.filter(
        (task) => task.column === destination.droppableId,
      );
      destinationTasks.splice(destination.index, 0, updatedTask);
      const otherTasks = withoutTask.filter(
        (task) => task.column !== destination.droppableId,
      );

      const withOrder = destinationTasks.map((task, index) => ({
        ...task,
        order: index,
      }));

      reorderedTasks = withOrder;
      return [...otherTasks, ...withOrder];
    });

    setTimeout(() => {
      reorderedTasks?.forEach((task) => {
        fetch(`http://localhost:4000/tasks/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        });
      });
    }, 0);
  };

  if (isLoading) return null;
  if (error) return <div>Error loading tasks: {error.message}</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <main className={styles.page}>
        <div className={styles.main}>
          <div className={styles.grid}>
            <Container
              styles={styles}
              todo="TO DO"
              column="backlog"
              tasks={localTasks}
              isLoading={isLoading}
              onCreateTask={createTask.mutate}
              onDeleteTask={deleteTask.mutate}
              onEditTask={editTask.mutate}
              className={styles.backlogContainer}
            />
            <Container
              styles={styles}
              todo="IN PROGRESS"
              column="in_progress"
              tasks={localTasks}
              isLoading={isLoading}
              onCreateTask={createTask.mutate}
              onDeleteTask={deleteTask.mutate}
              onEditTask={editTask.mutate}
              className={styles.inProgressContainer}
            />
            <Container
              styles={styles}
              todo="IN REVIEW"
              column="review"
              tasks={localTasks}
              isLoading={isLoading}
              onCreateTask={createTask.mutate}
              onDeleteTask={deleteTask.mutate}
              onEditTask={editTask.mutate}
              className={styles.reviewContainer}
            />
            <Container
              styles={styles}
              todo="DONE"
              column="done"
              tasks={localTasks}
              isLoading={isLoading}
              onCreateTask={createTask.mutate}
              onDeleteTask={deleteTask.mutate}
              onEditTask={editTask.mutate}
              className={styles.doneContainer}
            />
          </div>
        </div>
      </main>
    </DragDropContext>
  );
}
