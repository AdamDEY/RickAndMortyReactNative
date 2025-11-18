import { apiRick } from "./apiRick"
import { EpisodesResponse } from "../../../models/episode"

export async function getEpisodes(page: number = 1): Promise<EpisodesResponse> {
  const res = await apiRick.get<EpisodesResponse>(`/episode?page=${page}`)
  return res.data || { info: { count: 0, pages: 0, next: null, prev: null }, results: [] }
}
