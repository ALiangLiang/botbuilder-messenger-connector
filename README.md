# botbuilder-messenger-connector

Messenger Platform API for Node.js

Fork from [Wolke/botbuilder-linebot-connector](https://github.com/Wolke/botbuilder-linebot-connector)

# About Messenger Messaging API

Please refer to the official API documents for details.
- Developer Documents - https://developers.facebook.com/docs/messenger-platform

# Installation

```bash
$ npm install botbuilder-messenger-connector --save
```


#usage

start your redis first!
```bash

var express = require("express");
var botbuilder = require("botbuilder");

var redis = require("redis"),
    client = redis.createClient();

var LineConnector = require( "botbuilder-linebot-connector");

var lineConnector = new LineConnector.LineConnector({
    channelId: "1489577XXX",
    channelSecret: "1752cff54cf3db3a9f4a4bdd6165aXXX",
    channelAccessToken: "W5cNdbwKSLS86soxGjnxpzIPZgm3orCWVZuOkU5YBVqZ6nFctxxZLYE9a5UWJ9gL5yz0lnEnH9tld/B8e49PPRQEhyMnBnxUmPr6hXvxId0zrj4S675kQIjsVlkzY97ShKM+kyXAkpqRS2ZcAQkMVwdB04t89/1O/w1cDnyilXXX"
}, (context, data, callback) => {
    let cid = context.address.channelId;
    client.set(cid, JSON.stringify(data));
    callback(null);
},
    (context, callback) => {
        let cid = context.address.channelId;
        client.get(cid, function (err, data) {
            callback(null, JSON.parse(data));
        }
        )
    });
var bot = new builder.UniversalBot(lineConnector);
let getText = (s, i) => { return s.localizer.gettext(s.preferredLocale(), i) };

bot.dialog('/', [
    (s) => {
        s.beginDialog('/a');
    },
    (s) => {
        s.beginDialog('/b');
    }
]);

bot.dialog('/a', [
    (s) => {
        s.send(new LineConnector.StickerMessage(1, 403));
        s.send(new LineConnector.ImageMessage("https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png")); //https only

        builder.Prompts.choice(s, "number?", ["1", "2"]);
    },
    (s, r) => {
        let o = r.response.entity;
        s.endDialog("you select:" + o);
    }
]);

bot.dialog('/b', [
    (s) => {
        let s1 = getText(s, "funny");
            let af = new builder.CardAction().title(s1).type("message").value(s1);
            let s2 = getText(s, "lame");
            let al = new builder.CardAction().title(s2).type("message").value(s2);
            let c = new builder.HeroCard().title(getText(s, "is_this_funny")).subtitle(getText(s, "is_this_funny")).text(getText(s, "is_this_funny")).buttons([af, al]);
            let m = new builder.Message().text("is_this_funny").addAttachment(c);
            builder.Prompts.choice(s, m, [s1, s2])
       
    },
    (s, r) => {
        
        let o = r.response.entity;
        s.endDialog("you select:" + o);
    }
]);




bot.dialog('/message', [
    (s) => {
        builder.Prompts.attachment(s, "give me a message text/video/image/audio");
    },
    (s,r)=>{
        
         lineConnector.getMessageContent().then( (data, err) => {
            if (data) {
                let d1 = Array.prototype.slice.call(new Buffer(data), 0)
                let f_type = lineConnector.getMessageType();
                console.log(d1)
            }
         }
    )

    }
   
]);




bot.dialog('/leave', [
    (s) => {
          
         lineConnector.leave().then(d=>{
             console.log(d)
         });
   
    }
   
]);


var app = express();

//you can use different bot
app.use('/linebot', lineConnector.listen());

app.get('*', function (req, res) {
    res.send(200, 'Hello Tarot Bot');
});
app.listen(process.env.port || 9090, function () {
    console.log('server is running.');
});
```

command line:
ngrok http 9090

line console
https://xxx.xxx.xxx/

done