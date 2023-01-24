const express = require("express");
const fs = require("fs");
const multer = require("multer");
const { getImages, addImage, getImage } = require("./database");
require('dotenv').config()

const upload = multer({
  dest: "images/",
});

const app = express();

// app.get("/api/images/:id",async (req, res) => {
//   console.log("Getting image")
//   const imageID = req.params.id;
//   const result = await getImage(imageID);
//   const readStream = fs.createReadStream(result.file_name);
//   readStream.pipe(res);
// });

app.get('/api/images/:imageName', (req, res) => {
  // do a bunch of if statements to make sure the user is 
  // authorized to view this image, then

  const imageName = req.params.imageName
  const readStream = fs.createReadStream(`images/${imageName}`)
  readStream.pipe(res)
})

// app.get("/api/image", (req, res) => {
//   const filename = req.query.imagePath
//   if (!filename) {
//     res.status(400).send("No image path provided");
//     return;
//     }
//     )))

app.get("/api/images", async (req, res) => {
  console.log("Getting images")
  const images = await getImages();
  res.send(images);
});

app.post("/api/images", upload.single("image"),async (req, res) => {
  const imagePath = req.file.path;
  const description = req.body.description;
  const result = await addImage(imagePath, description);
  res.send(result);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
