const express = require('express');
const exifImage = require('exif').ExifImage;
const jimp = require("jimp");
const fs = require('fs');

const {json, raw} = require("express");
const app = express();
const PORT = 3000;
var multer, storage, path, crypto;
multer = require("multer")
path = require('path')
crypto = require('crypto')


app.use(express.static('public'));
app.use("./images", express.static('images'));

var form = "<!DOCTYPE HTML><html><body>" +
    "<h2>Image Upload</h2>" +
    "<form method='post' action='/images' enctype='multipart/form-data'>" +
    "<input type='file' name='images'/>" +
    "<input type='submit' /></form>" +
    "<br/>" +
    "<h2>Video Upload</h2>" +
    "<form method='post' action='/uploadVideo' enctype='multipart/form-data'> " +
    "<input type='file' name='video'/> " +
    "<input type='submit'/> </form>" +
    "</body></html>";

app.get('/', function (req, res) {

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(form);

});


storageImage = multer.diskStorage({
    destination: './images/',
    filename: function (req, file, cb) {
        return crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) {
                return cb(err);
            }
            return cb(null, "" + (raw.toString('hex')) + (path.extname(file.originalname)));
        });
    }
});

// upload video
// initialize video folder and name video
const videoStorage = multer.diskStorage({
    destination: './videos/', // Destination to store video
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now()
            + path.extname(file.originalname))
    }
});
// get video and
const videoUpload = multer({
    storage: videoStorage,
    limits: {
        fileSize: 10000000 // 10000000 Bytes = 10 MB
    },
    fileFilter(req, file, cb) {
        // upload only mp4 and mkv format
        if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
            return cb(new Error('Please upload a video'))
        }
        cb(undefined, true)
    }
})
// get video from uploader
app.post('/uploadVideo', videoUpload.single('video'), (req, res) => {
    res.send(req.file)
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
});


// get image from uploader
app.post(
    "/images",
    multer({
        storage: storageImage
    }).single('images'), function (req, res) {
        console.log(req.file);
        console.log(req.body);
        res.send(req.file);
        res.status(200)
        res.redirect("/images/" + req.file.filename);
        console.log(req.file.filename);
    }, (error, req, res) => {
        res.status(400).send({error: error.message})
    });

let images_all=[];
// show all iamge and video in json
app.get('/all', (req, res) => {

    res.setHeader('Content-Type', 'application/json');


    let jsonImage = {
        image: [],
        // count:null
    }

    let jsonVideo = {
        videos: [],
        // count:null
    }
    let status={
        status:null
    }

    let all_size = [];
    // fs.readdir("./images", (x, y) => {
    //     if (x) {
    //         console.log(x);
    //     }
    //     var size;
    //     let file_info;
    //     for (let i = 0; i < y.length; i++) {
    //         // console.log(y[i]);
    //         // listimage.push(y[i])
    //         // console.log(y[i])
    //
    //     }
    //     // console.log(jsonImage)
    //     res.send(jsonImage)
    //     // JsonImage[keyImage].push(data);
    //     // JsonImage.push(data)
    //     // return  jsonImage;
    // }, (err => console.log("Error images =>  ", err)))
    //

    var list_image = fs.readdirSync("./images");
    // var file_info_folder_img = fs.statSync("./images");
    images_all=list_image;

    if (list_image.length > 0) {

    for (let i = 0; i < list_image.length; i++) {
        var file_info_img = fs.statSync("./images/" + list_image[i]);
        let size = formatBytes(file_info_img.size);
        var p = {
            id: i,
            name: list_image[i],
            size: size,
            extention: path.extname(list_image[i]),
        }
        status["status"]=200
        jsonImage["image"].push(p);
        // jsonImage["count"]=i+1;

    }
}else{
        jsonImage["image"]="Nothing to show ";
        res.send(jsonImage)
    }

    var list_video = fs.readdirSync("./videos");



if(list_video.length >0) {
    for (let i = 0; i < list_video.length; i++) {
        var file_info_vid = fs.statSync("./videos/" + list_video[i]);
        let size = formatBytes(file_info_vid.size);

        p = {
            id: i,
            name: list_video[i],
            size: size,
            extention: path.extname(list_video[i]),
        }

        status["status"] = 200
        jsonVideo["videos"].push(p);
        // jsonVideo["count"]=i+1;
    }
}else{
    jsonVideo["videos"]="Nothing to show "
    res.send(jsonVideo)
}

    console.log(jsonImage);
    console.log(jsonVideo);

    var all_json = Object.assign(jsonImage, jsonVideo,status)

    res.send(all_json)

//***************************************
    // var jsonVideo={
    //     video:[
    //
    //     ],
    //     count:null
    // }

    // fs.readdir("./videos", (x, y) => {
    //          if (x) {
    //              console.log(x)
    //              return  x;
    //          }
    //          for (let i = 0; i <y.length ; i++) {
    //              p={
    //                  id:i,
    //                  name:y[i]
    //              }
    //              jsonVideo['count']=i+1;
    //              jsonVideo["video"].push(p);
    //          }
    //          // console.log(y);
    //          // console.log(jsonVideo)
    //          res.json(jsonVideo)
    //
    //      },(err => console.log("vidoe error => ",err)))

});

var t;
for (let i = 0; i <images_all.length ; i++) {
    console.log("http://www.localhost:3000")
}


// download image
app.get("/d", (req, res) => {
    const y = './images/d16ea1dde849ff2e81c88e19b2ddf9c2.png';

    // res.download(y,(err => console.log(err)))

});



app.get("/get",(req,res)=>{

    try{
        // GET INFO IMAGE ONLY JPG FORMAT
        new exifImage({image: "./iamges/38e90eae9578d780480cf76282640070_png_to_jpg.jpg"},(err,data)=>{
            if(err) console.log(err);
            else {

                console.log(data);
                res.send(data);

            }
        })

    }catch (e) {

    }
})


// input
// jimp.read("./images/38e90eae9578d780480cf76282640070.png",(err,image)=>{
//     if(err) console.log(err);
//
//     // out put
//     image.write("./iamges/38e90eae9578d780480cf76282640070_png_to_jpg.jpg");
//
// });

app.get('/show', function (req, res){
    // file = req.params.upload;
    console.log(req.params.upload);
    // var img = fs.readFileSync(__dirname + "YUOR DIRECTORY");
    var img = fs.readFileSync(__dirname + "/images/" + "7dd6b9bdb1965eaa8b473fe1ddc03dfa.jpg");
    res.writeHead(200, {'Content-Type': 'image/jpg' });
    res.end(img, 'binary');

});

// Run Server
app.listen(PORT, () => {
    console.log(`Running Server on Port http://www.localhost:3000`);
});

// convert byte to KB and .....
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];

}