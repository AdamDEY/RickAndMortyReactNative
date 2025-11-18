import { useQuery } from "@tanstack/react-query"

import { getCharactersByIds } from "../services/api/RickAndMorty/characterApi"

export function useCharacters(characterIds: number[]) {
  return useQuery({
    queryKey: ["characters", characterIds],
    queryFn: () => getCharactersByIds(characterIds),
    enabled: characterIds.length > 0,
  })
}
