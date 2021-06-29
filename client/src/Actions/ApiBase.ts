export const API = {
  UrlBase: "",
  Auth: {
    login: "/api/login",
    logout: "/api/logout",
    user: "/api/user",
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
