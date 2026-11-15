import admin from "../firebaseAdmin";

/**
 * Grants or revokes the admin claim.
 *
 *   npm run admin:grant -- <uid-or-email>
 *   npm run admin:claim -- <uid-or-email> --revoke
 *
 * The affected user must refresh their ID token (sign out and back in) before
 * the claim appears on the client and in server requests.
 */
async function main() {
  const args = process.argv.slice(2);
  const target = args.find((arg) => !arg.startsWith("--"));
  const revoke = args.includes("--revoke");

  if (!target) {
    console.error("Usage: npm run admin:claim -- <uid-or-email> [--revoke]");
    process.exit(1);
  }

  const user = target.includes("@")
    ? await admin.auth().getUserByEmail(target)
    : await admin.auth().getUser(target);

  const claims = { ...(user.customClaims ?? {}), admin: revoke ? false : true };
  await admin.auth().setCustomUserClaims(user.uid, claims);

  console.log(
    `${revoke ? "Revoked" : "Granted"} admin claim for ${user.uid} (${user.email ?? "no email"})`,
  );
  console.log("The user must sign out and sign in again for the claim to take effect.");
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
