const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// get the list of all the movies in the database (movies table)
//API 1

const convertDbObject = (eachObject) => {
  return {
    movieName: eachObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`;
  const getMoviesQueryResponse = await db.all(getMoviesQuery);
  response.send(
    getMoviesQueryResponse.map((eachMovie) => convertDbObject(eachMovie))
  );
});

//API 2
// create a movie record in movies table in moviesData.db

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
          VALUES(${directorId},'${movieName}','${leadActor}');`;
  const createMovieQueryResponse = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3
//Returns a movie based on the movie ID
const movieDetailResponse = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const responseMovieObject = await db.get(getMovieDetailQuery);
  response.send(movieDetailResponse(responseMovieObject));
});

//API 4
//Updates the details of a movie in the movie table based on the movie ID
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie
    SET director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  const updateMovieDetails = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
//Deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie 
    WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
//Returns a list of all directors in the director table

const convertDirectorResponse = (eachObject) => {
  return {
    directorId: eachObject.director_id,
    directorName: eachObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT *
    FROM director;`;
  const directorQueryResponse = await db.all(getDirectorQuery);
  response.send(
    directorQueryResponse.map((eachObject) =>
      convertDirectorResponse(eachObject)
    )
  );
});

//API 7
//Returns a list of all movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
    SELECT movie_name as movieName
    FROM movie
    WHERE director_id = ${directorId};`;
  const directorMovieResponse = await db.all(getDirectorMovieQuery);
  response.send(directorMovieResponse);
});

module.exports = app;
