import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { checkModuleCertificateEligibility } from "@/lib/certificate-module";
import { ModuleCertificateDocument } from "@/components/certificate/ModuleCertificateDocument";

export const runtime = "nodejs";

type Params = { moduleId: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { moduleId } = await params;
  const eligibility = await checkModuleCertificateEligibility(
    session.user.id,
    moduleId,
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
    <ModuleCertificateDocument
      recipientName={eligibility.user.name ?? eligibility.user.email}
      moduleNumber={eligibility.module.number}
      moduleTitle={eligibility.module.title}
      moduleLevel={eligibility.module.level}
      programTitle={eligibility.program.title}
      completedAt={eligibility.completedAt}
      certificateNumber={eligibility.number}
    />,
  );

  const filename = `module-${eligibility.module.number}-${eligibility.module.title
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
