module.exports = function (express,app) {
    // SET STORAGE
    const multer = require('multer')
    let crypto = require('crypto');
    var ObjectId = require('mongoose').Types.ObjectId;
    var bodyParser = require('body-parser');
    var Models = require('./model');
    const mongoose = require('mongoose');
    mongoose.connect('mongodb://127.0.0.1:27017/TextToSpeak', { useNewUrlParser: true })
        .catch((err) => { console.error(err) });
    let router = express.Router();
    let cons = require('consolidate');
//record saving in file named "uploads"
    var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '_' +Date.now());
    }
    });
    app.use(bodyParser.json());
    var upload = multer({ storage: storage });
// assign the swig engine to .html files
    app.engine('html', cons.swig);
// set .html as the default extension
    app.set('view engine', 'html');
    app.set('views', './views');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(express.static('./public1'));
    router.use(bodyParser.urlencoded({extended: false}));
    router.get('/api',(req,res)=>{res.render('api')});

    router.post('/api/login',(req,res)=> {
        var fbtoken = req.body.fbtoken;
        const request = require('request');
        request({
            uri: `https://graph.facebook.com/me?fields=id,name,birthday&access_token=${fbtoken}`,
            method: 'get'
        }, function (err, respond, body) {
            if(err)console.log(res.json(JSON.parse(body)));
            else
            {
                var userName = JSON.parse(body).name;
                var fbId = JSON.parse(body).id;
                var birthDay = JSON.parse(body).birthday;

                if(typeof userName==='undefined' && typeof fbId==='undefined'){res.json({Message:"User is not Found"})}
                else {
                    Models.User.findOne({
                        fbId: fbId,
                    })
                        .then((user) => {
                            console.log('user', user);

                            if (!user) {
                                console.log("User is new User");
                                let User = new Models.User;
                                User.userName = userName;
                                User.fbId = fbId;
                                User.birthDay = birthDay;
                                User.save(function (err, User) {
                                    if (err) res.send("Error Found in Saving data to mongo db");
                                    else {
                                        let token = crypto.randomBytes(128).toString('base64');
                                        let Token = new Models.Token;
                                        Token.userId = User._id;
                                        Token.accessToken = token;
                                        Token.save(function (err, Token) {
                                            if (err) res.send("Token Many Request");
                                            else res.json({
                                                "userName": userName,
                                                "fbId": fbId,
                                                "birthday": birthDay,
                                                "token": Token.accessToken,
                                                "Status": "User Account Create Successfully"
                                            })
                                        })

                                    }
                                });
                            } else {
                                console.log("User is token expire user");
                                Models.Token.findOne({userId: user._id})
                                    .then((token) => {
                                        if (!token) {
                                            let token = crypto.randomBytes(128).toString('base64');
                                            let Token = new Models.Token;
                                            Token.userId = user._id;
                                            Token.accessToken = token;
                                            Token.save(function (err, Token) {
                                                if (err) res.send("Token Many Request");
                                                else res.json({
                                                    "userName": user.userName,
                                                    "fbId": user.fbId,
                                                    "birthday": user.birthDay,
                                                    "token": Token.accessToken,
                                                    "Status": "User's token lifetime is increased successfully"
                                                })
                                            })
                                        } else {
                                            console.log("User is although token have but log out user");
                                            res.json({
                                                "userName": user.userName,
                                                "fbId": user.fbId,
                                                "birthday": user.birthDay,
                                                "token": token.accessToken,

                                                "Status": "Token Out put Successfully",
                                            })
                                        }
                                    })
                                    .catch((err) => {
                                        console.error(err);
                                        res.json({Message: 'SORRY In Token'})
                                    });
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                            res.json({Message: 'SORRY'})
                        });


                }


            }
        });


    });
    router.post('/api/posts',(req,res)=>{
        var header = req.headers['authorization'];
        if(typeof header=== 'undefined'){
            res.send(403);
        }
        else {
            var confirmkey = header.split(' ');

            var token = confirmkey[1];

            if(confirmkey[0]==='sakura' && confirmkey.length===2){
                Models.Token.findOne({accessToken:token})
                    .then((token)=>{
                        if(!token){
                            res.json({Message:"Session expired"})
                        }
                        else {
                            var userId = token.userId;

                            Models.User.findOne({_id:new ObjectId(userId)})
                                .then((user) => {
                                    if(!user){
                                        res.sendStatus(404,"Page Not Found");
                                    }
                                    else {
                                        var diff = Date.now()-token.createdAt;
                                        diff = diff/1000;
                                        diff = diff/60;
                                        let lefttime = 60-Math.abs(Math.round(diff))

                                        res.json({
                                            "userName":user.userName,
                                            "completedTextCount":user.comTextcount,
                                            "userToken":token.accessToken,
                                            "leftExpireTime":`${lefttime}minute`
                                        })
                                    }
                                })
                                .catch((err) => {
                                    console.error(err);
                                    res.json({Message:'SORRY'})
                                })
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        res.json({Message:'SORRY'})
                    });


            }
            else res.send(404,"Page Not Found");
        }});
    router.post('/api/posts/gettexts',(req,res)=>{
        //response the text from the mongo database
        var header = req.headers['authorization'];
        if(typeof header=== 'undefined'){
            res.send(403);
        }
        else {
            var confirmkey = header.split(' ');

            var token = confirmkey[1];

            if(confirmkey[0]==='sakura' && confirmkey.length===2){
                Models.Token.findOne({accessToken:token})
                    .then((token)=>{
                        if(!token){
                            res.json({Message:"Session expired"})
                        }
                        else {
                            var userId = token.userId;

                            Models.User.findOne({_id:new ObjectId(userId)})
                                .then((user) => {
                                    if(!user){
                                        res.sendStatus(404,"Page Not Found");
                                    }
                                     else {
                                         var skiptextnumber = user.comTextcount;
                                        Models.Text.find({},null,{limit:10,skip:skiptextnumber})
                                            .then((texts) => {
                                                console.log("texts", texts);
                                                if (!texts) {
                                                    console.log("Wrong Text")
                                                }
                                                else {
                                                    var text = [];
                                                    texts.forEach(function (data) {
                                                        text.push(
                                                            {
                                                                id: data.id,
                                                                value: data.value,
                                                                hashvalue: data.hashvalue,
                                                            })
                                                    });
                                                    res.json(text);
                                                    console.log(userId);
                                                    Models.User.findOneAndUpdate({_id:new ObjectId(userId)},{$inc:{comTextcount:10}},{new:true},
                                                        function (err,response) {
                                                            if(err)res.send(err);
                                                            else{console.log("Update successfully");}
                                                        })
                                                }
                                            })
                                            .catch((err) => {
                                                console.error(err);
                                                res.json({Message:"Sorry"})
                                            });
                                    }
                                })
                                .catch((err) => {
                                    console.error(err);
                                    res.json({Message:'SORRY'})
                                })
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        res.json({Message:'SORRY'})
                    });


            }
            else res.send(404,"Page Not Found");
        }

    });



    app.use(router);
};


