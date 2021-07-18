import axios from 'axios';
import API from './ApiBase';

axios.defaults.withCredentials = true;

type UpdatePasswordInfo = {
  current: string,
  new: string
}

type userInfo = {
  user_cd: string;
  name: string;
  image: string;
}

type RegisterUserInfo = {
  password: string;
} & userInfo

export async function login(id: string, pass: string) {
  await axios.post<null>(`${API.UrlBase}${API.Auth.login}`, {user_cd: id, password: pass}).catch((e) => {throw e})
}

export async function logout() {
  await axios.post<null>(`${API.UrlBase}${API.Auth.logout}`);
}

export async function register(userInfo: RegisterUserInfo) {
  await axios.post<null>(`${API.UrlBase}${API.Auth.user}`, userInfo)
    .catch((e) => {
      console.error(e);
      throw e;
    })
}

export async function getUserInfo() {
  const response = await axios.get<userInfo>(`${API.UrlBase}${API.Auth.user}`)
    .catch((e) => {
      console.error(e);
      throw e;
    })
  return response.data
}

export async function updatePassword(passwordInfo: UpdatePasswordInfo) {
  await axios.post<null>(`${API.UrlBase}${API.Auth.password}`, passwordInfo).catch((e) => {throw e});
}
