import { apiRick } from "./apiRick"
import { Character } from "../../../models/character"

export async function getCharactersByIds(ids: number[]): Promise<Character[]> {
  if (ids.length === 0) return []
  const idsString = ids.join(",")
  const res = await apiRick.get<Character | Character[]>(`/character/${idsString}`)
  if (Array.isArray(res.data)) {
    return res.data
  } else if (res.data) {
    return [res.data]
  }
  return []
}
