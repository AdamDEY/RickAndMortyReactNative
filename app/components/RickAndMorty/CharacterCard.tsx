import { FC } from "react"
import { Image, ImageStyle, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import type { Character } from "@/models/character"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface CharacterCardProps {
  character: Character
  onPress?: () => void
}

export const CharacterCard: FC<CharacterCardProps> = ({ character, onPress }) => {
  const { themed, theme } = useAppTheme()

  const getStatusBackgroundColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "alive":
        return "#4CAF50"
      case "dead":
        return "#F44336"
      case "unknown":
        return "#616161"
      default:
        return "#616161"
    }
  }

  const statusBackgroundColor = getStatusBackgroundColor(character.status)
  const nameTextColor = theme.isDark
    ? theme.colors.palette.neutral900
    : theme.colors.palette.neutral100

  return (
    <TouchableOpacity style={themed($cardContainer)} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: character.image }} style={$characterImage} resizeMode="cover" />
      <View style={[$statusBadge, { backgroundColor: statusBackgroundColor }]}>
        <Text
          text={character.status.charAt(0).toUpperCase() + character.status.slice(1).toLowerCase()}
          size="xxs"
          weight="medium"
          style={$statusText}
        />
      </View>
      <View style={themed($nameOverlay)}>
        <Text
          text={character.name}
          size="xs"
          weight="medium"
          style={[themed($nameText), { color: nameTextColor }]}
        />
      </View>
    </TouchableOpacity>
  )
}

const $cardContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "48%",
  aspectRatio: 1,
  marginBottom: spacing.md,
  borderRadius: spacing.sm,
  overflow: "hidden",
  position: "relative",
})

const $characterImage: ImageStyle = {
  width: "100%",
  height: "100%",
}

const $nameOverlay: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: colors.palette.overlay20 || "rgba(0, 0, 0, 0.5)",
  paddingVertical: 8,
  paddingHorizontal: 8,
  borderBottomLeftRadius: 12,
  borderBottomRightRadius: 12,
})

const $nameText: ThemedStyle<TextStyle> = () => ({
  textAlign: "center",
})

const $statusBadge: ViewStyle = {
  position: "absolute",
  top: 8,
  right: 8,
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 12,
}

const $statusText: TextStyle = {
  color: "#FFFFFF",
}
