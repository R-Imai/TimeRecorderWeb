import axios, {AxiosResponse} from 'axios';
import API from './ApiBase';

export type SubjectType = {
  name: string,
  color: string,
  sort_val: number,
  is_active: boolean,
  subject_id: string,
}

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

type ErrResponseValue = {
  detail: string
}

type ErrResponse = {
  response: AxiosResponse<ErrResponseValue>
}

export async function getActiveSubjects() {
  const responce = await axios.get<SubjectType[]>(`${API.UrlBase}${API.Recorder.activeSubject}`).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)})
  return responce.data;
}

export async function taskStart(taskInfo: StartTaskType) {
  const responce = await axios.post<StartTaskInfoType | null>(`${API.UrlBase}${API.Recorder.recordRunning}`, taskInfo).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)})
  return responce.data;
}

export async function taskEdit(taskInfo: StartTaskInfoType) {
  await axios.put<null>(`${API.UrlBase}${API.Recorder.recordRunning}`, taskInfo).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)})
}

export async function taskCancel() {
  await axios.delete<null>(`${API.UrlBase}${API.Recorder.recordRunning}`).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)})
}

export async function taskEnd() {
  await axios.post<null>(`${API.UrlBase}${API.Recorder.recordEnd}`).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)})
}

export async function getRunningTask() {
  const responce = await axios.get<StartTaskInfoType | null>(`${API.UrlBase}${API.Recorder.recordRunning}`).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)})
  return responce.data;
}

export async function recordToday(){
  const responce = await axios.get<TaskRecordType[]>(`${API.UrlBase}${API.Recorder.recordToday}`).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)})
  return responce.data;
}

export async function recordEdit(taskInfo: TaskRecordType) {
  await axios.put<null>(`${API.UrlBase}${API.Recorder.recordTask}`, taskInfo).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)})
}
