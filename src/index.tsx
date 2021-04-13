import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { Home, Game } from "@screens";

export default function App() {
  return (
    <View style={styles.container}>
      <Image source={require("@assets/icon.png")} />
      <Home />
      <Game />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffae",
    alignItems: "center",
    justifyContent: "center",
  },
});
