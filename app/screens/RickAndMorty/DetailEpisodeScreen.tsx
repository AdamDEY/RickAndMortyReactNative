import { FC, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated"

import { Header } from "@/components/Header"
import { CharacterCard } from "@/components/RickAndMorty/CharacterCard"
import { CharacterDetailModal } from "@/components/RickAndMorty/CharacterDetailModal"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useCharacters } from "@/hooks/useCharacters"
import type { Character } from "@/models/character"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { formatDate } from "@/utils/formatDate"

type DetailEpisodeScreenProps = AppStackScreenProps<"DetailEpisode">

const CHARACTERS_PER_PAGE = 4
const EMPTY_CHARACTER_LIST: readonly string[] = []

export const DetailEpisodeScreen: FC<DetailEpisodeScreenProps> = function DetailEpisodeScreen() {
  const { themed, theme } = useAppTheme()
  const route = useRoute<DetailEpisodeScreenProps["route"]>()
  const navigation = useNavigation<DetailEpisodeScreenProps["navigation"]>()
  const episode = route.params?.episode
  const [displayedCount, setDisplayedCount] = useState(CHARACTERS_PER_PAGE)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const episodeInfoTranslateX = useSharedValue(-1000)
  const airDateTranslateX = useSharedValue(-1000)
  const createdTranslateX = useSharedValue(-1000)
  const charactersTranslateX = useSharedValue(-1000)

  useEffect(() => {
    episodeInfoTranslateX.value = withTiming(0, { duration: 600 })
    airDateTranslateX.value = withDelay(300, withTiming(0, { duration: 600 }))
    createdTranslateX.value = withDelay(600, withTiming(0, { duration: 600 }))
    charactersTranslateX.value = withDelay(900, withTiming(0, { duration: 600 }))
  }, [airDateTranslateX, charactersTranslateX, createdTranslateX, episodeInfoTranslateX])

  const episodeInfoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: episodeInfoTranslateX.value }],
  }))

  const airDateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: airDateTranslateX.value }],
  }))

  const createdAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: createdTranslateX.value }],
  }))

  const charactersAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: charactersTranslateX.value }],
  }))

  useEffect(() => {
    if (episode) {
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <Header
            title={episode.name}
            leftIcon="back"
            onLeftPress={() => navigation.goBack()}
            titleMode="center"
            titleStyle={$headerTitleStyle}
            containerStyle={$headerContainerStyle}
          />
        ),
      })
    }
  }, [navigation, episode])

  const episodeCode = episode?.episode ?? "S01E01"
  const episodeCharacterUrls = episode?.characters ?? EMPTY_CHARACTER_LIST

  const episodeInfo = useMemo(() => {
    const match = episodeCode.match(/S(\d+)E(\d+)/)
    if (match) {
      return {
        season: match[1].padStart(2, "0"),
        episode: match[2].padStart(2, "0"),
      }
    }
    return { season: "01", episode: "01" }
  }, [episodeCode])

  const characterIds = useMemo(() => {
    return episodeCharacterUrls
      .map((url) => {
        const match = url.match(/\/(\d+)$/)
        return match ? parseInt(match[1], 10) : null
      })
      .filter((id): id is number => id !== null)
  }, [episodeCharacterUrls])

  const { data: allCharacters = [], isLoading: isLoadingCharacters } = useCharacters(characterIds)

  const displayedCharacters = useMemo(() => {
    return allCharacters.slice(0, displayedCount)
  }, [allCharacters, displayedCount])

  const hasMoreCharacters = displayedCount < allCharacters.length

  if (!episode) {
    return (
      <Screen preset="fixed">
        <Text text="Episode not found" />
      </Screen>
    )
  }

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + CHARACTERS_PER_PAGE)
  }

  const handleCharacterPress = (character: Character) => {
    setSelectedCharacter(character)
    setIsModalVisible(true)
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setSelectedCharacter(null)
  }

  const formattedAirDate = episode.air_date
  const formattedCreatedDate = formatDate(episode.created, "MMMM dd, yyyy")

  return (
    <>
      <Screen preset="scroll" contentContainerStyle={themed($screenContentStyle)}>
        <Animated.View style={[themed($sectionContainer), episodeInfoAnimatedStyle]}>
          <View style={themed($episodeInfoContainer)}>
            <View style={themed($episodeInfoGrid)}>
              <View style={themed($infoCard)}>
                <Text text={episodeInfo.season} weight="bold" style={themed($infoCardNumber)} />
                <Text text="Season" style={themed($infoCardLabel)} />
              </View>
              <View style={themed($infoCard)}>
                <Text text={episodeInfo.episode} weight="bold" style={themed($infoCardNumber)} />
                <Text text="Episode" style={themed($infoCardLabel)} />
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[themed([$infoSectionContainer, $sectionContainer]), airDateAnimatedStyle]}
        >
          <Text text="Air Date" preset="heading" style={themed($infoTitle)} />
          <Text text={formattedAirDate} style={themed($infoContent)} />
        </Animated.View>

        <Animated.View
          style={[themed([$infoSectionContainer, $sectionContainer]), createdAnimatedStyle]}
        >
          <Text text="Created" preset="heading" style={themed($infoTitle)} />
          <Text text={formattedCreatedDate} style={themed($infoContent)} />
        </Animated.View>

        <Animated.View
          style={[themed([$infoSectionContainer, $sectionContainer]), charactersAnimatedStyle]}
        >
          <Text text="Characters" preset="heading" style={themed($charactersTitle)} />

          {isLoadingCharacters ? (
            <View style={themed($loadingContainer)}>
              <ActivityIndicator size="small" color={theme.colors.tint} />
              <Text text="Loading characters..." style={themed($loadingText)} />
            </View>
          ) : (
            <>
              <View style={themed($charactersGrid)}>
                {displayedCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onPress={() => handleCharacterPress(character)}
                  />
                ))}
              </View>

              {hasMoreCharacters && (
                <TouchableOpacity
                  style={themed($loadMoreButton)}
                  onPress={handleLoadMore}
                  activeOpacity={0.7}
                >
                  <Text text="Load More" weight="medium" style={themed($loadMoreText)} />
                </TouchableOpacity>
              )}
            </>
          )}
        </Animated.View>
      </Screen>

      <CharacterDetailModal
        character={selectedCharacter}
        visible={isModalVisible}
        onClose={handleCloseModal}
      />
    </>
  )
}

