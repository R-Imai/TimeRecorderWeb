interface startTaskType {
  taskSubject: string,
  taskName: string,
}

interface runningTaskType extends startTaskType {
  startTime: string,
}

interface todaysTaskType extends runningTaskType {
  taskId: string,
  endTime: string,
}
