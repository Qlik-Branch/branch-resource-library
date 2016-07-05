var fs = require("fs"),
    formidable = require("formidable"),
    uuid = require("uuid"),
    s3 = require("../../s3/s3");

module.exports = function(req, res){
    var form = new formidable.IncomingForm();
    //Formidable uploads to operating systems tmp dir by default
    form.keepExtensions = true;     //keep file extension

    form.parse(req, function(err, fields, files) {
        fs.readFile(files.file.path,{}, function(err, data) {
            var extension = files.file.name.substring(files.file.name.lastIndexOf("."));
            var key = "tmp/" + uuid.v4() + extension;
            s3.uploadFile(key, data)
              .then((result) => {
                  res.json(result);
              }).catch((err) => {
                  console.log("Error Uploading to S3", err);
                  res.status(500);
                  res.json("There was an issue uploading the file");
            });
        });
    });
};

