import { FC } from "react"
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

import { PressableIcon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Episode } from "../../models/episode"

interface EpisodeCardProps {
  episode: Episode
  isFavourite?: boolean
  onPress?: () => void
  onFavouritePress?: () => void
}

export const EpisodeCard: FC<EpisodeCardProps> = ({
  episode,
  isFavourite = false,
  onPress,
  onFavouritePress,
}) => {
  const { themed, theme } = useAppTheme()

  const formattedDate = episode.air_date ?? "N/A"

  const handleFavouritePress = () => {
    onFavouritePress?.()
  }

  return (
    <TouchableOpacity style={themed($cardContainer)} onPress={onPress} activeOpacity={0.7}>
      <View style={$contentContainer}>
        <Text text={episode.name} weight="bold" style={themed($titleStyle)} />

        <View style={$metadataContainer}>
          <Text text={episode.episode} size="sm" weight="medium" style={themed($episodeStyle)} />
          <Text text="•" size="sm" style={themed($separatorStyle)} />
          <Text text={formattedDate} size="sm" style={themed($dateStyle)} />
        </View>
      </View>

      <PressableIcon
        icon="favorite"
        size={24}
        color={isFavourite ? theme.colors.error : theme.colors.textDim}
        onPress={handleFavouritePress}
        containerStyle={$heartIconContainer}
      />
    </TouchableOpacity>
  )
}

const $cardContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
  padding: spacing.md,
  marginBottom: spacing.sm,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $contentContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
}

const $titleStyle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
  fontSize: 18,
  lineHeight: 24,
})

const $metadataContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
}

const $episodeStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontSize: 14,
  marginEnd: 4,
})

const $separatorStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  marginHorizontal: 4,
})

const $dateStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
})

const $heartIconContainer: ViewStyle = {
  padding: 4,
  marginStart: 8,
}
