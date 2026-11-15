import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import { Dialog } from "./Dialog";
import { COLORS } from "./theme";

export function WeighDialog({ visible, current, onSave, onClose }: { visible: boolean; current: number; onSave: (kg: number) => void; onClose: () => void }) {
  const [text, setText] = useState(String(current));
  const [error, setError] = useState("");
  useEffect(() => {
    if (visible) {
      setText(String(current));
      setError("");
    }
  }, [visible, current]);

  function save() {
    const kg = Number(text.replace(",", "."));
    if (!(kg >= 30 && kg <= 300)) return setError("Вес должен быть от 30 до 300 кг.");
    onSave(Math.round(kg * 10) / 10);
  }

  return (
    <Dialog
      visible={visible}
      title="Взвешивание"
      message="Введи вес в килограммах. ИМТ и график обновятся сами."
      onClose={onClose}
      actions={[
        { label: "Сохранить", onPress: save },
        { label: "Отмена", tone: "secondary", onPress: onClose },
      ]}
    >
      <TextInput value={text} onChangeText={setText} keyboardType="numeric" style={s.input} placeholder="Вес, кг" placeholderTextColor={COLORS.muted} />
      {error ? <Text style={s.error}>{error}</Text> : null}
    </Dialog>
  );
}

const s = StyleSheet.create({
  input: { marginTop: 14, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.line, borderRadius: 14, paddingHorizontal: 16, height: 52, fontSize: 20, fontWeight: "700", color: COLORS.ink },
  error: { color: COLORS.red, fontSize: 14, fontWeight: "600", marginTop: 8 },
});
