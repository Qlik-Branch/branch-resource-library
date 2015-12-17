var mongoose = require('mongoose'),
    express = require('express'),
    app = express(),
    passport = require('passport'),
    expressSession = require('express-session'),
    bodyParser = require('body-parser');

var mode = "release";
//var mode = "debug";

config = require('config');


var envconfig = require('./config')

mongoose.connect(envconfig.mongoconnectionstring);



//load the models
require('./server/models/project.js');
require('./server/models/blog.js');
require('./server/models/projectcategory.js');
require('./server/models/user.js');
require('./server/models/userrole.js');
require('./server/models/feature.js');
require('./server/models/product.js');
require('./server/models/rating.js');
require('./server/models/views.js');
require('./server/models/subscription.js');
require('./server/models/article.js');
require('./server/models/discussion.js');
require('./server/models/attachment.js');
require('./server/models/comment.js');
require('./server/models/picklist.js');
require('./server/models/picklistitem.js');

var Error = require('./server/controllers/error');

//configure passport strategies
require('./server/controllers/passport/passport.js')(passport);

//route controllers
var apiRoutes = require(__dirname+'/server/routes/api/api');
var authRoutes = require(__dirname+'/server/routes/auth');
var systemRoutes = require(__dirname+'/server/routes/system/system');
var vcRoutes = require(__dirname+'/server/routes/visualCaptcha');

app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/js', express.static(__dirname + '/public/scripts/build'));
app.use('/debug', express.static(__dirname + '/public/scripts/raw'));
app.use('/views', express.static(__dirname + '/public/views'));
app.use('/css', express.static(__dirname + '/public/styles/css'));
app.use('/resources', express.static(__dirname + '/public/resources'));
app.use('/attachments', express.static(__dirname + '/public/attachments'));
app.use("/qsocks", express.static(__dirname + "/node_modules/qsocks"));
app.use("/configs", express.static(__dirname + "/public/configs"));

app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb'}));

app.get('/', function(req, res){
  res.render(__dirname+'/server/views/index.jade', {isAuthenticated: req.isAuthenticated(), user: req.user, mode: mode});
});

//This route is to accommodate for links from Old Branch (only applied to projects)
//The Url parameter is used to obtain the old projectId which is then used to get the new projectId
//The server then redirects to /#projects/:id

var Project = require('./server/models/project.js');

app.get("/projects/showthread.php", function(req, res, next){
  console.log(req.query);
  for(var key in req.query){
    var oldId = key.split("-")[0].trim();
    var query = {};
    break;
  }
  query.threadid = parseInt(oldId);
  Project.findOne(query, function(err, result){
    if(err){
      res.redirect('/404');
    }
    else{
      if(result && result._id){
        res.redirect("/#project/"+result._id);
      }
      else{
        res.redirect('/404');
      }
    }
  });
});

app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/system', systemRoutes);
app.use('/visualcaptcha', vcRoutes);

app.use('/404', function(req, res){
  res.render(__dirname+'/server/views/404.jade');
});
app.use('/*', function(req, res){
  res.redirect('/404');
});

app.listen(process.env.PORT || 3001);
