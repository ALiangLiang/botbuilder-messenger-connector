// import * as _ from "lodash";
process.env.DEBUG_DEPTH = 7;

import * as botbuilder from "botbuilder";
import bodyParser = require("body-parser");
import Parse = require('parse/node');
import { EventEmitter } from 'events';

// import linebot = require("linebot");
const Queue = require('promise-queue');
const fetch = require('node-fetch');
const crypto = require('crypto');
const url = require('url');
const debug = require('debug')('connector');
const error = require('debug')('connector:error');

import toMessenger from './adapt';

// var DATA = Parse.Object.extend("DATA");

export class ConfirmMessage extends botbuilder.Message {
  constructor(index: { title: string, subtitle: string, text: string }, option1: { title: string, type: string, value: string }, option2?: { title: string, type: string, value: string }, option3?: { title: string, type: string, value: string }) {
    super();

    let ass = [];
    let a1;
    let a0 = new botbuilder.CardAction().title(option1.title).type(option1.type).value(option1.value);
    ass.push(a0);
    if (option2) {
      a1 = new botbuilder.CardAction().title(option2.title).type(option2.type).value(option2.value);
      ass.push(a1);
    }
    if (option3) {
      let a = new botbuilder.CardAction().title(option3.title).type(option3.type).value(option3.value);
      ass.push(a);
    }

    let c = new botbuilder.HeroCard().title(index.title).subtitle(index.subtitle).text(index.text);
    c.buttons(ass)

    this.text(index.text).addAttachment(c);
  }
}
export class BasicConfirmMessage extends ConfirmMessage {
  constructor(text: string, option1: string, option2?: string, option3?: string) {
    let begin = { title: text, subtitle: text, text: text };
    let o1 = { title: option1, type: "message", value: option1 };
    let o2;
    if (option2) {
      o2 = { title: option2, type: "message", value: option2 };
    }
    let o3
    if (option3) {
      o3 = { title: option3, type: "message", value: option3 };
    }

    super(begin, o1, o2, o3);

  }
}


export class StickerMessage extends botbuilder.Message {
  constructor(pId: number, sId: number) {
    super();
    this.text("sticker");
    this.addEntity({
      packageId: pId.toString(),
      stickerId: sId.toString()
    })
  }
}
export class ImageMessage extends botbuilder.Message {
  constructor(url: string) {
    super();
    this.text("image");
    this.addEntity({
      originalContentUrl: url,
      previewImageUrl: url
    })
  }
}
export class VideoMessage extends botbuilder.Message {
  constructor(video_url: string, perview_image_url: string) {
    super();
    this.text("video");
    this.addEntity({
      originalContentUrl: video_url,
      previewImageUrl: perview_image_url
    })
  }
}
export class AudioMessage extends botbuilder.Message {
  constructor(url: string) {
    super();
    this.text("audio");
    this.addEntity({
      originalContentUrl: url,
      previewImageUrl: url
    })
  }
}
export class LocationMessage extends botbuilder.Message {
  constructor(title: string, address: string, latitude: string, longitude: string) {
    super();
    this.text("location");
    this.addEntity({
      title,
      address,
      latitude,
      longitude
    })
  }
}

