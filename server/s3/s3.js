var AWS = require("aws-sdk"),
    envconfig = require("../../config");

module.exports = {
    uploadFile: (key, data) => {
        return new Promise((resolve, reject) => {
            var fullKey = "attachments/" + key;

            var s3obj = new AWS.S3({params: {Bucket: envconfig.s3.bucket, Key: fullKey}});
            s3obj.upload({Body: data})
                .send(function (err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        var result = {
                            url: "//s3.amazonaws.com/" + envconfig.s3.bucket + "/" + fullKey
                        }
                        resolve(result);
                    }
                });
        });
    },
    moveFile: (previousFile,newFile) => {
        return new Promise((resolve, reject) => {
            var previousWithBucket = envconfig.s3.bucket + "/" + previousFile;
            var params = {Bucket: envconfig.s3.bucket, CopySource: previousWithBucket, Key: newFile };
            var s3obj = new AWS.S3();
            s3obj.copyObject(params, function(err) {
                if(err) {
                    reject(err);
                } else {
                    var deleteParams = {Bucket: envconfig.s3.bucket, Key: previousFile};
                    s3obj.deleteObject(deleteParams, function(err, result) {
                        resolve();
                    });
                }
            });
        });
    },
    deleteFile: (key) => {
        return new Promise((resolve, reject) => {
            var params = {Bucket: envconfig.s3.bucket, Key: key};
            var s3obj = new AWS.S3();
            s3obj.deleteObject(params, function(err) {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },
    deleteEntityFiles: (entityId) => {
        return new Promise((resolve,reject) => {
            var key = "attachments/" + entityId + "/";
            var s3 = new AWS.S3();
            var params = {
                Bucket: envconfig.s3.bucket,
                Prefix: key
            };

            s3.listObjects(params, (err, data) => {
                if (err) {
                    reject(err);
                }
                if (data) {
                    params = {Bucket: envconfig.s3.bucket};
                    params.Delete = {Objects:[]};

                    data.Contents.forEach(function(content) {
                        params.Delete.Objects.push({Key: content.Key});
                    });

                    s3.deleteObjects(params, function(err) {
                        if (err) {
                            reject(err);
                        }
                        params = {Bucket: envconfig.s3.bucket, Key: key};
                        s3.deleteObject(params, function(err) {
                            if(err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        })
                    });
                }
            });
        });
    }
}