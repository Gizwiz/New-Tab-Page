/*

///METHOD 1: QCKWINSVC NODE-WINDOWS WRAPPER (recommended)
FOR ENABLING STARTING NODE SERVER.JS ON WINDOWS BOOT
REQUIRES MODULE qckwinsvc, SHOULD BE INCLUDED IN THE PACKAGE.JSON
AND INSTALLED WITH NPM INSTALL ON INITIAL RUN

npm install -g qckwinsvc

Installing your service:

> qckwinsvc
prompt: Service name: [name for your service]
prompt: Service description: [description for it]
prompt: Node script path: [path of your node script]
Service installed


Uninstalling your service:

> qckwinsvc --uninstall
prompt: Service name: [name of your service]
prompt: Node script path: [path of your node script]
Service stopped
Service uninstalled


///METHOD 2: NODE-WINDOWS
IF YOU WANT THE SERVER ITSELF TO INSTALL THE SERVICE.

var Service = require('node-windows').Service;
 
// Create a new service object 
var svc = new Service({
  name:'New Tab Page',
  description: 'New Tab Page',
  script: 'PATH\\TO\\YOUR\\server.js'
});
 
// Listen for the "install" event, which indicates the 
// process is available as a service. 
svc.on('install',function(){
  svc.start();
});
svc.on('uninstall',function(){
    console.log('Uninstall complete.');
    console.log('The service exists: ',svc.exists);
  });
   
// Installs the service 
//svc.install();
// Uninstall the service. 
//svc.uninstall();


*/

const express = require('express');
const app = require('express')();
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
var Ajax = require('simple-ajax');
global.jQuery = global.$ = require('jquery');

var http = require('http').Server(app);
var rhttp = require('http');

var config = JSON.parse(fs.readFileSync('config.json'), 'utf-8');
var bricks = JSON.parse(fs.readFileSync('bricks.json'), 'utf-8');

var themesFolder = './public/themes/';
var theme =  JSON.parse(fs.readFileSync(themesFolder+config.theme+'/theme.json'), 'utf-8'); //current set theme info
var themes = getThemeData();

var imgsFolder = './public/images/';

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public')); //Serves resources from public folder
app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/public/images/');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({
    storage: Storage
}).array("imgUploader", 1000); //Field name and max count

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function getImgData() {
    var imgData = [];
    fs.readdirSync(imgsFolder).forEach(file => {
        imgData.push(file);
    })
    return imgData;
}

function getThemeData() {
    var themeData = [];
    fs.readdirSync(themesFolder).forEach(folder => {
        var theme;
        var name = folder;
        console.log(folder);
        try{
           theme =  JSON.parse(fs.readFileSync('./public/themes/'+folder+'/theme.json'), 'utf-8');
        } catch (e){
            theme = JSON.stringify({img:null});
        }
        var json = {"name":folder, "theme":theme};
        themeData.push(json);
    });
    return themeData;
}

function writeChangeToConfig() {
    var confStr = JSON.stringify(config);
    fs.writeFile('config.json', confStr, (err) => {
        if (err) throw err;
    });
}

function writeChangeToBricks() {
    var brickStr = JSON.stringify(bricks);
    fs.writeFile('bricks.json', brickStr, (err) => {
        if (err) throw err;
    });
}


function websiteExists(url) {
    var exists = false;
    try {
        rhttp.get(url, function (resp, error) {
            console.log("statusCode: ", resp.statusCode); // <======= Here's the status code
            console.log("headers: ", resp.headers);

            if (!error && resp.statusCode != 404) {
                console.log("returning true for url: " + url);
                exists = true;
            } else {
                exists = false;
            }
            return exists;
        }).on('error', function (e) {
            exists = false;
        });
    } catch (e) {

    }

}

function getCorrectUrl(url) {
    var httpUrl = 'http://' + url;
    if (websiteExists(httpUrl)) {
        console.log("retutning httpUrl " + httpUrl)
        return httpUrl;
    } else {
        var httpWWWUrl = 'http://wwww.' + url;
        if (websiteExists(httpWWWUrl)) {
            console.log("Returning httpwww " + httpWWWUrl);
            return httpWWWUrl;
        } else {
            return url;
        }
    }
}

