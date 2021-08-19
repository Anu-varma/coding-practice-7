const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

convertingPlayerDetails = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

convertingMatchDetails = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

// app.get("/players/", async (request, response) => {
//   const getPlayersQuery = `
//     select * from player_details;
//     `;
//   const dbUser = await db.all(getPlayersQuery);
//   response.send(dbUser);
// });

// app.get("/matches/", async (request, response) => {
//   const getPlayersQuery = `
//     select * from match_details;
//     `;
//   const dbUser = await db.all(getPlayersQuery);
//   response.send(dbUser);
// });

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    select * from player_details;
    `;
  const dbUser = await db.all(getPlayersQuery);
  response.send(
    dbUser.map((eachPlayer) => convertingPlayerDetails(eachPlayer))
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
    select * from player_details where player_id = ${playerId};
    `;
  const dbUser = await db.get(getPlayersQuery);
  response.send(convertingPlayerDetails(dbUser));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName } = request.body;
  const { playerId } = request.params;

  const updatePlayerQuery = `
    update player_details set
    player_name = "${playerName}";
    `;

  const dbUser = await db.run(updatePlayerQuery);

  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersQuery = `
    select * from match_details where match_id = ${matchId};
    `;
  const dbUser = await db.get(getPlayersQuery);
  response.send(convertingMatchDetails(dbUser));
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersMatchQuery = `
    select * from player_match_score join match_details 
    where player_id = ${playerId};
    `;
  const dbUser = await db.all(getPlayersMatchQuery);
  response.send(dbUser.map((eachMatch) => convertingMatchDetails(eachMatch)));
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersMatchQuery = `
    select * from player_match_score join player_details 
    where match_id = ${matchId};
    `;
  const dbUser = await db.all(getPlayersMatchQuery);
  response.send(
    dbUser.map((eachPlayer) => convertingPlayerDetails(eachPlayer))
  );
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getmatchPlayersQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      sum(score) AS totalScore,
      sum(fours) AS totalFours,
      sum(sixes) AS totalSixes
    FROM player_match_score
       NATURAL JOIN player_details
    WHERE
      player_id = ${playerId};`;
  const dbUser = await db.all(getmatchPlayersQuery);
  response.send(dbUser);
});

module.exports = app;
