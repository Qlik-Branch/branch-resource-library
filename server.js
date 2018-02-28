const mongoose = require('mongoose'),
    express = require('express'),
    app = express(),
    passport = require('passport'),
    expressSession = require('express-session'),
    MongoStore = require('connect-mongo')(expressSession),
    AWS = require("aws-sdk"),
    request = require("request"),
    bodyParser = require('body-parser'),
    config = require('config'),
    cors = require('cors')

    if(config.corsDomain != null && config.corsDomain !== "") {
      var corsOptions = {
        origin: config.corsDomain,
        credentials: true,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
      }
      app.use(cors(corsOptions))
    }

var mode = config.mode; // should be "debug" or "release"

AWS.config.loadFromPath("./credentials.json");

mongoose.Promise = global.Promise

mongoose.connect(config.mongoconnectionstring);
if(mode === "debug") {
  mongoose.set("debug", true)
}

if(config.corsDomain != null && config.corsDomain !== "") {
  var corsOptions = {
    origin: config.corsDomain,
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
  }
  app.use(cors(corsOptions))
}

if (config.prerenderServiceUrl != null && config.prerenderServiceUrl !== "")
  app.use(require('prerender-node').set("prerenderServiceUrl",config.prerenderServiceUrl));

if (config.twitterHandle != null && config.twitterHandle !== "")
  twitterHandle = config.twitterHandle;
else
  twitterHandle = "";

//load the models
require('./server/models/project.js');
require('./server/models/publication.js');
require('./server/models/resource.js');
require('./server/models/projectcategory.js');
require('./server/models/user.js');
require('./server/models/userrole.js');
require('./server/models/feature.js');
require('./server/models/product.js');
require('./server/models/rating.js');
require('./server/models/views.js');
require('./server/models/subscription.js');
require('./server/models/article.js');
require('./server/models/attachment.js');
require('./server/models/comment.js');
require('./server/models/picklist.js');
require('./server/models/picklistitem.js');

var Error = require('./server/controllers/error');

//configure passport strategies
require('./server/controllers/passport/passport.js')(passport);

//route controllers
var apiRoutes = require(__dirname+'/server/routes/api/api');
var gitRoutes = require(__dirname+'/server/routes/git/git');
var authRoutes = require(__dirname+'/server/routes/auth');
var systemRoutes = require(__dirname+'/server/routes/system/system');
const recaptchaRoutes = require(__dirname+'/server/routes/recaptcha')

app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/js', express.static(__dirname + '/public/scripts/build'));
app.use('/debug', express.static(__dirname + '/public/scripts/raw'));
app.use('/views', express.static(__dirname + '/public/views'));
app.use('/css', express.static(__dirname + '/public/styles/css'));
app.use('/maps', express.static(__dirname + '/public/styles/maps'));
app.use('/resources', express.static(__dirname + '/public/resources'));
app.use('/attachments', express.static(__dirname + '/public/attachments'));
app.use("/qsocks", express.static(__dirname + "/node_modules/qsocks"));
app.use("/configs", express.static(__dirname + "/public/configs"));
app.use("/images", (req, res, next) => {
  const url = "http://s3.amazonaws.com/" + config.s3.bucket + "/images" + req.url
  request.get(url).pipe(res)
})
app.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  next();
});

app.use(expressSession({
  resave: true,
  saveUninitialized: true,
  secret: 'mySecretKey',
  store: new MongoStore({ mongooseConnection: mongoose.connection}),
  cookie: {domain:config.cookieDomain}
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

app.get('/', function(req, res){
  console.time("Page Request - " + req.url)
  res.render(__dirname+'/server/views/index.jade', {isAuthenticated: req.isAuthenticated(), user: req.user, mode: mode});
  console.timeEnd("Page Request - " + req.url)
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
        res.redirect("/#!project/"+result._id);
      }
      else{
        res.redirect('/404');
      }
    }
  });
});

// Fancy url to re-direct to slack invite page
app.get('/slack', function(req, res, next) {
  res.redirect('http://qlikbranch-slack-invite.herokuapp.com/')
})

app.use('/api', apiRoutes);
app.use('/git', gitRoutes);
app.use('/auth', authRoutes);
app.use('/system', systemRoutes);
app.use('/recaptcha', recaptchaRoutes)

app.use('/404', function(req, res){
  res.render(__dirname+'/server/views/404.jade');
});
app.use('/*', function(req, res){
  res.redirect('/404');
});

app.listen(process.env.PORT || 3001);
