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

var PunkPetsHairUrl = "https://gist.githubusercontent.com/isuvorov/55f38b82ce263836dadc0503845db4da/raw/pets.json";
var base3BURL = '/task3B/';
let PunkPetsHair = {};

var request_PunkPetsHair = require("request")

request_PunkPetsHair({
    url: PunkPetsHairUrl,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        //console.log(body) // Print the json response
        PunkPetsHair = body;
    }
})

function getElementById(json_obj, id)
{
	var result;
	console.log("getElementById");
	//console.log(json_obj);
	for (var i=0; i < json_obj.length; i++) 
	{
		var element = json_obj[i];
	    if (element.id==id) 
	    {
	    	result = element;
	    	break;
	    }
    }
    return result;
}

function getUserByName(name)
{
	var result;
	console.log("getUserByName");
	//console.log(json_obj);
	for (var i=0; i < PunkPetsHair.users.length; i++) 
	{
		var user = PunkPetsHair.users[i];
	    if (user.username==name) 
	    {
	    	result = user;
	    	break;
	    }
    }
    return result;
}

function getPetsbyType(type)
{
	var result = [];
	console.log("getPetsbyType");

	for (var i=0; i < PunkPetsHair.pets.length; i++) 
	{
	    if (PunkPetsHair.pets[i].type==type) 
	    {
	    	result.push(PunkPetsHair.pets[i]);
	    }
    }
    return result;
}

function getPetsAge(pets, age, gt)
{
	var result = [];
	console.log("getPetsAge");
	for (var i=0; i < pets.length; i++) 
	{
	    if ((pets[i].age>age) && (gt)) 
	    {
	    	result.push(pets[i]);
	    }
	    else if ((pets[i].age<age) && (!gt)) 
	    {
	    	result.push(pets[i]);
	    }
    }
    return result;
}

function sortUsersbyId(users)
{
	var buf;
	var users_result = users;
	for (var i=0;i<users.length-1;i++)
	{
		for (var j=i+1; j<users.length; j++)
		{
			if (users_result[i].id > users_result[j].id)
			{
				buf = users[i];
				users[i] = users[j];
				users[j] = buf;
			}
		}
	}
	return users;
}

function CheckUserExists(users, user)
{
	for (var i=0;i<users.length;i++)
	{
		if (users[i].id==user.id)
		{
			return true;
		}
	}
	return false;
}

function getUsersbyPet(pet)
{
	var result = [];
	var user;
	console.log("getPetsbyType");

	for (var i=0; i < PunkPetsHair.pets.length; i++) 
	{
	    if (PunkPetsHair.pets[i].type==pet) 
	    {
	    	user = getElementById(PunkPetsHair.users, PunkPetsHair.pets[i].userId);
	    	if (!CheckUserExists(result, user)) result.push(user);
	    }
    }
    result = sortUsersbyId(result);
    return result;
}

function GetPetsPopulate(pets)
{
	var result = pets;
	var user;
	console.log("GetPetsPopulate");
	for (var i=0; i < pets.length; i++) 
	{
    	user = getElementById(PunkPetsHair.users, result[i].userId);
    	result[i].user = user;
    }
    return result;
}

function GetPetsByUserId(userId)
{
	var result = [];
	console.log('GetPetsByUserId');
	for (var i=0; i<PunkPetsHair.pets.length; i++)
	{
		if (PunkPetsHair.pets[i].userId==userId) result.push(PunkPetsHair.pets[i]);
	}
	return result;
}

function GetUsersPopulate(users)
{
	var result = users;

	console.log("GetUsersPopulate");
	for (var i=0; i < result.length; i++) 
	{
		var userPets = GetPetsByUserId(users[i].id);
		console.log(users[i].id + ' / ' + userPets);
		result[i]['pets'] = userPets;
    }
    return result;
}

function getGroup(struct_path)
{
	var search_grp_idx = struct_path.match(/^(pets|users)/i);
	return _.getPath(PunkPetsHair, search_grp_idx[1]);
}

function isEmpty(query)
{
	if (Object.keys(query).length==0) return true;
	else return false;
}

