import React, { useState } from "react";
import { Linking } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Dialog } from "../Dialog";
import { initialState, validBirthDate } from "../logic";
import { MaxStage } from "../MaxView";
import { COLORS } from "../theme";
import { Btn, Icon, ui } from "../ui";

export const AGREEMENT_TEXT =
  "ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ MAX FIT\
\
" +
  "1. Общие положения. Используя Max Fit, пользователь подтверждает, что ознакомился с условиями и принимает их. Если пользователь не согласен с условиями, он должен прекратить использование приложения.\
\
" +
  "2. Назначение сервиса. Max Fit предоставляет информационные материалы, демонстрации упражнений, игровые механики и инструменты учёта активности. Приложение не является медицинским изделием, медицинской услугой или заменой индивидуальной консультации врача, физиотерапевта либо квалифицированного тренера.\
\
" +
  "3. Безопасность тренировок. Пользователь самостоятельно оценивает своё самочувствие и пригодность к физической нагрузке. Перед началом занятий, особенно при хронических заболеваниях, беременности, травмах, боли или длительном отсутствии активности, рекомендуется получить медицинскую консультацию. Немедленно прекратите занятие при боли, головокружении, одышке, боли в груди или необычном ухудшении самочувствия. Не выполняйте упражнения через боль.\
\
" +
  "4. Персональные данные. В текущей версии имя, параметры тела, настройки и история тренировок сохраняются локально на устройстве пользователя. Приложение не предусматривает учётную запись или серверную синхронизацию. Удаление данных приложения или сброс профиля может привести к потере локальной информации. Не вводите сведения, которые не нужны для использования функций приложения.\
\
" +
  "5. Отказ от гарантий и ответственность. Результаты зависят от индивидуальных особенностей и действий пользователя и не гарантируются. Материалы предоставляются «как есть». В пределах, допускаемых применимым законодательством, разработчик не отвечает за вред, возникший из-за выполнения упражнений вопреки противопоказаниям, неправильной техники, превышения рекомендованной нагрузки или использования приложения не по назначению. Ничто в соглашении не ограничивает права потребителя или ответственность, которые не могут быть ограничены законом.\
\
" +
  "6. Интеллектуальная собственность. Дизайн, тексты, иллюстрации, программный код и иные элементы Max Fit охраняются применимым законодательством. Запрещается копировать, распространять или использовать материалы коммерчески без разрешения правообладателя, кроме случаев, прямо разрешённых законом.\
\
" +
  "7. Изменения и доступность. Функции приложения могут изменяться, приостанавливаться или обновляться. Существенные изменения условий должны быть отражены в актуальной версии соглашения.\
\
" +
  "8. Применимое право и обращения. К отношениям применяется законодательство страны, обязательные нормы которой распространяются на пользователя. По вопросам приложения обращайтесь к разработчику через канал поддержки, указанный в магазине распространения приложения.\
\
" +
  "Правовая справка: GDPR — https://eur-lex.europa.eu/eli/reg/2016/679/oj ; защита прав потребителей ЕС — https://commission.europa.eu/law/law-topic/consumer-protection-law_en . Это ссылки на официальные ресурсы ЕС. Перед публичным релизом необходимо добавить юридическое наименование разработчика, адрес для обращений, отдельную опубликованную Политику конфиденциальности и корректную юрисдикцию.";

export type ProfileInput = { name: string; birthDate: string; height: number; weight: number; trainingExperience: "beginner" | "experienced" };

