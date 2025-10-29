// need for rendering the images
const path = require('path');
const { exec } = require('child_process');

// include any libraries
const express = require('express');  // include the express library 
const multer = require('multer'); // includes the multer library for file uploads
const sizeOf = require('image-size'); // includes the image size library to grab original size of uploaded image

// declare any global variables:
const server = express();			       // create a named server using express  
const upload = multer({ dest: 'uploads/' });  //create folder for files that are being uploaded


// Serve static files (so the HTML and images are accessible)
server.use(express.static(path.join(__dirname, 'public')));
server.use('/ditheredgrass', express.static(path.join(__dirname, 'ditheredgrass')));

//const bodyParser = require('body-parser'); // to read the JSON of the requests
//server.use(bodyParser.json());

let grass = [
	{
		"id": 1,
		"width": "400",
		"height": "400",
		"data": "/ditheredgrass/g1.gif"
	},
	{
		
		"id": 2,
		"width": "400",
		"height": "300",
		"data": "/ditheredgrass/g2.gif"
	},
	{
		"id": 3,
		"width": "400",
		"height": "267",
		"data": "/ditheredgrass/g3.gif"
	},
	{
		"id": 4,
		"width": "400",
		"height": "400",
		"data": "/ditheredgrass/g4.gif"
	},
	{
		"id": 5,
		"width": "400",
		"height": "252",
		"data": "/ditheredgrass/g5.gif"
	}
];

server.get("/api/grass", (req, res) => {
	res.json(grass);
});


server.post("/grass", (req, res) => {

	// create a JSON object from the request body
	const { width, height, data } = req.body;
	const newItem = { id: grass.length + 1, width, height, data };

	// add it to the array
	grass.push(newItem);

	// 201 indicates successful POST
	res.status(201).json(newItem);
});

server.post("/upload", upload.single('grassImage'), (req, res) => {

	// create path from the request file
	const inputPath = req.file.path;

	// the path that gets put in the folder
  	const outputPath = `ditheredgrass/${Date.now()}_grass.gif`;

	// image magik commands!
	const cmd = `
		magick ${inputPath} -resize 500 ${outputPath} &&
		magick ${outputPath} -colorspace gray -ordered-dither o8x8 ${outputPath}
		magick identify -format "%w %h" ${outputPath}
	`;

	exec(cmd, (err, stdout) => {
		if (err) {
			console.error(err);
			res.status(500).send('Error dithering image');
			return;
		}

		// get the w & h of uploaded image
		const [width, height] = stdout.trim().split(' ');

		// add new image to the api
		const newItem = { id: grass.length + 1, width: width, height: height, data: `/${outputPath}` };

		// add it to the array
		grass.push(newItem);

		// 201 indicates successful POST
		res.status(201).json(newItem);
	});
});

// Start the server on port 13001 and log a message to the console
server.listen(13001, () => console.log("server running on port 13001"));