import axios from 'axios';
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  proto
} = await import("@whiskeysockets/baileys");

let handler = async (message, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(message.chat, "*⌫┇اكـتـب شـخـصـيـة لـلـبـحـث عـن صـور لـهـا*\n\n*⌫┇الامـر يـبـحـث فـي pinterest فـا الافـضـل ابـحـث انـجـلـيـزي┇〄*\n> *By|Sasuke*", message);
  }

  await message.react('⌛');
  conn.reply(message.chat, '> *֎ جــاري البحــــث عـن الصــور •••┊⏱️*', message, {
    contextInfo: { externalAdReply: { 
      mediaUrl: null, 
      mediaType: 1, 
      showAdAttribution: true,
      title: packname,
      body: wm,
      previewType: 0,
      sourceUrl: 'https://whatsapp.com/channel/0029VaeCXcY1CYoLdfAYap0e' 
    }}
  });

  async function createImageMessage(url) {
    const { imageMessage } = await generateWAMessageContent({
      image: { url }
    }, { upload: conn.waUploadToServer });
    return imageMessage;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
  }

  let imagesList = [];
  let { data } = await axios.get(`https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${text}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${text}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559`);
  let imageUrls = data.resource_response.data.results.map(item => item.images.orig.url);
  shuffleArray(imageUrls);
  let selectedImages = imageUrls.splice(0, 5);
  let counter = 1;

  for (let imageUrl of selectedImages) {
    imagesList.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({ text: `*❖⁩ نتيجـة البحـث عـن ←* ${text}\n𝐏𝐇𝐎𝐓𝐎 𝐍𝐔𝐌𝐁𝐄𝐑 ${counter++}\n> *By|Sasuke*` }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: '' }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: '',
        hasMediaAttachment: true,
        imageMessage: await createImageMessage(imageUrl)
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [{
          name: "cta_url",
          buttonParamsJson: `{"display_text":"Copy","Url":"https://www.pinterest.com/search/pins/?rs=typed&q=${text}","merchant_url":"https://www.pinterest.com/search/pins/?rs=typed&q=${text}"}`
        }]
      })
    });
  }

  const finalMessage = generateWAMessageFromContent(message.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({ text: `> *لـكـي يـكـون دقـيـق اكـتـب انـجـلـيـزي مــع وصــف لـلـصـوره*\n> *By|Sasuke*` }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: "" }),
          header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards: [...imagesList]
          })
        })
      }
    }
  }, { quoted: message });

  await message.react('✅');
  await conn.relayMessage(message.chat, finalMessage.message, { messageId: finalMessage.key.id });
};

handler.help = ["pinterest"];
handler.tags = ["البحث"];
handler.estrellas = 1;
handler.register = true;
handler.command = ['بين'];

export default handler;