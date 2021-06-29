interface startTaskType {
  taskSubject: string,
  taskName: string,
}

interface runningTaskType extends startTaskType {
  startTime: Date,
}
