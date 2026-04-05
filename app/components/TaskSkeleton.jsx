import { Skeleton } from "@mui/material";
import React from "react";

const TaskSkeleton = () => {
  return (
    <>
      <Skeleton
        animation="wave"
        variant="rectangular"
        width={"100%"}
        height={50}
      />
      <Skeleton />
      <Skeleton width="60%" />
    </>
  );
};

export default TaskSkeleton;
