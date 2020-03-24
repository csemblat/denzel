const imdb = require('./imdb');
const DENZEL_IMDB_ID = 'nm0000243';
const METASCORE = 70;
const fs = require('fs');
const {MongoClient} = require('mongodb');
var assert = require('assert');
const mongo_url = 'mongodb://127.0.0.1:27017'; //url for local mongo_client

async function start (actor = DENZEL_IMDB_ID, metascore = METASCORE) { //modified version of sandbox.js that writes movies of an actor to a json file
  try {
    const movies = await imdb(actor);
    console.log(JSON.stringify(movies, null, 2));
	fs.writeFileSync('denzel_movies.json', JSON.stringify(movies) );
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

function random_integer(ceiling) //gives a random integer between 0 and ceiling
{
	var rand = Math.floor((Math.random() * ceiling));
	return rand
}

async function insert_actor_movies(actor){  //populates mongo db with movies that have a specific actor in them
	const client = new MongoClient(mongo_url ,  { useNewUrlParser: true, useUnifiedTopology: true });
	try {
	var mov_list = await imdb(actor);
	for(let i = 0; i < mov_list.length; i++) //we add the id of the actor in a list of actors that played in the movies for future use
	{
		if(mov_list[i].hasOwnProperty("actor"))
		{
			mov_list[i]["actor"].push(actor);
		}
		else{
			mov_list[i]["actor"] = [];
			mov_list[i].actor.push(actor);
		}
	}
    await client.connect();
	const result = await client.db("movies").collection("inserts").insertMany(mov_list);
	return { "inserted" :  result.insertedCount};
	} catch (e) {
    console.error(e);
	}
	 finally {
        await client.close();
    }

}

async function find_mustwatch_movies(){ //gives a random must-watch movie from the mongodb
	const client = new MongoClient(mongo_url ,  { useNewUrlParser: true, useUnifiedTopology: true });
	try {
    await client.connect();
	const cursor = client.db("movies").collection("inserts").find({"metascore" : {$gte : 70}});
	var result = await cursor.toArray();
	//console.log(result);
	var rando_int = random_integer(result.length);
	//console.log(rando_int);
	var final_result = result[rando_int];
	return final_result;
	} catch (e) {
    console.error(e);
	}
	 finally {
        await client.close();
    }
}

async function find_specific_movies(id){ //gives a specific movie
	const client = new MongoClient(mongo_url ,  { useNewUrlParser: true, useUnifiedTopology: true });
	try {
    await client.connect();
	const result = await client.db("movies").collection("inserts").findOne({"id" : id})
	//console.log(result);
	return result;
	} catch (e) {
    console.error(e);
	}
	 finally {
        await client.close();
    }
}

async function search_movies(limit, min_metascore){ //search a number of movies (limit being the number of movies) with a metascore greater or equal to min_metascore
	const client = new MongoClient(mongo_url ,  { useNewUrlParser: true, useUnifiedTopology: true });
	try {
    await client.connect();
	const cursor = client.db("movies").collection("inserts").find({"metascore" : {$gte : min_metascore}}).sort({"metascore": -1}).limit( limit );
	var result = await cursor.toArray();
	//console.log("result : " + result[0].metascore);
	return result;
	} catch (e) {
    console.error(e);
	}
	 finally {
        await client.close();
    }
}

async function post_review(id, review, review_date){ //saves a review into the db
	const client = new MongoClient(mongo_url ,  { useNewUrlParser: true, useUnifiedTopology: true });
	try {
    await client.connect();
	var result = await  client.db("movies").collection("inserts").updateOne({ "id" : id }, { $set: {"review" : review , "review_date" : review_date}}, {upsert: true} );
	//console.log(result);
	return result;
	} catch (e) {
    console.error(e);
	}
	 finally {
        await client.close();
    }
}
module.exports = { insert_actor_movies , find_mustwatch_movies , find_specific_movies, search_movies , post_review}
//start(actor = DENZEL_IMDB_ID, METASCORE);
//search_movies(2, 10);
//insert_actor_movies(DENZEL_IMDB_ID);