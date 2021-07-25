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
    dailyCalcToday: "/api/calc/daily/today",
    recordRunning: "/api/record/running",
    recordEnd: "/api/record/end",
    recordToday: "/api/record/today",
    record: "/api/record",
    recordTask: "/api/record/task",
    graphSummary: "/api/graph/summary",
    graphFig: "/api/graph/fig",
    subject: "/api/setting/subject",
    activeSubject: "/api/setting/subject/active",
  }
};

export default API;
