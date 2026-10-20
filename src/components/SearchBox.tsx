// src/components/SearchBox.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { useThemePreference } from "../contexts/theme-context";
interface SearchBoxProps {
  onCari: (teks: string) => void;
}
export default function SearchBox({ onCari }: SearchBoxProps) {
  const [teks, setTeks] = useState("");
  const { colors } = useThemePreference();
  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru); // kirim setiap perubahan, debounce diatur di pemanggilnya
  }
  return (
    <View
      style={{
        minHeight: 54,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.backgroundElement,
      }}
    >
      <Ionicons name="search-outline" size={19} color={colors.textSecondary} />
      <TextInput
        placeholder="Cari kota atau wilayah"
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.accent}
        style={{
          flex: 1,
          minWidth: 0,
          height: 52,
          paddingHorizontal: 11,
          color: colors.text,
          fontSize: 15,
        }}
      />
    </View>
  );
}
