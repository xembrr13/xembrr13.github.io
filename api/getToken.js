// api/getToken.js
export default async function handler(req, res) {
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;

  const tokenRes = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, {
    method: "POST"
  });
  const data = await tokenRes.json();

  res.status(200).json({ access_token: data.access_token });
}
