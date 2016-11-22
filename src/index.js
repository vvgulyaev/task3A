import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'
import Promise from 'bluebird'
//import _ from 'lodash';
import bodyParser from 'body-parser'
import saveDataInDb from './saveDataInDb'
import Pet from './models/Pet';
import User from './models/User';

mongoose.Promise = Promise;
mongoose.connect('mongodb://publicdb.mgbeta.ru/vvgulyaev_skb3')

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/users', async (req, res) => {
	const users = await User.find();
	return res.json(users);
});

app.get('/pets', async (req, res) => {
	const pets = await Pet.find().populate('owner');
	return res.json(pets);
});

app.post('/data', async (req, res) => {
	const data = req.body;
	console.log(data);
	if (!data.user) return res.status(400).send('user required');
	if (!data.pets) data.pets = [];
	try {
		const result = await saveDataInDb(data);
		return res.json(result);
	} catch (err){
		return res.status(500).json(err);
	}
});

var request = require("request")
var _ = require('lodash-getpath'); // import lodash with the mixin provided

var pcUrl = "https://gist.githubusercontent.com/isuvorov/ce6b8d87983611482aac89f6d7bc0037/raw/pc.json";
var baseURL = '/task3A/';
let pc = {};

request({
    url: pcUrl,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        //console.log(body) // Print the json response
        pc = body;
    }
})

function getVolumes(pc){
	let result = {};
	pc.hdd.forEach((drive) => {
		if (result.hasOwnProperty(drive.volume)){
			result[drive.volume]	+= drive.size;
		}
		else{
			result[drive.volume]	= drive.size;
		}
	}); 
    for (let drive in result) {
        result[drive] += 'B';
    }
	return result;
}

app.get(baseURL + '*', async (req, res) => {
	var struct_path = req.path.replace(baseURL, "");
	struct_path = struct_path.replace(/\/$/g, "");
	struct_path = struct_path.replace(/\./g, "");
	struct_path = struct_path.replace(/\[./g, "");
	struct_path = struct_path.replace(/\]./g, "");
	struct_path = struct_path.replace(/\//g, ".");
	console.log(struct_path);
	var fields = struct_path.split(".");
	var output_value = _.getPath(pc, struct_path);
	console.log(fields);
	if ((!fields[0])&&(fields.length==1)){
		return res.json(pc);
	}
	else if ((fields[0]=='volumes') && (fields.length==1))	{
		res.status(200).json(getVolumes(pc));
	}
	else if ( (output_value===undefined) || (struct_path.match( /\.length/i )))
	{
		//return res.status(404).json('Not Found');
		return res.status(404).send('Not Found');
	}
	else{
		return res.json(output_value);
	}
});


app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});


