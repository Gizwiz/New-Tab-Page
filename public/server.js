const express = require('express');
const app = require('express')();
const bodyParser= require('body-parser');
const fs = require('fs');
const imgsFolder = './public/images/';
const multer = require('multer');
var Ajax = require('simple-ajax');
global.jQuery = global.$ = require('jquery');

var http = require('http').Server(app);
var rhttp = require('http');

var config = JSON.parse(fs.readFileSync('config.json'), 'utf-8');
var bricks = JSON.parse(fs.readFileSync('bricks.json'), 'utf-8');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public')); //Serves resources from public folder
app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

 var Storage = multer.diskStorage({
     destination: function(req, file, callback) {
         callback(null, __dirname+'/public/images/');
     },
     filename: function(req, file, callback) {
         callback(null, file.originalname);
     }
 });

 var upload = multer({
     storage: Storage
 }).array("imgUploader", 100); //Field name and max count

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function getImgData(){
var imgData = [];
fs.readdirSync(imgsFolder).forEach(file => {
  imgData.push(file);
})
return imgData;
}

function isWebsite(url){
    console.log(url);
}

function writeChangeToConfig(){
    var confStr = JSON.stringify(config);
    fs.writeFile('config.json', confStr, (err) => {
      if (err) throw err;
    });
}

function writeChangeToBricks(){
    var brickStr = JSON.stringify(bricks);
    fs.writeFile('bricks.json', brickStr, (err) => {
       if (err) throw err; 
    });
}

app.get('/', (req, res) => {
     res.render('pages/index', {data:getImgData(), config: config, bricks:bricks});
});

app.get('/bg', (req, res)=>{
    var imgs = getImgData();
    var randomImg = imgs[getRandomIntInclusive(0,imgs.length-1)];
    res.sendFile(__dirname+'/public/images/'+randomImg);
});

app.get('/options', (req, res) =>{
  res.render('pages/options', {data:getImgData(),  config: config});    
});

app.post('/search', (req,res) =>{
    rhttp.get("http://"+req.body.search, function(resp, error) {
      console.log("statusCode: ", resp.statusCode); // <======= Here's the status code
      console.log("headers: ", resp.headers);

       if (!error && res.statusCode != 404) {
            res.redirect('http://'+req.body.search);
        }
    }).on('error', function(e) {
      console.error(e);
      res.redirect('http://google.com/search?q='+req.body.search);
    });
    
});

 app.post("/upload", function(req, res) {
     upload(req, res, function(err) {
         if (err) {
             return res.end("Something went wrong!");
         }
         return res.redirect('/options');
     });
 });

app.post("/timer", function(req, res) {
    config.timer = req.body.timer;
    writeChangeToConfig();
});

app.post("/bricks", function(req, res){
    console.log("POSTING BRICKS");
    
    if(bricks.bricks == req.body.bricks){
        console.log("BREAKING BRICKS");
        return;
    } else {
        console.log("WRITING BRICKS");
        bricks.bricks = req.body.bricks;
        writeChangeToBricks();
    }

});

//app.use('/images', express.static(__dirname + '/Images'));

http.listen(1337, () => {
console.log('listening on 1337');
});