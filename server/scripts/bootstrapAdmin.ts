import "dotenv/config";
import admin from "../firebaseAdmin";

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in the server environment before bootstrapping.",
    );
  }

  if (password.length < 6) {
    throw new Error("SUPER_ADMIN_PASSWORD must contain at least 6 characters.");
  }

  let user;
  try {
    user = await admin.auth().getUserByEmail(email);
    console.log(`Found existing Firebase user ${user.uid} (${email}).`);
    user = await admin.auth().updateUser(user.uid, {
      password,
      emailVerified: true,
    });
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: unknown }).code)
        : "";

    if (code !== "auth/user-not-found") throw error;

    user = await admin.auth().createUser({
      email,
      password,
      emailVerified: true,
    });
    console.log(`Created Firebase user ${user.uid} (${email}).`);
  }

  const claims = { ...(user.customClaims ?? {}), admin: true };
  await admin.auth().setCustomUserClaims(user.uid, claims);

  console.log(`Granted admin access to ${user.uid} (${email}).`);
  console.log("The user must sign out and sign in again for the claim to take effect.");
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
