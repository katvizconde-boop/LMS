import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { checkCertificateEligibility } from "@/lib/certificate";
import { CertificateDocument } from "@/components/certificate/CertificateDocument";

export const runtime = "nodejs";

type Params = { programId: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { programId } = await params;
  const eligibility = await checkCertificateEligibility(
    session.user.id,
    programId,
  );

  if (!eligibility.ok) {
    const status =
      eligibility.reason === "not_found"
        ? 404
        : eligibility.reason === "not_enrolled"
          ? 403
          : 409;
    return NextResponse.json(
      { error: `Certificate not available: ${eligibility.reason}` },
      { status },
    );
  }

  const buffer = await renderToBuffer(
    <CertificateDocument
      recipientName={eligibility.user.name ?? eligibility.user.email}
      programTitle={eligibility.program.title}
      programSubtitle={eligibility.program.subtitle}
      moduleCount={eligibility.moduleCount}
      completedAt={eligibility.completedAt}
      certificateNumber={eligibility.number}
    />,
  );

  const filename = `certificate-${eligibility.program.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}-${eligibility.number}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
