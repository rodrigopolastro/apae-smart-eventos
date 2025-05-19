import React from "react";
import { Button, StyleSheet, View } from "react-native";

type Props = {
  navigation: any;
};

export default function MainScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Button title="Ir para Leitor QRCode" onPress={() => navigation.navigate("QRCode")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
