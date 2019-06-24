const mongoose = require('mongoose');
let Schema = mongoose.Schema;


//create User schema
let UserSchema = new Schema({
    userName:{type:String,default:""},
    fbId:{type:String,default:""},
    birthDay:{type:String,default:""},
    comTextcount:{type:Number,default: 0}
},{
    timestamp: true,
});

let User = mongoose.model('User', UserSchema);
exports.User = User;


//create User with Token

let TokenSchema = new Schema({
    userId : String,
    accessToken: String,
    createdAt: {type: Date, default: Date.now(), expires:3600}
},{
    timestamp: true,
});
let Token = mongoose.model('Token', TokenSchema);
exports.Token = Token;

//create Text Schema
let textschema = new Schema({
    value : String,
    hashvalue : String
},{timestamp: true});
let Text = mongoose.model('Text',textschema);
exports.Text = Text;



//audiorecord  saving to database
let Audiorecords = new Schema({
    date:{type:Date,default:Date.now()},
    status:{type:String},
    userId:{type:String},
    userName:{type:String},
    audioName:{type:String},
    text:{type:String},
    acceptCount:Number,
    denyCount:Number,
    notSure : Number,
    votes:[{
        userId:{type:String},
        vote: { type: String, enum: 'up,down,notsure'.split(',') },
        date: { type: Date,default:Date.now },
    }]

},{
    timestamp: true,
});
let Audiorecord = mongoose.model('audiorecords', Audiorecords);
exports.Audiorecord = Audiorecord;


