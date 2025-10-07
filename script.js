const CLIENT_ID = "5wvogctgh8m91o9xx5f5d425gk4aap"; // публичный Client ID Twitch

async function getToken() {
  // Запрашиваем токен у сервера
  const res = await fetch('/api/getToken');
  const data = await res.json();
  return data.access_token;
}

async function getCategoryId(token, name) {
  const res = await fetch(`https://api.twitch.tv/helix/games?name=${encodeURIComponent(name)}`, {
    headers: {
      "Client-ID": CLIENT_ID,
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!data.data || data.data.length === 0) throw new Error("категория не найдена");
  return data.data[0].id;
}

async function getStreams(token, game_id) {
  let url = `https://api.twitch.tv/helix/streams?game_id=${game_id}&first=100&language=ru`;
  let all = [];
  while (url) {
    const res = await fetch(url, {
      headers: {
        "Client-ID": CLIENT_ID,
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();
    all.push(...data.data);
    if (data.pagination && data.pagination.cursor) {
      url = `https://api.twitch.tv/helix/streams?game_id=${game_id}&first=100&language=ru&after=${data.pagination.cursor}`;
    } else {
      url = null;
    }
  }
  return all;
}

async function findChannels() {
  const status = document.getElementById("status");
  const progress = document.getElementById("progress");
  const tableBody = document.querySelector("#resultTable tbody");
  const category = document.getElementById("categoryInput").value.trim() || "Just Chatting";
  const limit = parseInt(document.getElementById("limitSelect")?.value) || 20;

  status.textContent = "загрузка...";
  progress.style.setProperty("--progress", "20%");
  tableBody.innerHTML = "";

  try {
    const token = await getToken(); // обязательно сохраняем токен в локальную переменную
    progress.style.setProperty("--progress", "40%");
    const gameId = await getCategoryId(token, category); // передаём token сюда
    progress.style.setProperty("--progress", "60%");
    const streams = await getStreams(token, gameId); // и сюда тоже
    progress.style.setProperty("--progress", "100%");

    if (streams.length === 0) {
      status.textContent = "стримов не найдено";
      return;
    }

    const sorted = streams
      .sort((a, b) => b.viewer_count - a.viewer_count)
      .slice(0, limit);

    sorted.forEach(s => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.user_name}</td>
        <td>${s.viewer_count}</td>
        <td><a href="https://twitch.tv/${s.user_name}" target="_blank">смотреть</a></td>
      `;
      tableBody.appendChild(row);
    });

    status.textContent = `найдено ${sorted.length} каналов в категории "${category}" (RU)`;
  } catch (e) {
    status.textContent = "ошибка: " + e.message;
  }
}
