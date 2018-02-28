const express = require('express'),
    router = express.Router(),
    fs = require("fs"),
    formidable = require("formidable"),
    uuid = require("uuid"),
    s3 = require("../../s3/s3")

router.get("/", (req, res, next) => {
  s3.listImages().then((keys) => {
    res.json({data: keys})
  })
})

router.delete("/:imageName", (req, res, next) => {
  s3.deleteFile("images/" + req.params.imageName)
      .catch((err) => {
        console.error("images.js - router.delete - /:imageName - s3.deleteFile.catch")
        console.error(err)
      }).then(() => {
    res.status(200).end()
  })
})

router.post("/", (req, res, next) => {
  var form = new formidable.IncomingForm();
  //Formidable uploads to operating systems tmp dir by default
  form.keepExtensions = true;     //keep file extension

  form.parse(req, function (err, fields, files) {
    fs.readFile(files.file.path, {}, function (err, data) {
      var extension = files.file.name.substring(files.file.name.lastIndexOf("."));
      var key = files.file.name;
      s3.uploadFile("images", key, data)
          .then((result) => {
            res.json(result);
          }).catch((err) => {
            console.error("images.js - router.post - / - s3.uploadFile.catch")
            console.error(err);
            res.status(500);
            res.json("There was an issue uploading the file");
          });
    });
  });
})

module.exports = router