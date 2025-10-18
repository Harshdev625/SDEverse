const { OAuth2Client } = require('google-auth-library');

let oauthClient;

function getClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('[Google] Missing GOOGLE_CLIENT_ID env variable');
    throw new Error('Missing GOOGLE_CLIENT_ID env');
  }
  if (!oauthClient) {
    oauthClient = new OAuth2Client(clientId);
  }
  return oauthClient;
}

async function verifyGoogleIdToken(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('[Google] Missing GOOGLE_CLIENT_ID env variable');
    throw new Error('Missing GOOGLE_CLIENT_ID env');
  }
  console.log('[Google] Verifying token with client ID:', clientId);
  try {
    const client = getClient();
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();
    console.log('[Google] Token verified successfully for:', payload.email);
    return payload;
  } catch (error) {
    console.error('[Google] Token verification failed:', error.message);
    throw error;
  }
}

module.exports = { verifyGoogleIdToken };
