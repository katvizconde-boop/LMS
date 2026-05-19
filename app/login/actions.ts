"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export type LoginState = {
  error?: string;
  email?: string;
};

export async function requestMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address.", email };
  }
  try {
    await signIn("resend", {
      email,
      redirectTo: "/dashboard",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.type === "AccessDenied") {
        return {
          error:
            "That email isn't enrolled. Ask HR to add you to a program.",
          email,
        };
      }
      return {
        error: "Couldn't send the link. Try again in a moment.",
        email,
      };
    }
    // Next.js redirects throw — let them propagate.
    throw e;
  }
  return { email };
}
