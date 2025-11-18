import { create } from "apisauce"

export const apiRick = create({
  baseURL: "https://rickandmortyapi.com/api",
  timeout: 10000,
})
