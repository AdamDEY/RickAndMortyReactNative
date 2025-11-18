import { FC, useEffect } from "react"
import {
  Modal,
  View,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
  ImageBackground,
} from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated"

import { Text } from "@/components/Text"
import type { Character } from "@/models/character"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface CharacterDetailModalProps {
  character: Character | null
  visible: boolean
  onClose: () => void
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window")
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.75

export const CharacterDetailModal: FC<CharacterDetailModalProps> = ({
  character,
  visible,
  onClose,
}) => {
  const { themed } = useAppTheme()
  const translateY = useSharedValue(MODAL_HEIGHT)
  const startY = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 300,
      })
    } else {
      translateY.value = withTiming(MODAL_HEIGHT, { duration: 250 })
    }
  }, [translateY, visible])

  const panGesture = Gesture.Pan()
    .activeOffsetY([10, Number.MAX_SAFE_INTEGER])
    .onStart(() => {
      startY.value = translateY.value
    })
    .onUpdate((event) => {
      const newTranslateY = startY.value + event.translationY
      if (newTranslateY >= 0) {
        translateY.value = newTranslateY
      }
    })
    .onEnd((event) => {
      const shouldClose = event.translationY > MODAL_HEIGHT * 0.3 || event.velocityY > 500

      if (shouldClose) {
        translateY.value = withTiming(MODAL_HEIGHT, { duration: 250 }, () => {
          runOnJS(onClose)()
        })
      } else {
        translateY.value = withTiming(0, {
          duration: 300,
        })
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  if (!character) return null

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

  const episodeCount = Array.isArray(character.episode) ? character.episode.length : 0
  const episodeText =
    episodeCount > 0
      ? `Appears in ${episodeCount} episode${episodeCount !== 1 ? "s" : ""}`
      : "No episodes data available"

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={themed($backdrop)}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[themed($modalContainer), animatedStyle]}>
              <ImageBackground
                source={{ uri: character.image }}
                style={themed($backgroundImage)}
                resizeMode="cover"
              >
                <View style={themed($overlay)}>
                  <View style={themed($swipeIndicator)} />

                  <View style={themed($headerContainer)}>
                    <Text text={character.name} preset="heading" style={themed($characterName)} />
                    <View
                      style={[
                        $statusBadge,
                        { backgroundColor: getStatusBackgroundColor(character.status) },
                      ]}
                    >
                      <Text
                        text={
                          character.status.charAt(0).toUpperCase() +
                          character.status.slice(1).toLowerCase()
                        }
                        size="xs"
                        weight="medium"
                        style={$statusText}
                      />
                    </View>
                  </View>

                  <ScrollView
                    style={themed($scrollContainer)}
                    contentContainerStyle={themed($scrollContent)}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    <View style={themed($detailsGrid)}>
                      <View style={themed($detailCard)}>
                        <Text text="SPECIES" size="xs" style={themed($detailCardLabel)} />
                        <Text
                          text={character.species}
                          weight="medium"
                          style={themed($detailCardValue)}
                        />
                      </View>

                      <View style={themed($detailCard)}>
                        <Text text="GENDER" size="xs" style={themed($detailCardLabel)} />
                        <Text
                          text={character.gender}
                          weight="medium"
                          style={themed($detailCardValue)}
                        />
                      </View>
                    </View>

                    {character.origin && (
                      <View style={themed($infoCard)}>
                        <Text text="ORIGIN" weight="bold" style={themed($infoCardTitle)} />
                        <Text text={character.origin.name} style={themed($infoCardContent)} />
                      </View>
                    )}

                    {character.location && (
                      <View style={themed($infoCard)}>
                        <Text text="LOCATION" weight="bold" style={themed($infoCardTitle)} />
                        <Text text={character.location.name} style={themed($infoCardContent)} />
                      </View>
                    )}

                    {character.type && character.type.trim() !== "" && (
                      <View style={themed($infoCard)}>
                        <Text text="TYPE" weight="bold" style={themed($infoCardTitle)} />
                        <Text text={character.type} style={themed($infoCardContent)} />
                      </View>
                    )}

                    <View style={themed($infoCard)}>
                      <Text text="EPISODES" weight="bold" style={themed($infoCardTitle)} />
                      <Text text={episodeText} style={themed($infoCardContent)} />
                    </View>
                  </ScrollView>
                </View>
              </ImageBackground>
            </Animated.View>
          </GestureDetector>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const $backdrop: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.palette.overlay50 || "rgba(0, 0, 0, 0.5)",
  justifyContent: "flex-end",
})

const $modalContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: spacing.xl,
  borderTopRightRadius: spacing.xl,
  height: MODAL_HEIGHT,
  overflow: "hidden",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 10,
})

const $backgroundImage: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  width: "100%",
  height: "100%",
})

const $overlay: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  paddingTop: 12,
  paddingBottom: 24,
})

const $swipeIndicator: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 40,
  height: 4,
  backgroundColor: "#FFFFFF",
  borderRadius: 2,
  alignSelf: "center",
  marginBottom: spacing.sm,
  opacity: 0.5,
})

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.lg,
  alignItems: "center",
})

const $characterName: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 28,
  textAlign: "center",
  color: "#FFFFFF",
  marginBottom: spacing.sm,
  fontWeight: "bold",
})

const $statusBadge: ViewStyle = {
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 16,
  marginTop: 4,
}

const $statusText: TextStyle = {
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: "600",
}

const $scrollContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
})

const $detailsGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
  marginBottom: spacing.md,
})

const $detailCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  borderRadius: spacing.md,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.15)",
})

const $detailCardLabel: ThemedStyle<TextStyle> = ({ spacing }) => ({
  color: "rgba(255, 255, 255, 0.6)",
  marginBottom: spacing.xxs,
  fontSize: 11,
  letterSpacing: 0.5,
})

const $detailCardValue: ThemedStyle<TextStyle> = () => ({
  color: "#FFFFFF",
  fontSize: 17,
})

const $infoCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  borderRadius: spacing.md,
  padding: spacing.md,
  marginBottom: spacing.md,
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.15)",
})

const $infoCardTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 12,
  marginBottom: spacing.xxs,
  color: "rgba(255, 255, 255, 0.6)",
  letterSpacing: 0.5,
})

const $infoCardContent: ThemedStyle<TextStyle> = () => ({
  fontSize: 17,
  color: "#FFFFFF",
})
