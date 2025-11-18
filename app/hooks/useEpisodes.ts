import { useInfiniteQuery } from "@tanstack/react-query"

import { getEpisodes } from "../services/api/RickAndMorty/episodeApi"

export function useEpisodes() {
  return useInfiniteQuery({
    queryKey: ["episodes"],
    queryFn: ({ pageParam = 1 }) => getEpisodes(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.info.next) {
        const url = new URL(lastPage.info.next)
        const page = url.searchParams.get("page")
        return page ? parseInt(page, 10) : undefined
      }
      return undefined
    },
    initialPageParam: 1,
  })
}
