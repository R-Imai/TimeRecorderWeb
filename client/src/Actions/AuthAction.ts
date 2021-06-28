import axios, {AxiosResponse} from 'axios';
import API from './ApiBase';

axios.defaults.withCredentials = true;

// type UpdatePasswordInfo = {
//   id: string,
//   current_password: string,
//   new_password: string
// }

type userInfo = {
  user_cd: string;
  name: string;
  image: string;
}

type RegisterUserInfo = {
  password: string;
} & userInfo

type ErrResponseValue = {
  detail: string
}

type ErrResponse = {
  response: AxiosResponse<ErrResponseValue>
}

export async function login(id: string, pass: string) {
  await axios.post<null>(`${API.UrlBase}${API.Auth.login}`, {user_cd: id, password: pass}).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)})
}

export async function logout() {
  await axios.post<null>(`${API.UrlBase}${API.Auth.logout}`);
}

export async function register(userInfo: RegisterUserInfo) {
  await axios.post<null>(`${API.UrlBase}${API.Auth.user}`, userInfo)
    .catch((e: ErrResponse) => {
      console.error(e);
      throw new Error(e.response.data.detail);
    })
}

export async function getUserInfo() {
  const response = await axios.get<userInfo>(`${API.UrlBase}${API.Auth.user}`)
    .catch((e: ErrResponse) => {
      console.error(e);
      throw new Error(e.response.data.detail);
    })
  return response.data
}

// export async function updatePassword(token: string, passwordInfo: UpdatePasswordInfo) {
//   const responce = await axios.post<null>(`${API.UrlBase}${API.Auth.passwordUpdate}`, passwordInfo, {
//     headers: {
//       'my-token': token
//     }}).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)});
//   return responce;
// }