export function OnboardingScreen({ onDone }: { onDone: (p: ProfileInput) => void }) {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [experience, setExperience] = useState<"beginner" | "experienced">("beginner");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [terms, setTerms] = useState(false);

  const formatBirthDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 8); // Только цифры, макс. 8 штук
    let formatted = '';
    if (cleaned.length > 0) formatted = cleaned.slice(0, 2);
    if (cleaned.length >= 3) formatted += '.' + cleaned.slice(2, 4);
    if (cleaned.length >= 5) formatted += '.' + cleaned.slice(4, 8);
    return formatted;
  };

  function submit() {
    const h = Number(height.replace(",", "."));
    const w = Number(weight.replace(",", "."));
    if (!name.trim()) return setError("Укажи имя, чтобы Макс знал, к кому обращаться.");
    if (!validBirthDate(birth)) return setError("Дата рождения должна быть в формате ДД.ММ.ГГГГ (или оставь поле пустым).");
    if (!(h >= 100 && h <= 250)) return setError("Рост должен быть от 100 до 250 см.");
    if (!(w >= 30 && w <= 300)) return setError("Вес должен быть от 30 до 300 кг.");
    if (!agreed) return setError("Чтобы продолжить, прими пользовательское соглашение.");
    setError("");
    onDone({ name: name.trim(), birthDate: birth.trim(), height: h, weight: w, trainingExperience: experience });
  }

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <View style={s.hero}>
        <MaxStage state={initialState} width={130} />
        <View style={s.bubble}>
          <Text style={s.bubbleText}>Привет! Я Макс. Давай тренироваться вместе!</Text>
        </View>
      </View>

      <Text style={ui.kicker}>Max Fit</Text>
      <Text style={s.title}>Тренируйся и прокачивай Макса</Text>

      <Text style={s.label}>Как тебя зовут?</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Имя" placeholderTextColor={COLORS.muted} style={s.input} />

      <Text style={s.label}>Дата рождения (необязательно)</Text>
      <TextInput 
        value={birth} 
        onChangeText={(text) => setBirth(formatBirthDate(text))}
        keyboardType="number-pad"                                
        maxLength={10}                                           
        placeholder="ДД.ММ.ГГГГ" 
        placeholderTextColor={COLORS.muted} 
        style={s.input} 
      />

      <Text style={s.label}>Занимался(ась) тренировками раньше?</Text>
      <View style={s.choiceRow}>
        <Pressable accessibilityRole="radio" accessibilityState={{ checked: experience === "beginner" }} onPress={() => setExperience("beginner")} style={[s.choice, experience === "beginner" && s.choiceActive]}>
          <Text style={[s.choiceTitle, experience === "beginner" && s.choiceTitleActive]}>Нет, начинаю</Text>
          <Text style={s.choiceText}>Мягкий старт, базовые упражнения и постепенное увеличение нагрузки.</Text>
        </Pressable>
        <Pressable accessibilityRole="radio" accessibilityState={{ checked: experience === "experienced" }} onPress={() => setExperience("experienced")} style={[s.choice, experience === "experienced" && s.choiceActive]}>
          <Text style={[s.choiceTitle, experience === "experienced" && s.choiceTitleActive]}>Да, есть опыт</Text>
          <Text style={s.choiceText}>Более сложные варианты и повышенная нагрузка.</Text>
        </Pressable>
      </View>

      <View style={s.row}>
        <View style={ui.flex}>
          <Text style={s.label}>Рост, см</Text>
          <TextInput value={height} onChangeText={setHeight} keyboardType="numeric" style={s.input} />
        </View>
        <View style={ui.flex}>
          <Text style={s.label}>Вес, кг</Text>
          <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" style={s.input} />
        </View>
      </View>
      {Number(height.replace(",", ".")) >= 100 && Number(weight.replace(",", ".")) > 0 &&
        Number(weight.replace(",", ".")) / Math.pow(Number(height.replace(",", ".")) / 100, 2) >= 30 && (
          <Text style={s.weightNotice}>Для начала приложение предложит щадящую ходьбу и низкоударное кардио. ИМТ — только ориентир, не диагноз; при сомнениях по здоровью обсуди нагрузку с врачом.</Text>
        )}

      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => setAgreed(!agreed)} style={s.agreeRow}>
        <View style={[s.box, agreed && { backgroundColor: COLORS.green, borderColor: COLORS.green }]}>
          {agreed && <Icon name="check-bold" size={16} color={COLORS.onAccent} />}
        </View>
        <Text style={s.agreeText}>
          Принимаю{" "}
          <Text style={s.link} onPress={() => setTerms(true)}>
            пользовательское соглашение
          </Text>
        </Text>
      </Pressable>

      {error ? <Text style={s.error}>{error}</Text> : null}
      <Btn label="Начать путь" onPress={submit} style={{ marginTop: 14 }} />

      <Dialog visible={terms} title="Пользовательское соглашение" message={AGREEMENT_TEXT} onClose={() => setTerms(false)} actions={[{ label: "Понятно", onPress: () => setTerms(false) }]}>
        <Text style={s.link} onPress={() => Linking.openURL("https://eur-lex.europa.eu/eli/reg/2016/679/oj")}>Открыть официальный текст GDPR</Text>
        <Text style={s.link} onPress={() => Linking.openURL("https://commission.europa.eu/law/law-topic/consumer-protection-law_en")}>Права потребителей ЕС</Text>
      </Dialog>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 24, paddingTop: 40, paddingBottom: 40 },
  hero: { alignItems: "center", marginBottom: 22 },
  bubble: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 16, marginTop: 12 },
  bubbleText: { color: COLORS.ink, fontSize: 16, fontWeight: "700", textAlign: "center" },
  title: { fontSize: 30, lineHeight: 36, fontWeight: "800", color: COLORS.ink, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.muted, marginBottom: 7, marginTop: 8 },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line, borderRadius: 14, paddingHorizontal: 16, height: 52, fontSize: 17, fontWeight: "600", color: COLORS.ink, marginBottom: 6 },
  row: { flexDirection: "row", gap: 12 },
  choiceRow: { flexDirection: "row", gap: 10 },
  choice: { flex: 1, borderWidth: 1, borderColor: COLORS.line, borderRadius: 14, padding: 12, backgroundColor: COLORS.card },
  choiceActive: { borderColor: COLORS.green, backgroundColor: COLORS.green + "12" },
  choiceTitle: { color: COLORS.ink, fontSize: 14, fontWeight: "800" },
  choiceTitleActive: { color: COLORS.green },
  choiceText: { color: COLORS.muted, fontSize: 12, lineHeight: 17, marginTop: 5 },
  agreeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 18 },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: COLORS.line, alignItems: "center", justifyContent: "center" },
  agreeText: { flex: 1, color: COLORS.ink, fontSize: 15, fontWeight: "500" },
  link: { color: COLORS.blue, textDecorationLine: "underline", fontWeight: "700" },
  error: { color: COLORS.red, fontSize: 14, fontWeight: "600", marginTop: 12 },
  weightNotice: { color: COLORS.blue, fontSize: 13, lineHeight: 19, marginTop: 8, padding: 12, backgroundColor: COLORS.blue + "12", borderRadius: 12 },
});
