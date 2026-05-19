import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type Props = {
  recipientName: string;
  programTitle: string;
  programSubtitle: string | null;
  moduleCount: number;
  completedAt: Date;
  certificateNumber: string;
};

// Brand colors mirrored from app/globals.css
const NAVY = "#1A2332";
const GOLD = "#B8943F";
const CREAM = "#FAF6EF";
const LINE = "#E5DFD0";
const MUTED = "#6B7280";

const styles = StyleSheet.create({
  page: {
    backgroundColor: CREAM,
    padding: 40,
    fontFamily: "Helvetica",
    color: NAVY,
  },
  border: {
    flex: 1,
    border: `2px solid ${NAVY}`,
    padding: 36,
    position: "relative",
  },
  innerBorder: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    border: `0.5px solid ${GOLD}`,
  },
  brand: {
    fontFamily: "Courier",
    fontSize: 9,
    letterSpacing: 2,
    color: GOLD,
    textTransform: "uppercase",
  },
  brandRow: { flexDirection: "row", justifyContent: "space-between" },
  preTitle: {
    fontFamily: "Courier",
    fontSize: 10,
    letterSpacing: 3,
    color: GOLD,
    textTransform: "uppercase",
    marginTop: 80,
  },
  title: {
    fontFamily: "Times-Roman",
    fontSize: 56,
    marginTop: 10,
    color: NAVY,
  },
  rule: {
    borderBottom: `0.5px solid ${LINE}`,
    marginVertical: 24,
    width: 280,
  },
  awardedTo: {
    fontFamily: "Times-Italic",
    fontSize: 14,
    color: MUTED,
  },
  recipientName: {
    fontFamily: "Times-Roman",
    fontSize: 40,
    marginTop: 6,
    color: NAVY,
  },
  body: {
    fontFamily: "Helvetica",
    fontSize: 12,
    color: NAVY,
    marginTop: 32,
    maxWidth: 540,
    lineHeight: 1.6,
  },
  bodyEm: { color: GOLD },
  bottomRow: {
    position: "absolute",
    bottom: 36,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  metaLabel: {
    fontFamily: "Courier",
    fontSize: 8,
    letterSpacing: 2,
    color: MUTED,
    textTransform: "uppercase",
  },
  metaValue: {
    fontFamily: "Times-Roman",
    fontSize: 12,
    color: NAVY,
    marginTop: 4,
  },
  certNumber: {
    fontFamily: "Courier",
    fontSize: 9,
    color: MUTED,
    letterSpacing: 1,
  },
});

export function CertificateDocument({
  recipientName,
  programTitle,
  programSubtitle,
  moduleCount,
  completedAt,
  certificateNumber,
}: Props) {
  const completedStr = completedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <Document title={`Certificate of Completion — ${programTitle}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.innerBorder} />
          <View style={styles.brandRow}>
            <Text style={styles.brand}>
              Seven Generation <Text style={{ color: NAVY }}>/ Learning</Text>
            </Text>
            <Text style={styles.brand}>Certificate {certificateNumber}</Text>
          </View>

          <Text style={styles.preTitle}>Certificate of Completion</Text>
          <Text style={styles.title}>{programTitle}</Text>
          <View style={styles.rule} />

          <Text style={styles.awardedTo}>This certifies that</Text>
          <Text style={styles.recipientName}>{recipientName}</Text>

          <Text style={styles.body}>
            has successfully completed{" "}
            <Text style={styles.bodyEm}>all {moduleCount} modules</Text> of the{" "}
            <Text style={styles.bodyEm}>{programTitle}</Text> program at Seven
            Generation Group
            {programSubtitle ? ` — ${programSubtitle.toLowerCase()}` : ""}.
          </Text>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.metaLabel}>Completed</Text>
              <Text style={styles.metaValue}>{completedStr}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Issued by</Text>
              <Text style={styles.metaValue}>Seven Generation Group · HR</Text>
            </View>
            <Text style={styles.certNumber}>{certificateNumber}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
