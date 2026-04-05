"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Container from "./components/Container";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DragDropContext } from "@hello-pangea/dnd";

async function fetchTasks() {
  const response = await fetch(
    "https://ayvncyjajelhcgqcpmfk.supabase.co/rest/v1/tasks?order=order.asc",
    {
      headers: {
        apikey: "sb_publishable_CWjnrV1FaB8iP7L9WgK1kw_SLKOCU1P",
        Authorization: "Bearer sb_publishable_CWjnrV1FaB8iP7L9WgK1kw_SLKOCU1P",
      },
    },
  );
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return response.json();
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
  console.log("data", data);
  const createTask = useMutation({
  mutationFn: async (newTask) => {
    const response = await fetch(
      "https://ayvncyjajelhcgqcpmfk.supabase.co/rest/v1/tasks",
      {
        method: "POST",
        headers: {
          apikey: "sb_publishable_CWjnrV1FaB8iP7L9WgK1kw_SLKOCU1P",
          Authorization: "Bearer sb_publishable_CWjnrV1FaB8iP7L9WgK1kw_SLKOCU1P",
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(newTask),
      }
    );
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data; // ✅
  },
  onSuccess: (newTask) => {
    if (newTask) setLocalTasks((prev) => [...prev, newTask]); // ✅
  },
});
  const deleteTask = useMutation({
    mutationFn: async (taskId) => {
      await fetch(
        `https://ayvncyjajelhcgqcpmfk.supabase.co/rest/v1/tasks?id=eq.${taskId}`,
        {
          method: "DELETE",
          headers: {
            apikey: "sb_publishable_CWjnrV1FaB8iP7L9WgK1kw_SLKOCU1P",
            Authorization:
              "Bearer sb_publishable_CWjnrV1FaB8iP7L9WgK1kw_SLKOCU1P",
          },
        },
      );
    },
    onMutate: (taskId) => {
      setLocalTasks((prev) => prev.filter((task) => task.id !== taskId));
    },
  });

  const editTask = useMutation({
    mutationFn: async (updatedTask) => {
      await fetch(
        `https://ayvncyjajelhcgqcpmfk.supabase.co/rest/v1/tasks?id=eq.${updatedTask.id}`,
        {
          method: "PATCH",
          headers: {
            apikey: "sb_publishable_CWjnrV1FaB8iP7L9WgK1kw_SLKOCU1P",
            Authorization:
              "Bearer sb_publishable_CWjnrV1FaB8iP7L9WgK1kw_SLKOCU1P",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTask),
        },
      );
    },
    onMutate: (updatedTask) => {
      setLocalTasks((prev) =>
        prev.map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
        ),
      );
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
        fetch(
          `https://ayvncyjajelhcgqcpmfk.supabase.co/rest/v1/tasks?id=eq.${task.id}`,
          {
            method: "PATCH",
            headers: {
              apikey: "sb_publishable_CWjnrV1FaB8iP7L9WgK1kw_SLKOCU1P",
              Authorization:
                "Bearer sb_publishable_CWjnrV1FaB8iP7L9WgK1kw_SLKOCU1P",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
          },
        );
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
