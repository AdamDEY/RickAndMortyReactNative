import { FC, useMemo, useState, useCallback, useEffect, useRef } from "react"
import { ActivityIndicator, View, ViewStyle, TextStyle, Dimensions } from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { FlashList, type ListRenderItem } from "@shopify/flash-list"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useEpisodes } from "@/hooks/useEpisodes"
import { useFavourites } from "@/hooks/useFavourites"
import type { Episode } from "@/models/episode"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

import { EpisodeCard } from "../../components/RickAndMorty/EpisodeCard"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface AnimatedEpisodeCardProps {
  episode: Episode
  isFavourite: boolean
  onPress: () => void
  onFavouritePress: () => void
  onAnimationComplete: () => void
}

const AnimatedEpisodeCard: FC<AnimatedEpisodeCardProps> = ({
  episode,
  isFavourite,
  onPress,
  onFavouritePress,
  onAnimationComplete,
}) => {
  const translateX = useSharedValue(0)
  const opacity = useSharedValue(1)
  const prevIsFavourite = useRef(isFavourite)

  useEffect(() => {
    if (prevIsFavourite.current && !isFavourite) {
      translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 400 }, () => {
        runOnJS(onAnimationComplete)()
      })
      opacity.value = withTiming(0, { duration: 400 })
    }
    prevIsFavourite.current = isFavourite
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFavourite, onAnimationComplete])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }))

  return (
    <Animated.View style={animatedStyle}>
      <EpisodeCard
        episode={episode}
        isFavourite={isFavourite}
        onPress={onPress}
        onFavouritePress={onFavouritePress}
      />
    </Animated.View>
  )
}

export const FavouritesScreen: FC = function FavouritesScreen() {
  const { themed, theme } = useAppTheme()
  const navigation = useNavigation<AppStackScreenProps<"DetailEpisode">["navigation"]>()
  const { isFavourite, toggleFavourite, favouriteIds, reloadFavourites } = useFavourites()
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())

  useFocusEffect(
    useCallback(() => {
      reloadFavourites()
    }, [reloadFavourites]),
  )

  const { data, isLoading, error } = useEpisodes()

  const allEpisodes = useMemo(() => {
    return data?.pages.flatMap((page) => page.results) || []
  }, [data])

  const favouriteEpisodesUnfiltered = useMemo(() => {
    const favouriteIdsArray = Array.from(favouriteIds)
    return allEpisodes.filter((episode) => {
      const isFav = favouriteIdsArray.includes(episode.id)
      const isDeleting = deletingIds.has(episode.id)
      return isFav || isDeleting
    })
  }, [allEpisodes, favouriteIds, deletingIds])

  const favouriteEpisodes = useMemo(() => {
    if (!searchQuery.trim()) {
      return favouriteEpisodesUnfiltered
    }
    const query = searchQuery.toLowerCase().trim()
    return favouriteEpisodesUnfiltered.filter((episode) =>
      episode.name.toLowerCase().includes(query),
    )
  }, [favouriteEpisodesUnfiltered, searchQuery])

  const handleFavouritePress = useCallback(
    (episodeId: number) => {
      const wasFavourite = isFavourite(episodeId)
      toggleFavourite(episodeId)

      if (wasFavourite) {
        setDeletingIds((prev) => new Set(prev).add(episodeId))
      }
    },
    [isFavourite, toggleFavourite],
  )

  const handleAnimationComplete = useCallback((episodeId: number) => {
    setDeletingIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(episodeId)
      return newSet
    })
  }, [])

  const renderEpisode: ListRenderItem<Episode> = ({ item }) => {
    const itemIsFavourite = isFavourite(item.id)
    const isDeleting = deletingIds.has(item.id)

    return (
      <AnimatedEpisodeCard
        episode={item}
        isFavourite={itemIsFavourite && !isDeleting}
        onPress={() => {
          navigation.navigate("DetailEpisode", { episode: item })
        }}
        onFavouritePress={() => handleFavouritePress(item.id)}
        onAnimationComplete={() => handleAnimationComplete(item.id)}
      />
    )
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.flex1}>
      <View style={themed($appBarContainer)}>
        <Text text="Favourites" weight="bold" style={themed($headerTitle)} />
        <Text
          text={`${favouriteEpisodesUnfiltered.length} episode${favouriteEpisodesUnfiltered.length !== 1 ? "s" : ""}`}
          size="sm"
          style={themed($subtitle)}
        />
      </View>

      <View style={themed($searchContainer)}>
        <TextField
          placeholder="Find a specific episode"
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={themed($searchFieldContainer)}
          inputWrapperStyle={themed($searchInputWrapper)}
          style={themed($searchInput)}
          LeftAccessory={(props) => (
            <Icon
              icon="search"
              containerStyle={props.style}
              color={theme.colors.textDim}
              size={20}
            />
          )}
        />
      </View>

      {isLoading && (
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
          <Text text="Loading episodes..." style={themed($loadingText)} />
        </View>
      )}

      {error && (
        <View style={themed($errorContainer)}>
          <Text text="Failed to load episodes" preset="heading" style={themed($errorText)} />
          <Text text={error.message || "Please try again later"} style={themed($errorSubtext)} />
        </View>
      )}

      {!isLoading && !error && favouriteEpisodes.length === 0 && (
        <View style={themed($emptyContainer)}>
          <Text text="No Favourites Yet" preset="heading" style={themed($emptyTitle)} />
          <Text
            text="Tap the heart icon on episodes to add them to your favourites"
            style={themed($emptyText)}
          />
        </View>
      )}

      {!isLoading && !error && favouriteEpisodes.length > 0 && (
        <FlashList
          data={favouriteEpisodes}
          renderItem={renderEpisode}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={themed($listContainerStyle)}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  )
}

const $appBarContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  paddingBottom: spacing.md,
  marginTop: spacing.lg,
  backgroundColor: colors.background,
})

const $headerTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 28,
  lineHeight: 36,
  marginBottom: spacing.xxs,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
  lineHeight: 16,
})

const $searchContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.md,
})

const $searchFieldContainer: ThemedStyle<ViewStyle> = () => ({})

const $searchInputWrapper: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: spacing.md,
  borderColor: colors.palette.neutral400,
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.md,
  minHeight: 48,
})

const $searchInput: ThemedStyle<TextStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xs,
})

const $listContainerStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
})

const $loadingText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  color: colors.textDim,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.xl,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.sm,
  textAlign: "center",
})

const $errorSubtext: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.xxl,
})

const $emptyTitle: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.md,
  color: colors.text,
  textAlign: "center",
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
  opacity: 0.7,
})
