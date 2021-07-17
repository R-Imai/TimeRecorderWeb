import axios from 'axios';
import API from './ApiBase';

export type AddSubjectType = {
  name: string,
  color: string,
  sort_val: number,
  is_active: boolean
}

export type SubjectType = {
  subject_id: string,
} & AddSubjectType;

export type StartTaskType = {
  task_subject: string;
  task_name: string;
};

export type StartTaskInfoType = {
  start_time: string;
} & StartTaskType

export type TaskRecordType = {
  task_id: string;
  end_time: string;
} & StartTaskInfoType

export type CalcResultType = {
  task_subject: string;
  task_name: string;
  passed_second: number
  passed_time_str: string;
}

export async function getActiveSubjects() {
  const responce = await axios.get<SubjectType[]>(`${API.UrlBase}${API.Recorder.activeSubject}`).catch((e) => {throw e})
  return responce.data;
}

export async function taskStart(taskInfo: StartTaskType) {
  const responce = await axios.post<StartTaskInfoType | null>(`${API.UrlBase}${API.Recorder.recordRunning}`, taskInfo).catch((e) => {throw e})
  return responce.data;
}

export async function taskEdit(taskInfo: StartTaskInfoType) {
  await axios.put<null>(`${API.UrlBase}${API.Recorder.recordRunning}`, taskInfo).catch((e) => {throw e})
}

export async function taskCancel() {
  await axios.delete<null>(`${API.UrlBase}${API.Recorder.recordRunning}`).catch((e) => {throw e})
}

export async function taskEnd() {
  await axios.post<null>(`${API.UrlBase}${API.Recorder.recordEnd}`).catch((e) => {throw e})
}

export async function getRunningTask() {
  const responce = await axios.get<StartTaskInfoType | null>(`${API.UrlBase}${API.Recorder.recordRunning}`).catch((e) => {throw e})
  return responce.data;
}

export async function recordToday(){
  const responce = await axios.get<TaskRecordType[]>(`${API.UrlBase}${API.Recorder.recordToday}`).catch((e) => {throw e})
  return responce.data;
}

export async function recordEdit(taskInfo: TaskRecordType) {
  await axios.put<null>(`${API.UrlBase}${API.Recorder.recordTask}`, taskInfo).catch((e) => {throw e})
}

export async function calcToday() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  const responce = await axios.get<CalcResultType[]>(`${API.UrlBase}${API.Recorder.dailyCalc}`, {params: {date: dateStr}}).catch((e) => {throw e})
  return responce.data;
}

export async function getSubject() {
  const responce = await axios.get<SubjectType[]>(`${API.UrlBase}${API.Recorder.subject}`).catch((e) => {throw e})
  return responce.data;
}

export async function updateSubject(subjctInfo: SubjectType) {
  await axios.put<null>(`${API.UrlBase}${API.Recorder.subject}`, subjctInfo).catch((e) => {throw e})
}

export async function deleteSubject(id: String) {
  await axios.delete<null>(`${API.UrlBase}${API.Recorder.subject}`, {params: {subject_id: id}}).catch((e) => {throw e})
}

export async function addSubject(subjctInfo: AddSubjectType) {
  await axios.post<null>(`${API.UrlBase}${API.Recorder.subject}`, subjctInfo).catch((e) => {throw e})
}
