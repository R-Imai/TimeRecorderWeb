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
  passed_minutes: number
  passed_time_str: string;
}

export type CalcGraphSummaryType = {
  task_subject: string,
  passed_minutes: number,
  passed_time_str: string,
  color: string,
}

export const DAY_CHANGE_HOUR = 5;

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

export async function getRecord(dateStr: string){
  const responce = await axios.get<TaskRecordType[]>(`${API.UrlBase}${API.Recorder.record}`, {params: {date: dateStr}}).catch((e) => {throw e})
  return responce.data;
}

export async function recordEdit(taskInfo: TaskRecordType) {
  await axios.put<null>(`${API.UrlBase}${API.Recorder.recordTask}`, taskInfo).catch((e) => {throw e})
}

export async function calcToday() {
  const responce = await axios.get<CalcResultType[]>(`${API.UrlBase}${API.Recorder.dailyCalcToday}`).catch((e) => {throw e})
  return responce.data;
}

export async function calcDaily(dateStr: string) {
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

export async function calcMonthGraph() {
  const now = new Date();
  if (now.getHours() < DAY_CHANGE_HOUR) {
    now.setDate(now.getDate() - 1)
  }
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const responce = await axios.post<CalcGraphSummaryType[]>(`${API.UrlBase}${API.Recorder.graphSummary}`, {}, {params: {target: dateStr}}).catch((e) => {throw e})
  return responce.data;
}

export async function calcMonthGraphFig() {
  const now = new Date();
  if (now.getHours() < DAY_CHANGE_HOUR) {
    now.setDate(now.getDate() - 1)
  }
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const responce = await axios.get<ArrayBuffer>(`${API.UrlBase}${API.Recorder.graphFig}`, {responseType: "arraybuffer", params: {target: dateStr}}).catch((e) => {throw e})
  const bytes  = new Uint8Array(responce.data);
  let binaryData = '';
  for (var i = 0, len = bytes.byteLength; i < len; i++) {
    binaryData += String.fromCharCode(bytes[i]);
  }
  const imgStr = btoa(binaryData);
  return `data:image/png;base64,${imgStr}`;
}

export async function exportCsv(startDate: string, endDate: string) {
  const fileName = `${startDate}_${endDate}.csv`
  await axios.get<Blob>(`${API.UrlBase}${API.Recorder.exportCsv}`, {responseType: "blob", params: {start_date: startDate, end_date: endDate}}).then(
    (response) => {
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const fileLink = document.createElement('a');
      fileLink.href = fileURL;
      fileLink.setAttribute('download', fileName);
      document.body.appendChild(fileLink);
      fileLink.click();
      document.body.removeChild(fileLink);
  }).catch((e) => {throw e})
}