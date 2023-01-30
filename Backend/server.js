const express = require("express");
const fs = require("fs");
const multer = require("multer");
const { getImages, addImage, getImage, deleteImage} = require("./database");
require('dotenv').config()
const crypto = require('crypto')
const s3 = require('./s3')
const sharp = require('sharp')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// const upload = multer({ dest: "images/" });

const app = express();
app.use(express.static("dist"))

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

app.get('/api/images/:imageName', (req, res) => {
  // do a bunch of if statements to make sure the user is 
  // authorized to view this image, then
  
  const imageName = req.params.imageName
  const readStream = fs.createReadStream(`images/${imageName}`)
  readStream.pipe(res)
})



// app.get("/api/images", async (req, res) => {
//   console.log("Getting images")
//   const images = await getImages();
//   res.send(images);
// });

// app.post("/api/images", upload.single("image"),async (req, res) => {
//   const imagePath = req.file.path;
//   const description = req.body.description;
//   const result = await addImage(imagePath, description);
//   res.send(result);
// });

app.get("/api/images", async (req, res) => {
  const images = await getImages()
  // Add the signed url to each image
  for (const image of images) {
    image.imageURL = await s3.getSignedUrl(image.file_name)
  }
  console.log(images)
  res.send(images)
})

app.post("/api/images", upload.single('image'), async (req, res) => {
  // Get the data from the post request
  if(req.file == null) {
    res.status(400).send()
    return
  }
  if(req.body.description == null) {
    res.status(400).send()
    return
  }
  
  const description = req.body.description
  const fileBuffer = req.file.buffer
  const mimetype = req.file.mimetype
  const fileName = generateFileName()

  const resizedBuffer = await sharp(fileBuffer)
  .resize({ height: 1920, width: 1080, fit: "contain" })
  .toBuffer()
  // Store the image in s3
  const s3Result = await s3.uploadImage(resizedBuffer, fileName, mimetype)
  console.log(s3Result)
  // Store the image in the database
  const databaseResult = await addImage(fileName, description)
  console.log(databaseResult)

  res.status(201).send();
})

app.delete("/api/images/:id", async (req, res) => {
  const id = req.params.id
  console.log(id)
  const image = await getImage(id)
  console.log(image)
  const s3Delete = await s3.deleteImage(image.file_name)
  const sqlDelete = await deleteImage(id)
  
  console.log(s3Delete)
  console.log(sqlDelete)

  res.status(204).send()
})



app.get('*', (req, res) => {
  res.sendFile('dist/index.html');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
