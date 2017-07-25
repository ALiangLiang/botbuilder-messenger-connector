const flatten = require('array-flatten');
const chunk = require('chunk');
import * as Components from 'messenger-bot-components';
const cp = Components();

export default function (messages) {
  return flatten(messages.map((msg) => {
    const id = msg.address.user.id;
    let msgs = [];
    
    if(msg.text && msg.attachments && msg.attachments[0]) {
      if(msg.attachments[0].contentType === 'application/vnd.microsoft.keyboard')
        msgs = [cp.quickReply(msg.text, msg.attachments[0].content.buttons.map((choice) => 
          cp.quickReplyItem('text', {
            title: choice.title,
            payload: choice.value
          }))).toJSON()];
    } else if(msg.text && (!msg.attachments || (msg.attachments && !msg.attachments[0])))
      msgs = [{
        text: msg.text
      }];
    else if(!msg.text && msg.attachments) {
      msgs = msg.attachments.map((att) => {
        if(att.contentType.startsWith('video'))
          return cp.video(att.contentUrl).toJSON();
        else if(att.contentType.startsWith('audio'))
          return cp.audio(att.contentUrl).toJSON();
        else if(att.contentType.startsWith('image'))
          return cp.image(att.contentUrl).toJSON();
        else if(att.contentType.startsWith('file'))
          return cp.file(att.contentUrl).toJSON();
        else if(att.contentType === 'application/vnd.microsoft.card.hero'
          || att.contentType === 'application/vnd.microsoft.card.thumbnail') {
          const genericElements = chunk(att.content.buttons, 3)
            .map((btns) => {
              const buttons = btns.map((btn) => {
                if(btn.type === 'message')
                  return cp.button.postback(btn.title, btn.value);
                else if(btn.type === 'postBack')
                  return cp.button.postback(btn.title, btn.value);
                else if(btn.type === 'openUrl')
                  return cp.button.url(btn.title, btn.value);
                else
                  return cp.button.postback(btn.title, btn.value);
              });
              return cp.templateElement.generic(att.content.title, {
                  subtitle: att.content.subtitle,
                  imageUrl: (att.content.images) ? att.content.images[0].url : void 0,
                  buttons
                });
            })
          return chunk(genericElements, 10).map((generic) => cp.template.generic(generic));
        } else
          console.log('Unknown content type: ', att.contentType);
      });
    }
    
    return flatten(msgs).map((msg) => ({
      recipient: { id },
      message: msg
    }));

  }));
}
