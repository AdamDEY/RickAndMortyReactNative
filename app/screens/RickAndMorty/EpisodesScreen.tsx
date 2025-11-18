import { FC, useMemo, useState, useCallback } from "react"
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  RefreshControl,
  Alert,
} from "react-native"
import { useNetInfo } from "@react-native-community/netinfo"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { FlashList, type ListRenderItem } from "@shopify/flash-list"
import type { InfiniteData } from "@tanstack/react-query"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useEpisodes } from "@/hooks/useEpisodes"
import { useFavourites } from "@/hooks/useFavourites"
import type { Episode, EpisodesResponse } from "@/models/episode"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

import { EpisodeCard } from "../../components/RickAndMorty/EpisodeCard"

export const EpisodesScreen: FC = function EpisodesScreen() {
  const { themed, theme } = useAppTheme()
  const navigation = useNavigation<AppStackScreenProps<"DetailEpisode">["navigation"]>()
  const { isFavourite, toggleFavourite, reloadFavourites } = useFavourites()
  const [searchQuery, setSearchQuery] = useState("")

  const netInfo = useNetInfo()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      reloadFavourites()
    }, [reloadFavourites]),
  )

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useEpisodes()
  const handleRefresh = async () => {
    if (!netInfo.isConnected) {
      showToast("No connection", "Connect to the internet to refresh.")
      return
    }

    setIsRefreshing(true)
    const previousLatestId = getLatestEpisodeId(data)

    const result = await refetch({
      throwOnError: false,
      cancelRefetch: false,
    })

    setIsRefreshing(false)

    if (result.error) {
      showToast("Refresh failed", result.error.message ?? "Please try again later.")
      return
    }

    const nextLatestId = getLatestEpisodeId(result.data)

    if (nextLatestId !== null && previousLatestId !== null && nextLatestId > previousLatestId) {
      showToast("Updated", "New episodes loaded!")
    } else {
      showToast("No new content", "You're already on the latest episodes.")
    }
  }
  const allEpisodes = useMemo(() => {
    return data?.pages.flatMap((page) => page.results) || []
  }, [data])

  const episodes = useMemo(() => {
    if (!searchQuery.trim()) {
      return allEpisodes
    }
    const query = searchQuery.toLowerCase().trim()
    return allEpisodes.filter((episode) => episode.name.toLowerCase().includes(query))
  }, [allEpisodes, searchQuery])

  const renderEpisode: ListRenderItem<Episode> = ({ item }) => (
    <EpisodeCard
      episode={item}
      isFavourite={isFavourite(item.id)}
      onPress={() => {
        navigation.navigate("DetailEpisode", { episode: item })
      }}
      onFavouritePress={() => toggleFavourite(item.id)}
    />
  )

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={themed($footerContainer)}>
          <ActivityIndicator size="small" color={theme.colors.tint} />
          <Text text="Loading more episodes..." style={themed($footerText)} />
        </View>
      )
    }

    if (hasNextPage) {
      return (
        <TouchableOpacity
          style={themed($loadMoreButton)}
          onPress={() => fetchNextPage()}
          activeOpacity={0.7}
        >
          <Text text="Load More" weight="medium" style={themed($loadMoreText)} />
        </TouchableOpacity>
      )
    }

    return (
      <View style={themed($footerContainer)}>
        <Text text="No more episodes" style={themed($footerText)} />
      </View>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      {!isLoading && (
        <View style={themed($appBarContainer)}>
          <Text text="Welcome Back" weight="bold" style={themed($welcomeTitle)} />
          <Text text="See New Episodes" size="sm" style={themed($subtitle)} />
        </View>
      )}

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
          <View style={themed($loadingBox)}>
            <ActivityIndicator size="large" color={theme.colors.tint} />
            <Text text="Loading of Elements" style={themed($loadingText)} />
          </View>
        </View>
      )}

      {error && (
        <View style={themed($errorContainer)}>
          <Text text="Failed to load episodes" preset="heading" style={themed($errorText)} />
          <Text text={error.message || "Please try again later"} style={themed($errorSubtext)} />
        </View>
      )}

      {!isLoading && !error && (
        <FlashList
          data={episodes}
          renderItem={renderEpisode}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={themed($listContainerStyle)}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.tint}
            />
          }
        />
      )}
    </Screen>
  )
}

const showToast = (title: string, message: string) => {
  Alert.alert(title, message)
}

const getLatestEpisodeId = (data: InfiniteData<EpisodesResponse> | undefined) => {
  const flattened = data?.pages.flatMap((page) => page.results) ?? []
  if (flattened.length === 0) return null
  return Math.max(...flattened.map((episode) => episode.id))
}

const $appBarContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  paddingBottom: spacing.md,
  marginTop: spacing.lg,
  backgroundColor: colors.background,
})

const $welcomeTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
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
  justifyContent: "flex-start",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
})

const $loadingBox: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: "100%",
  backgroundColor: colors.palette.neutral200,
  borderRadius: spacing.md,
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  minHeight: 200,
})

const $loadingText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  color: colors.text,
  fontSize: 16,
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

const $footerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
})

const $footerText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.sm,
})

const $loadMoreButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.tint,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.xl,
  borderRadius: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  marginVertical: spacing.lg,
  marginHorizontal: spacing.lg,
})

const $loadMoreText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
})
