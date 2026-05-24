"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export type LoginState = {
  error?: string;
  email?: string;
};

export async function passwordSignIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address.", email };
  }
  if (!password) {
    return { error: "Enter your password.", email };
  }
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return {
        error: "Email or password is incorrect. Try again, or ask your admin to reset it.",
        email,
      };
    }
    // Next.js redirects throw — let them propagate.
    throw e;
  }
  return { email };
}
