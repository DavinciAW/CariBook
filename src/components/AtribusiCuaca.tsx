// src/components/AtribusiCuaca.tsx
import { Linking, TouchableOpacity } from "react-native";
import { ThemedText } from "./themed-text";
export default function AtribusiCuaca() {
  return (
    <TouchableOpacity
      onPress={() => Linking.openURL("https://open-meteo.com/")}
    >
      <ThemedText style={{ fontSize: 11, textAlign: "center" }}>
        Data cuaca disediakan oleh Open-Meteo.com
      </ThemedText>
    </TouchableOpacity>
  );
}
