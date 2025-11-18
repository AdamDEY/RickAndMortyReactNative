import { useCallback, useEffect, useState } from "react"

import * as storage from "@/utils/storage"

const FAVOURITES_STORAGE_KEY = "favourite_episodes"

export function useFavourites() {
  const [favouriteIds, setFavouriteIds] = useState<Set<number>>(new Set())

  // Load favourites from storage
  const loadFavourites = useCallback(() => {
    const savedFavourites = storage.load<number[]>(FAVOURITES_STORAGE_KEY)
    if (savedFavourites && Array.isArray(savedFavourites)) {
      setFavouriteIds(new Set(savedFavourites))
    }
  }, [])
  useEffect(() => {
    loadFavourites()
  }, [loadFavourites])

  const saveFavourites = useCallback((ids: Set<number>) => {
    storage.save(FAVOURITES_STORAGE_KEY, Array.from(ids))
  }, [])

  const toggleFavourite = useCallback(
    (episodeId: number) => {
      setFavouriteIds((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(episodeId)) {
          newSet.delete(episodeId)
        } else {
          newSet.add(episodeId)
        }
        saveFavourites(newSet)
        return newSet
      })
    },
    [saveFavourites],
  )

  const isFavourite = useCallback(
    (episodeId: number) => {
      return favouriteIds.has(episodeId)
    },
    [favouriteIds],
  )

  const getFavouriteIds = useCallback(() => {
    return Array.from(favouriteIds)
  }, [favouriteIds])

  return {
    favouriteIds,
    toggleFavourite,
    isFavourite,
    getFavouriteIds,
    reloadFavourites: loadFavourites,
  }
}
