import axios, {AxiosError} from 'axios';

export type ApiErrorData = {
  detail: string
}

export const isApiErrorData = (e: any): e is AxiosError<ApiErrorData> => {
  return axios.isAxiosError(e) && !!e.response && e.response.data.detail;
}

export const API = {
  UrlBase: "",
  Auth: {
    login: "/api/login",
    logout: "/api/logout",
    user: "/api/user",
    password: "/api/password",
  },
  Recorder: {
    dailyCalc: "/api/calc/daily",
    recordRunning: "/api/record/running",
    recordEnd: "/api/record/end",
    recordToday: "/api/record/today",
    recordTask: "/api/record/task",
    graph: "/api/graph",
    subject: "/api/setting/subject",
    activeSubject: "/api/setting/subject/active",
  }
};

export default API;
