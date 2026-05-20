import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export default function DatenschutzScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Datenschutzerklärung</Text>
      <Text style={styles.sub}>Stand: Mai 2026</Text>

      <View style={styles.section}>
        <Text style={styles.label}>1. Verantwortlicher</Text>
        <Text style={styles.text}>
          Manuel Sollmann{'\n'}Am Auweg 15{'\n'}97535 Wasserlosen{'\n'}E-Mail: manuel@aum-online.de
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>2. Erhobene Daten</Text>
        <Text style={styles.text}>
          Bei der Registrierung erfassen wir folgende personenbezogene Daten:{'\n\n'}
          • Vorname und Nachname{'\n'}
          • E-Mail-Adresse{'\n'}
          • Optionale Telefonnummer{'\n\n'}
          Bei der Nutzung der App werden zusätzlich gespeichert:{'\n\n'}
          • Vereinsmitgliedschaften und -rollen{'\n'}
          • Anmeldungen zu Veranstaltungen und Helfereinsätzen{'\n'}
          • Push-Token für Benachrichtigungen (nur bei Zustimmung){'\n'}
          • Erstellte Inhalte (Neuigkeiten, Veranstaltungen, Helferlisten)
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>3. Zweck der Datenverarbeitung</Text>
        <Text style={styles.text}>
          Die erhobenen Daten dienen ausschließlich dem Betrieb der Dorfgemeinschafts-App für Schwemmelsbach. Dies umfasst:{'\n\n'}
          • Bereitstellung des Nutzerkontos und der App-Funktionen{'\n'}
          • Verwaltung von Vereinsmitgliedschaften{'\n'}
          • Koordination von Veranstaltungen und Helfereinsätzen{'\n'}
          • Versand von Push-Benachrichtigungen über relevante Ereignisse
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>4. Rechtsgrundlage</Text>
        <Text style={styles.text}>
          Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) für die Nutzung der App-Funktionen sowie Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) für den Versand von Push-Benachrichtigungen.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>5. Hosting & Auftragsverarbeiter</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Supabase (Datenbank & Authentifizierung){'\n'}</Text>
          Supabase Inc., 970 Toa Payoh North, Singapur. Unsere Daten werden ausschließlich in der EU-Region Frankfurt (Deutschland) gespeichert. Supabase ist als Auftragsverarbeiter gemäß Art. 28 DSGVO tätig.{'\n\n'}
          <Text style={styles.bold}>Vercel (Web-Hosting){'\n'}</Text>
          Vercel Inc., 340 Pine Street, San Francisco, USA. Vercel hostet ausschließlich den Programmcode der Web-Version. Keine Nutzerdaten werden bei Vercel gespeichert.{'\n\n'}
          <Text style={styles.bold}>Expo (Push-Benachrichtigungen){'\n'}</Text>
          650 Industries Inc. (Expo), USA. Push-Token werden über den Expo Push Notification Service weitergeleitet. Es werden keine personenbezogenen Inhalte übertragen.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>6. Weitergabe an Dritte</Text>
        <Text style={styles.text}>
          Eine Weitergabe Ihrer personenbezogenen Daten an Dritte findet nicht statt, mit Ausnahme der unter Punkt 5 genannten Auftragsverarbeiter, die für den technischen Betrieb der App notwendig sind.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>7. Speicherdauer</Text>
        <Text style={styles.text}>
          Ihre Daten werden gespeichert, solange Ihr Nutzerkonto aktiv ist. Bei Löschung des Kontos werden alle personenbezogenen Daten binnen 30 Tagen entfernt. Push-Token werden bei Abmeldung sofort gelöscht.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>8. Ihre Rechte</Text>
        <Text style={styles.text}>
          Sie haben gemäß DSGVO folgende Rechte:{'\n\n'}
          • <Text style={styles.bold}>Auskunft</Text> (Art. 15) — Welche Daten wir über Sie speichern{'\n'}
          • <Text style={styles.bold}>Berichtigung</Text> (Art. 16) — Korrektur unrichtiger Daten{'\n'}
          • <Text style={styles.bold}>Löschung</Text> (Art. 17) — Löschung Ihrer Daten{'\n'}
          • <Text style={styles.bold}>Einschränkung</Text> (Art. 18) — Eingeschränkte Verarbeitung{'\n'}
          • <Text style={styles.bold}>Widerspruch</Text> (Art. 21) — Widerspruch gegen die Verarbeitung{'\n'}
          • <Text style={styles.bold}>Datenübertragbarkeit</Text> (Art. 20) — Export Ihrer Daten{'\n\n'}
          Zur Ausübung Ihrer Rechte wenden Sie sich an: manuel@aum-online.de{'\n\n'}
          Sie haben zudem das Recht, sich bei der zuständigen Aufsichtsbehörde zu beschweren. Für Bayern ist dies das Bayerische Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>9. Bilder und Medien</Text>
        <Text style={styles.text}>
          Das Hochladen von Bildern ist ausschließlich Administratoren und Vereinsadministratoren vorbehalten. Hochgeladene Bilder sind für alle App-Nutzer sichtbar. Bitte laden Sie keine Bilder hoch, die Personen ohne deren Einwilligung zeigen.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>10. Änderungen</Text>
        <Text style={styles.text}>
          Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die aktuelle Version ist stets in der App abrufbar.
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
  text: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd, lineHeight: 26 },
  bold: { fontWeight: '700', color: Theme.colors.textPrimary },
});
