import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "./theme";
import { Btn } from "./ui";

export type DialogAction = { label: string; tone?: "primary" | "secondary" | "ghost"; onPress: () => void };

// In-app dialog. Alert.alert does nothing in the web build, so every confirmation uses this instead.
export function Dialog({
  visible,
  title,
  message,
  children,
  actions,
  onClose,
}: {
  visible: boolean;
  title: string;
  message?: string;
  children?: React.ReactNode;
  actions: DialogAction[];
  onClose: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.card} onPress={() => {}}>
          <Text style={s.title}>{title}</Text>
          {message ? <ScrollView style={s.messageScroll} nestedScrollEnabled><Text style={s.message}>{message}</Text></ScrollView> : null}
          {children}
          <View style={s.actions}>
            {actions.map((a) => (
              <Btn key={a.label} label={a.label} tone={a.tone ?? "primary"} onPress={a.onPress} />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(5,8,12,0.78)", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 420, backgroundColor: COLORS.card, borderRadius: 22, borderWidth: 1, borderColor: COLORS.line, padding: 20 },
  title: { color: COLORS.ink, fontSize: 20, fontWeight: "800" },
  messageScroll: { maxHeight: "62%", marginTop: 8 },
  message: { color: COLORS.muted, fontSize: 15, lineHeight: 22, fontWeight: "500" },
  actions: { gap: 8, marginTop: 18 },
});
