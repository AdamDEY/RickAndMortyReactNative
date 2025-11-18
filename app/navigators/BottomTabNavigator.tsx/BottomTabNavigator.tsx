import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"

import { Icon } from "@/components/Icon"
import { iconRegistry } from "@/components/Icon"
import { EpisodesScreen } from "@/screens/RickAndMorty/EpisodesScreen"
import { FavouritesScreen } from "@/screens/RickAndMorty/FavouritesScreen"
import { useAppTheme } from "@/theme/context"

import type { MainTabParamList } from "../../navigators/navigationTypes"

const Tab = createBottomTabNavigator<MainTabParamList>()

export function BottomTabNavigator() {
  const { theme } = useAppTheme()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof iconRegistry = "menu"

          if (route.name === "Episodes") {
            iconName = "menu"
          } else if (route.name === "Favourites") {
            iconName = "favorite"
          }

          return <Icon icon={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: theme.colors.tint,
        tabBarInactiveTintColor: theme.colors.textDim,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
      })}
    >
      <Tab.Screen
        name="Episodes"
        component={EpisodesScreen}
        options={{
          tabBarLabel: "Episodes",
        }}
      />
      <Tab.Screen
        name="Favourites"
        component={FavouritesScreen}
        options={{
          tabBarLabel: "Favourites",
        }}
      />
    </Tab.Navigator>
  )
}
