import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export default function ImpressumScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Impressum</Text>
      <Text style={styles.sub}>Angaben gemäß § 5 TMG</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Betreiber</Text>
        <Text style={styles.text}>Manuel Sollmann{'\n'}Am Auweg 15{'\n'}97535 Wasserlosen</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Kontakt</Text>
        <Text style={styles.text}>E-Mail: manuel@aum-online.de</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Hinweis</Text>
        <Text style={styles.text}>
          Diese App ist ein nicht-kommerzielles Angebot für die Dorfgemeinschaft Schwemmelsbach. Sie dient der internen Kommunikation und Organisation von Vereinen und Veranstaltungen.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Haftungsausschluss</Text>
        <Text style={styles.text}>
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.{'\n\n'}Die Inhalte dieser App werden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.lg, gap: Theme.spacing.lg, paddingBottom: 60 },
  heading: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeXl, fontWeight: Theme.font.weightBold },
  sub: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm, marginTop: -Theme.spacing.sm },
  section: { gap: 8 },
  label: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, textTransform: 'uppercase', letterSpacing: 0.5 },
  text: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd, lineHeight: 24 },
});
