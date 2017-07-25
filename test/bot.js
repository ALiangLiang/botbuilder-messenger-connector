var redis = require("redis"),
  client = redis.createClient();

const {
  MessengerConnector
} = require('./../dist/MessengerConnector');

const builder = require('botbuilder');

const messengerConnector = new MessengerConnector(require('./config.json'), (context, data, callback) => {
  let cid = context.address.channelId;
  client.set(cid, JSON.stringify(data));
  callback(null);
}, (context, callback) => {
  let cid = context.address.channelId;
  client.get(cid, function(err, data) {
    if (err)
      console.error(err);
    callback(null, JSON.parse(data));
  });
});

module.exports = {
  messengerConnector
};
const bot = new builder.UniversalBot(messengerConnector);

const getText = (session, i) =>
  session.localizer.gettext(session.preferredLocale(), i);

bot.dialog('/', [
  (session) => {
    console.log('main1')
    session.beginDialog('/a');
  }
]);

bot.dialog('/a', [
  (session) => {
    console.log(session.message)
    console.log('a1')
    session.send('text');
    var msg = session.message;
    let a = new builder.CardAction()
      .title(getText(session, "agree"))
      .type("message")
      .value(getText(session, "agree"));
    let c = new builder.ThumbnailCard()
      .title(getText(session, "law"))
      .subtitle(getText(session, "law"))
      .text(getText(session, "law"))
      .images([builder.CardImage.create(session, 'https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg')])
      .buttons([a]);
    session.send(session.message);
    session.send(new builder.Message(session).addAttachment(c));
    session.send(new builder.Message(session)
      .addAttachment({
        contentUrl: 'https://assets.onestore.ms/cdnfiles/external/uhf/long/9a49a7e9d8e881327e81b9eb43dabc01de70a9bb/images/microsoft-gray.png',
        contentType: 'image/png',
        name: 'microsoft-gray.png'
      }));

    // builder.Prompts.choice(session, 'prompt choice', ['a', 'b'])
    // builder.Prompts.text(session, 'prompt text')
  },
  (session, r) => {
    session.endDialog('你說:' + r.response);
  }
]);

bot.dialog('/b', [
  (session) => {
    console.log('b1')
    let s1 = getText(session, "funny");
    let af = new builder.CardAction().title(s1).type("message").value(s1);
    let s2 = getText(session, "lame");
    let al = new builder.CardAction().title(s2).type("message").value(s2);
    let img = new builder.CardImage().url("https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png");
    let c = new builder.HeroCard().images([img]).title(getText(session, "is_this_funny")).subtitle(getText(session, "is_this_funny")).text(getText(session, "is_this_funny")).buttons([af, al]);
    let m = new builder.Message().text("is_this_funny").addAttachment(c);
    builder.Prompts.choice(session, m, [s1, s2])
  },
  (session, r) => {
    console.log('b2')

    let o = r.response.entity;
    session.endDialog("you select:" + o);
  }
]);

bot.dialog('/message', [
  (session) => {
    console.log('message1')
    builder.Prompts.attachment(session, "give me a message text/video/image/audio");
  }
]);
