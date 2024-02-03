import { SignJWT } from 'jose';
import { createPrivateKey } from 'crypto';

// interface generateSecretArgs {
//   teamId: string;
//   privateKey: string;
//   clientId: string;
//   keyId: string;
//   expiresIn?: number;
// }

export async function generateSecret({ teamId, privateKey, clientId, keyId, expiresIn = 86400 * 180 }) {
  const exp = Math.ceil(Date.now() / 1000) + expiresIn;

  /**
   * How long is the secret valid in seconds.
   * @default 15780000
   */
  const expiresAt = Math.ceil(Date.now() / 1000) + expiresIn;
  const expirationTime = exp ?? expiresAt;
  console.log(`Apple client secret generated. Valid until: ${new Date(expirationTime * 1000)}`);
  return new SignJWT({})
    .setAudience('https://appleid.apple.com')
    .setIssuer(teamId)
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .setSubject(clientId)
    .setProtectedHeader({ alg: 'ES256', kid: keyId, typ: 'JWT' })
    .sign(createPrivateKey(privateKey.replace(/\\n/g, '\n')));
}

if (process.env.APPLE_TEAM_ID && process.env.APPLE_PRIVATE_KEY && process.env.APPLE_CLIENT_ID && process.env.APPLE_KEY_ID) {
  console.log(
    await generateSecret({
      teamId: process.env.APPLE_TEAM_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY,
      clientId: process.env.APPLE_CLIENT_ID,
      keyId: process.env.APPLE_KEY_ID,
    }),
  );
} else {
  const missingVars = ['APPLE_TEAM_ID', 'APPLE_PRIVATE_KEY', 'APPLE_CLIENT_ID', 'APPLE_KEY_ID']
    .filter((varName) => !process.env[varName])
    .join(', ');
  console.error(`The following required environment variables are missing: ${missingVars}.`);
}