function getThemeInfo(){
    return theme;
}

app.get('/', (req, res) => {
    res.render('pages/index', { data: getImgData(), config: config, bricks: bricks });
});

app.get('/bg', (req, res) => {
    var imgs = getImgData();
    var randomImg = imgs[getRandomIntInclusive(0, imgs.length - 1)];
    res.sendFile( __dirname+'/'+imgsFolder+randomImg);
});

app.get('/options', (req, res) => {
    console.log(theme);
    res.render('pages/options', { data: getImgData(), config: config, userTheme:theme, themes:themes});
});

app.post('/search', (req, res) => {
    rhttp.get("http://" + req.body.search, function (resp, error) {
        console.log("statusCode: ", resp.statusCode); // <======= Here's the status code
        console.log("headers: ", resp.headers);

        if (!error && res.statusCode != 404) {
            res.redirect('http://' + req.body.search);
        }
    }).on('error', function (e) {
        console.error(e);
        res.redirect('http://google.com/search?q=' + req.body.search);
    });

});

app.get('/redirectError', (req, res) => {
    res.send("<h1>An error occured with redirecting</h1>")
});

app.post('/redirect', (req, res) => {
    var url = req.body.url;
    if(url.match('^https://')){
     url = url.replace("https://","http://")
    }
    console.log(url);
    try {
        rhttp.get(url, function (resp, error) {
            console.log("statusCode: ", resp.statusCode); // <======= Here's the status code
            console.log("headers: ", resp.headers);

            if (!error && resp.statusCode != 404) {
                res.send({ url: url });
            }

        }).on('error', function(){
            console.log("1");
        });
    } catch (e1) {
        console.log("Error at first catch: "+e1);
        try{
            url = 'http://' + url;
            rhttp.get(url, function (resp, error) {
                console.log("statusCode: ", resp.statusCode); // <======= Here's the status code
                console.log("headers: ", resp.headers);

                if (!error && resp.statusCode != 404) {
                    res.send({ url: url });
                }
            }).on('error', function(){
                console.log("2");
            });
        } catch (e2) {
            console.log("Error at second catch: "+e2)
            try{
                url = 'http://www.' + url;
                rhttp.get(url, function (resp, error) {
                    console.log("statusCode: ", resp.statusCode); // <======= Here's the status code
                    console.log("headers: ", resp.headers);
    
                    if (!error && resp.statusCode != 404) {
                        res.send({ url: url });
                    }
    
                }).on('error', function(){
                    console.log("3");
                });
            } catch (e3) {
                res.redirect('/redirectError');
                return;
            }
        }
    }
});


app.post("/upload", (req, res) => {
    upload(req, res, function (err) {
        console.log(req.body);
        if (err) {
            console.log(err);
            return res.end(err);
        }
        return res.redirect('/options');
    });
});

app.post("/timer", (req, res) => {
    config.timer = req.body.timer;
    writeChangeToConfig();
});

app.post("/bricks", (req, res) => {
    bricks.bricks = req.body.bricks;
    writeChangeToBricks();
});

app.post("/bookmark", (req, res) => {
    bricks.bricks.push(req.body.brick);
    writeChangeToBricks();
});

app.post("/editBookmark", (req, res) => {

});

app.post("/remove", (req, res) => {
    for (var i = 0; i < req.body.selected.length; i++) {
        //delete selected image synced
        fs.unlinkSync("public/" + req.body.selected[i]);
    }
    res.send({ data: getImgData() });
});

app.post("/removeBrick", (req, res) => {
    bricks.bricks.splice(req.body.index, 1);
    writeChangeToBricks();
    res.send({ bricks: bricks });
});

app.get("/data/bricks", (req, res) => {
    res.send({ bricks: bricks });
});

app.get("/theme", function(req, res) {
    res.send({theme:theme});
});

app.get('/theme/img', (req, res)=>{
    res.sendFile(__dirname +'/'+ themesFolder+config.theme+'/'+theme.img);
});

http.listen(1337, () => {
    console.log('listening on 1337');
});