app.get(base3BURL + '*', async (req, res) => {
	var struct_path = req.path.replace(base3BURL, "");
	var selectedPets;
	var selectedUsers;

//	delete PunkPetsHair.users.pets;
//	delete PunkPetsHair.pets.user;

	struct_path = struct_path.replace(/\/$/g, "");
	console.log(struct_path+' / '+struct_path.length + ' / ' + req.query.type + ' / ' + req.query.age_gt + ' / ' + req.query.age_gt);
	if (struct_path.length==0)
	{
		return res.status(200).json(PunkPetsHair);
	}
	else if ( /^(pets|users)$/i.test( struct_path ) && (isEmpty(req.query)))
	{
		return res.status(200).json(_.getPath(PunkPetsHair, struct_path));
	}
	else if ( /^(users)$/i.test( struct_path ) && (req.query.havePet!==undefined))
	{
		selectedUsers = getUsersbyPet(req.query.havePet.toString());
		return res.status(200).json(selectedUsers);
	}
/*
	else if ( /^users\/populate$/i.test( struct_path ) && (isEmpty(req.query)))
	{
		var usersPopulate = GetUsersPopulate(PunkPetsHair.users);
		return res.status(200).json(usersPopulate);
	}
*/
	else if ( /^pets\/populate$/i.test( struct_path ) && (isEmpty(req.query)))
	{
		var petsPopulate = GetPetsPopulate(PunkPetsHair.pets);
		return res.status(200).json(petsPopulate);
	}
	else if ( /^(pets)\/populate$/i.test( struct_path ) && (req.query.type!==undefined))
	{
		selectedPets = getPetsbyType(req.query.type.toString());
		if (req.query.age_gt!==undefined) selectedPets = getPetsAge(selectedPets, req.query.age_gt || 0, true);
		if (req.query.age_lt!==undefined) selectedPets = getPetsAge(selectedPets, req.query.age_lt || 0, false);
		return res.status(200).json(GetPetsPopulate(selectedPets));
	}
	else if ( /^(pets)\/populate$/i.test( struct_path ) && (req.query.age_gt!==undefined))
	{
		selectedPets = getPetsAge(PunkPetsHair.pets, req.query.age_gt || 0, true);;
		if (req.query.age_lt!==undefined) selectedPets = getPetsAge(selectedPets, req.query.age_lt || 0, false);
		return res.status(200).json(GetPetsPopulate(selectedPets));
	}
	else if ( /^(pets)\/populate$/i.test( struct_path ) && (req.query.age_lt!==undefined))
	{
		selectedPets = getPetsAge(PunkPetsHair.pets, req.query.age_lt || 0, false);
		return res.status(200).json(GetPetsPopulate(selectedPets));
	}
	else if ( /^(pets)$/i.test( struct_path ) && (req.query.type!==undefined))
	{
		selectedPets = getPetsbyType(req.query.type.toString());
		if (req.query.age_gt!==undefined) selectedPets = getPetsAge(selectedPets, req.query.age_gt || 0, true);
		if (req.query.age_lt!==undefined) selectedPets = getPetsAge(selectedPets, req.query.age_lt || 0, false);
		return res.status(200).json(selectedPets);
	}
	else if ( /^(pets)$/i.test( struct_path ) && (req.query.age_gt!==undefined))
	{
		selectedPets = getPetsAge(PunkPetsHair.pets, req.query.age_gt || 0, true);;
		if (req.query.age_lt!==undefined) selectedPets = getPetsAge(selectedPets, req.query.age_lt || 0, false);
		return res.status(200).json(selectedPets);
	}
	else if ( /^(pets)$/i.test( struct_path ) && (req.query.age_lt!==undefined))
	{
		selectedPets = getPetsAge(PunkPetsHair.pets, req.query.age_lt || 0, false);
		return res.status(200).json(selectedPets);
	}
	else if ( /^(pets|users)\/\d+$/i.test( struct_path ))
	{
		var search_grp_idx = struct_path.match(/^(pets|users)\/(\d+)/i);
		var group = _.getPath(PunkPetsHair, search_grp_idx[1]);
		var idx = search_grp_idx[2];
		var element = getElementById(group, idx);
		if (element!==undefined)
			return res.status(200).json(element);
		else
			return res.status(404).send('Not Found');
	}
	/*
	else if ( /^users\/\d+\/populate$/i.test( struct_path ))
	{
		var search_grp_idx = struct_path.match(/^(users)\/(\d+)/i);
		var idx = search_grp_idx[2];
		var element = getElementById(PunkPetsHair.users, idx);
		if (element!==undefined)
		{
			element.pets = GetPetsByUserId(element.id);;
			return res.status(200).json(element);
		}
		else
		{
			return res.status(404).send('Not Found');
		}
	}
	*/
	else if ( /^pets\/\d+\/populate$/i.test( struct_path ))
	{
		var search_grp_idx = struct_path.match(/^(pets)\/(\d+)/i);
		var idx = search_grp_idx[2];
		var element = getElementById(PunkPetsHair.pets, idx);
		if (element!==undefined)
		{
			element.user = getElementById(PunkPetsHair.users, element.userId);
			return res.status(200).json(element);
		}
		else
		{
			return res.status(404).send('Not Found');
		}
	}
	else if ( /^(users)\/\w+$/i.test( struct_path ))
	{
		var search_grp_idx = struct_path.match(/^(users)\/(\w+)/i);
		var name = search_grp_idx[2];
		var user = getUserByName(name);
		if (user!==undefined)
			return res.status(200).json(user);
		else
			return res.status(404).send('Not Found');
	}
	else
	{
		return res.status(404).send('Not Found');
	}
});


app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});


