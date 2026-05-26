import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type Props = {
  recipientName: string;
  moduleNumber: string;
  moduleTitle: string;
  moduleLevel: string;
  programTitle: string;
  completedAt: Date;
  certificateNumber: string;
};

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
    marginTop: 60,
  },
  programLine: {
    fontFamily: "Helvetica",
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
  },
  title: {
    fontFamily: "Times-Roman",
    fontSize: 44,
    marginTop: 10,
    color: NAVY,
  },
  rule: {
    borderBottom: `0.5px solid ${LINE}`,
    marginVertical: 22,
    width: 280,
  },
  awardedTo: {
    fontFamily: "Times-Italic",
    fontSize: 14,
    color: MUTED,
  },
  recipientName: {
    fontFamily: "Times-Roman",
    fontSize: 36,
    marginTop: 6,
    color: NAVY,
  },
  body: {
    fontFamily: "Helvetica",
    fontSize: 12,
    color: NAVY,
    marginTop: 24,
    maxWidth: 560,
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

const LEVEL_LABEL: Record<string, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  MASTERY: "Mastery",
};

export function ModuleCertificateDocument({
  recipientName,
  moduleNumber,
  moduleTitle,
  moduleLevel,
  programTitle,
  completedAt,
  certificateNumber,
}: Props) {
  const completedStr = completedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const cleanTitle = moduleTitle.replace(/\.\s*$/, "");
  return (
    <Document title={`Module ${moduleNumber} — ${cleanTitle}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.innerBorder} />
          <View style={styles.brandRow}>
            <Text style={styles.brand}>
              Seven Generation <Text style={{ color: NAVY }}>/ Learning</Text>
            </Text>
            <Text style={styles.brand}>Certificate {certificateNumber}</Text>
          </View>

          <Text style={styles.preTitle}>
            Module {moduleNumber} · {LEVEL_LABEL[moduleLevel] ?? moduleLevel}
          </Text>
          <Text style={styles.title}>{cleanTitle}</Text>
          <Text style={styles.programLine}>
            of the {programTitle} program
          </Text>
          <View style={styles.rule} />

          <Text style={styles.awardedTo}>Completed by</Text>
          <Text style={styles.recipientName}>{recipientName}</Text>

          <Text style={styles.body}>
            in recognition of finishing{" "}
            <Text style={styles.bodyEm}>
              Module {moduleNumber} — {cleanTitle}
            </Text>{" "}
            at Seven Generation Group. One down — keep going.
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
