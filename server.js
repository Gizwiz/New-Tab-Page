const express = require('express');
const app = require('express')();
const bodyParser= require('body-parser');
const fs = require('fs');
const imgsFolder = './public/images/';

global.jQuery = global.$ = require('jquery');

var http = require('http').Server(app);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public')); //Serves resources from public folder
app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

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

app.get('/', (req, res) => {
     res.render('pages/index', {data:getImgData()});
});

app.get('/bg', (req, res)=>{
    var imgs = getImgData();
    var randomImg = imgs[getRandomIntInclusive(0,imgs.length-1)];
    res.sendFile(__dirname+'/public/images/'+randomImg);
});

app.post('/search', (req,res) =>{
    console.log(req.body.search);
    res.redirect('http://google.com/search?q='+req.body.search);
});

//app.use('/images', express.static(__dirname + '/Images'));

http.listen(1337, () => {
console.log('listening on 1337');
});