const $headerTitleStyle: TextStyle = {
  textAlign: "center",
}

const $headerContainerStyle: ViewStyle = {
  justifyContent: "center",
}

const $screenContentStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
  paddingBottom: spacing.xl,
})

const $sectionContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  paddingHorizontal: spacing.lg,
})

const $episodeInfoContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.xl,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing.md,
  gap: spacing.lg,
  shadowColor: colors.palette.primary600,
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 12,
  elevation: 2,
})
const $episodeInfoGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  gap: spacing.md,
})

const $infoCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  backgroundColor: colors.palette.primary200,
  borderRadius: spacing.xl,
  paddingVertical: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
})

const $infoCardNumber: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 36,
  lineHeight: 44,
  color: colors.palette.primary600,
})

const $infoCardLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  marginTop: 4,
  fontSize: 14,
  color: colors.palette.primary600,
})

const $infoTitle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xxs,
  fontSize: 24,
})

const $infoContent: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 16,
  marginBottom: spacing.xxs,
})

const $charactersTitle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xxs,
  fontSize: 24,
})

const $charactersGrid: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  alignItems: "center",
  justifyContent: "center",
})

const $loadingText: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  color: colors.textDim,
})

const $loadMoreButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.xl,
  borderRadius: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.md,
  width: "100%",
})

const $loadMoreText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  fontWeight: "bold",
})
const $infoSectionContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.xl,
  marginBottom: spacing.md,
  gap: spacing.xs,
  padding: spacing.xl,
  marginHorizontal: spacing.lg,
})