export class MessengerConnector implements botbuilder.IConnector {
  botId;
  options;
  headers;
  endpoint;
  handler;
  event;
  obj;
  saveData;
  getData;
  replyToken;
  groupType;
  groupId;
  messageId;
  messageType;
  constructor(options,
    saveData: any,
    getData: any) {
    this.saveData = saveData;
    this.getData = getData;

    this.options = options || {};
    this.options.channelId = options.channelId || '';
    this.options.channelSecret = options.channelSecret || '';
    this.options.channelAccessToken = options.channelAccessToken || '';
    if (this.options.verify === undefined) {
      this.options.verify = true;
    }
    this.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'OAuth ' + this.options.pageAccessToken
    };
    this.endpoint = 'https://graph.facebook.com/v2.10/me/messages';
    this.botId = options.channelId;
  }
  verify(rawBody, signature) {
    const hash = crypto.createHmac('sha1', this.options.channelSecret)
      .update(rawBody, 'utf8')
      .digest('hex');
    return hash === signature.replace(/^sha1=/, '');
  }

  dispatch(body, res) {
    const _this = this;
    if (!body || !body.entry) {
      return;
    }
    body.entry.forEach(function(entry) {
      entry.messaging.forEach((msg) => {

        try {
          let mid = msg.message.mid;
          // _this.groupId = mid;
          // _this.groupType = msg.source.type;
          // _this.messageId = msg.message.id;
          // _this.messageType = msg.message.type;

          //console.log("msg.source",msg.source)

          const appName = 'Tester';
          const sender = msg.sender.id;
          const senderName = 'John Doe';
          const recipient = msg.recipient.id;
          const attachments = (msg.message.attachments || []).map((attachment) => ({
            contentType: attachment.type,
            contentUrl: attachment.payload.url
          }));

          let m = {
            type: 'message',
            address: {
              id: mid,
              channelId: 'facebook',
              user: { id: sender, name: senderName },
              conversation: { isGroup: false, id: `${sender}-${recipient}` },
              bot: { id: recipient, name: appName },
              serviceUrl: _this.endpoint,
            },
            sourceEvent: msg,
            user: { id: sender, name: senderName },
            attachments,
            entities: msg.entities || [],
            locale: 'textLocale',
            channelData: 'sourceEvent',
            agent: 'botbuilder',
            source: 'facebook',
            text: msg.message.text,
          };

          // if (msg.message.type !== "text") {
          //     // m.text = msg.message.type;
          //     m.type = msg.message.type;

          //     m.attachments = [msg.message];
          //     if(msg.message.type==="image"){
          //         m.attachments= [{"type":"image","id":msg.message.id}];
          //     }
          //     else if(msg.message.type==="video"){
          //         m.attachments= [{"type":"video","id":msg.message.id}];
          //     }
          //     else if(msg.message.type==="audio"){
          //         m.attachments= [{"type":"audio","id":msg.message.id}];
          //     }
          //     else if(msg.message.type==="location"){
          //         m.attachments= [{"type":"location","id":msg.message.id}];
          //     }
          // }

          // let fs = require("fs");
          // var data = fs.readFileSync(__dirname+'/joke/girl.jpg', 'utf-8');
          // console.log(data);
          _this.handler([m]);
          // _this.handler(data);
        }
        catch (e) {
          console.error(e instanceof Error ? e.stack : e.toString());
        }
      });
    });
  }
  listen() {
    // console.log("listen")

    const parser = bodyParser.json({
      verify: function(req: any, res, buf, encoding) {
        req.rawBody = buf.toString(encoding);
      }
    });
    return (req, res) => {
      parser(req, res, () => {
        if (this.options.verify && !this.verify(req.rawBody, req.get('x-hub-signature'))) {
          console.error('verify failed.');
          return res.sendStatus(400);
        }
        // console.log("listen 2")
        this.dispatch(req.body, res);
        return res.json({});
      });
    };
    // return this.bot.parser();
  }
  onEvent(handler) {
    this.handler = handler;
  };

  static createMessages(message) {
    // console.log(message)
    if (typeof message === 'string') {
      return [{ type: 'text', text: message }];
    }



    if (Array.isArray(message)) {
      return message.map(function(m) {
        if (typeof m === 'string') {
          return { type: 'text', text: m };
        }

        return m;
      });
    }
    return [message];
  }

  get(path) {
    console.log("get", path);
    return fetch(this.endpoint + path, { method: 'GET', headers: this.headers });
  }

  getUserProfile() {
    let url = '/profile/' + this.groupId;
    return this.get(url).then(function(res) {
      return res.json();
    });
  }


  getMessageType() {
    return this.messageType;
  }
  getMessageContent() {
    let _this = this;
    return this.get('/message/' + this.messageId + '/content/').then(function(res) {
      return res.buffer()
    });
  }
  leave() {
    let url = '';
    if (this.groupType === "group") {
      url = '/group/' + this.groupId + '/leave';
    } else if (this.groupType === "room") {
      url = '/room/' + this.groupId + '/leave';
    }
    const body = {
    };
    return this.post(url, body).then(function(res) {
      return res.json();
    });

  }


  post(token, body) {
    return fetch(this.endpoint + '?access_token=' + token, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body)
    });
  }

  reply(message) {
    debug('reply %O', message);
    return this.post(this.options.channelAccessToken, message)
    .then((res) => res.json())
    .then((json) => {
      // console.log(json)
      return json;
    })
    .catch((err) => error('reply %O', err));
  }
  // sendProcess:Promise<any>;

  sendProcess = null;
  
  send(messages, done) {
    //new EventEmitter wait for call process;
    var _this = this;
    let P = (a: string) => {
      let auth = a;
      let ts = [];
      let e = new EventEmitter();

      setTimeout(() => {
        e.emit("done");
      }, 100);

      e.on("add", (t) => {
        ts.push(t);
      })
      e.on("done", () => {
        // console.log("done", auth, ts)
        try {
          var queue = new Queue(1, Infinity);
          ts.forEach((t) =>_this.reply(t));
          _this.sendProcess = null;
        } catch (err) {
          console.error(err);
        }
      })
      return e;
    }

    debug('send %O', messages)
    const bodys = toMessenger(messages);
    debug('toMessenger %O', bodys);
    bodys.forEach((t) => this.reply(t));
    // messages.map((msg) => {
    //   // console.log("msg", msg)
    //   if (_this.sendProcess === null) {
    //     _this.sendProcess = P();
    //   }
    //   if (msg.attachments !== undefined) {
    //     // _this.renderAttachment(msg);
    //     let p: Promise<any> = _this.getRenderTemplate(msg);
    //     p.then((t) => {
    //       // console.log("t", t);
    //       _this.sendProcess.emit("add", t)
    //     });
    //   } else {
    //     // console.log("msg",msg)
    //     let body = {
    //       recipient: {
    //         id: msg.address.user.id
    //       },
    //       message: {}
    //     };
    //     if (msg.text === "sticker" && msg.entities) {
    //       body.message =  {
    //         type: 'sticker',
    //         packageId: msg.entities[0].packageId,
    //         stickerId: msg.entities[0].stickerId
    //       };
    //     } else if (msg.text === "image" && msg.entities) {
    //       body.message = { type: 'image', originalContentUrl: msg.entities[0].originalContentUrl, previewImageUrl: msg.entities[0].previewImageUrl };
    //     } else if (msg.text === "video" && msg.entities) {
    //       body.message = { type: 'video', originalContentUrl: msg.entities[0].originalContentUrl, previewImageUrl: msg.entities[0].previewImageUrl };
    //     } else if (msg.text === "audio" && msg.entities) {
    //       body.message = { type: 'audio', originalContentUrl: msg.entities[0].originalContentUrl, duration: msg.entities[0].duration };
    //     } else if (msg.text === "location" && msg.entities) {
    //       body.message = { type: 'location', title: msg.entities[0].title, address: msg.entities[0].address, latitude: msg.entities[0].latitude, longitude: msg.entities[0].longitude };
    //     } else {
    //       body.message =  {
    //         text: msg.text
    //       };
    //     }
    //     debug('body %O', body)
    //     _this.sendProcess.emit("add", body);
    //   }
    // })
  }


  getRenderTemplate(msg): Promise<any> {

    var _this = this;

    return new Promise((res, rej) => {

      let l = msg.attachments.length;
      if (l === 1) {

        msg.attachments.map((a) => {
          switch (a.contentType) {
            case 'application/vnd.microsoft.card.hero':
            case 'application/vnd.microsoft.card.thumbnail':

              var tc = a.content;
              // console.log("tc", tc);
              if (tc.title === undefined) {
                if (tc.images.length > 0) {
                  let r = {
                    type: 'image',
                    originalContentUrl: tc.images[0].url,
                    previewImageUrl: tc.images[0].url
                  }
                  // _this.reply(msg.address.useAuth, r);
                  // return r;
                  res(r);
                }
              }
              let r: any = {
                type: 'template',
                altText: tc.text,
                template: {
                  type: "buttons",
                  title: tc.title,
                  text: tc.subtitle,
                  actions: []
                }
              };
              if (tc.buttons.length <= 2 && tc.images === undefined) {
                r.template.type = "confirm";
              }

              let actions;
              let subtext = "\n";
              let bn_c = 0;
              tc.buttons.map((b) => {
                let bn = {
                  type: b.type,
                  label: b.title,
                  text: b.value,
                  uri: b.value,
                  data: b.value
                }
                bn_c++;
                subtext += bn_c + "." + b.title + "\n";
                // console.log(subtext)
                r.template.actions.push(bn)
              });
              r.altText += subtext;
              // console.log(r);

              if (tc.images !== undefined) {
                r.template.thumbnailImageUrl = tc.images[0].url;
              }
              res(r);
          }

        })
      } else {
        let r: any = {
          type: 'template',
          altText: msg.text,
          template: {
            type: "carousel",
            columns: []

          }
        };
        msg.attachments.map((a) => {
          switch (a.contentType) {
            case 'application/vnd.microsoft.card.hero':
            case 'application/vnd.microsoft.card.thumbnail':
              var tc = a.content;
              let c: any = {
                title: tc.title,
                text: tc.subtitle,
                actions: []
              }

              let actions;
              tc.buttons.map((b) => {
                let bn = {
                  type: "message",
                  label: b.title,
                  text: b.value
                }
                c.actions.push(bn)
              });
              if (tc.images !== undefined) {
                c.thumbnailImageUrl = tc.images[0].url;
              }
              r.template.columns.push(c);
          }

        })
        // console.log("r", r)
        // _this.reply(msg.address.useAuth, r);
        // return r;
        res(r);

      }
    });

    // if(msg.attachments)

    // this.reply()

  }
  startConversation(address, callback) {
    console.log(address);
    console.log(callback);
  }
}
