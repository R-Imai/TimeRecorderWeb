import axios, {AxiosResponse} from 'axios';
import API from './ApiBase';

type SubjectType = {
  name: string,
  color: string,
  sort_val: number,
  is_active: boolean,
  subject_id: string,
}

type StartTaskType= {
  task_subject: string;
  task_name: string;
};

type StartTaskInfoType= {
  start_time: Date;
} & StartTaskType


export async function getActiveSubjects() {
  const responce = await axios.get<SubjectType[]>(`${API.UrlBase}${API.Recorder.activeSubject}`).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)})
  return responce.data;
}

export async function taskStart(taskInfo: StartTaskType) {
  const responce = await axios.post<StartTaskInfoType | null>(`${API.UrlBase}${API.Recorder.recordRunning}`, taskInfo).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)})
  return responce.data;
}

export async function getRunningTask() {
  const responce = await axios.get<StartTaskInfoType | null>(`${API.UrlBase}${API.Recorder.recordRunning}`).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)})
  return responce.data;
}
