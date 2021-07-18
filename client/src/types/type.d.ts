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

interface recordSummaryType {
  taskSubject: string,
  taskName: string,
  passedSecond: number,
  passedTimeStr: string,
}

interface subjectType {
  name: string,
  color: string,
  sortVal: number,
  isActive: boolean,
  subjectId: string,
}

interface UserInfo {
  user_cd: string,
  name: string,
  image?: string;
}