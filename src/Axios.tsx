import axios, { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { KEYS } from "./Constants";

const BASE_URL = process.env.REACT_APP_ASSET_REGISTRY_BASE_URL || "";
export const axiosObj = axios.create();

axiosObj.interceptors.request.use((config: AxiosRequestConfig) => {
  if (config.url?.includes("/login")) return config;
  const token = config.url?.includes("/logout")
    ? `Bearer ${Cookies.get("refresh_token_cookie")}`
    : `Bearer ${Cookies.get("access_token_cookie")}`;
  if (
    "headers" in config &&
    config.headers &&
    "Authorization" in config.headers
  ) {
    config.headers.Authorization = token;
  } else {
    config.headers = { Authorization: token };
  }
  return config;
});

export const makeRequest = (
  url: AxiosRequestConfig["url"],
  method: AxiosRequestConfig["method"],
  headers?: AxiosRequestConfig["headers"],
  body?: AxiosRequestConfig["data"],
  params?: AxiosRequestConfig["params"]
) => {
  return new Promise(async (resolve, reject) => {
    axiosObj({
      url: BASE_URL + url,
      method: method,
      headers: headers,
      data: body,
      params,
    })
      .then((response: any) => {
        resolve(response);
        if (url?.includes("logout")) {
          Cookies.remove(KEYS.ACCESS_TOKEN_COOKIE);
          Cookies.remove(KEYS.REFRESH_TOKEN_COOKIE);
        }
        if (url?.includes("login") || url?.includes("fetch-session-cookies")) {
          Cookies.set(KEYS.ACCESS_TOKEN_COOKIE, response.data.access_token);
          Cookies.set(KEYS.REFRESH_TOKEN_COOKIE, response.data.refresh_token);
        }
      })
      .catch((err: any) => {
        // Handle error here.
        reject(err);
      });
  });
};
