// src/components/SearchBox.tsx
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
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.accent}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          padding: 8,
          borderRadius: 8,
          color: colors.text,
          backgroundColor: colors.backgroundElement,
        }}
      />
    </View>
  );
}
