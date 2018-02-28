var s3 = require("../../s3/s3")
    envconfig = require("config");

module.exports = function(req, res){
    var key = req.params.url;
    // 20 characters is for //s3.amazonaws.com/ (19+1)
    key = key.substring(20 + envconfig.s3.bucket.length);
    s3.deleteFile(key)
      .catch((err) => {
        console.error("imagedelete.js - s3.deleteFile.catch")
        console.error(err);
      }).then(() => {
        res.status(200).end();
      });
};