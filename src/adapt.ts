const flatten = require('array-flatten');
import * as Components from 'messenger-components';
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
    else if(!msg.text && msg.attachments)
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
          || att.contentType === 'application/vnd.microsoft.card.thumbnail')
          return cp.template.generic([
            cp.templateElement.generic(att.content.title, {
              subtitle: att.content.subtitle,
              imageUrl: (att.content.images) ? att.content.images[0].url : void 0,
              buttons: att.content.buttons.map((btn) => 
                cp.button.postback(btn.title, btn.value))
            })
          ]).toJSON();
        else
          console.log('Unknown content type: ', att.contentType);
      });

    return msgs.map((msg) => ({
      recipient: { id },
      message: msg
    }));

  }));
}
