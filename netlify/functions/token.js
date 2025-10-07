// netlify/functions/token.js

export async function handler(event, context) {
  const CLIENT_ID = "grcjha6zinobdax6ew0gt5bqqybigx";
  const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET; // берём секрет из переменной окружения

  try {
    const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, {
      method: "POST"
    });
    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // чтобы можно было вызывать из GitHub Pages
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
