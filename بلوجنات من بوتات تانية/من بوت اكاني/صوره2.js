import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys';
import { googleImage } from '@bochilteam/scraper';

const handler = async (_0x22faa1, { conn: _0x698bd1, text: _0x5a0279, usedPrefix: _0xf6ce21 }) => {
  const _0x124f60 = await getDevice(_0x22faa1.key.id);
  const _0x220c0a = ['caca', 'سكس', "اباحي", "مايا خليفه", "نيك", "شاذ", "شذوذ", "polla", 'porno', "porn", 'gore', 'cum', "semen", "puta", "puto", 'culo', "putita", "putito", "pussy", 'hentai', "pene", "coño", "asesinato", 'zoofilia', "mia khalifa", "desnudo", "desnuda", 'cuca', 'chocha', "muertos", "pornhub", "xnxx", "xvideos", "teta", "vagina", "marsha may", "misha cross", "sexmex", 'furry', "furro", "furra", 'xxx', "rule34", "panocha", "pedofilia", "necrofilia", 'pinga', "horny", "ass", "nude", 'popo', "nsfw", "femdom", "futanari", "erofeet", "sexo", "sex", "yuri", "ero", "ecchi", 'blowjob', "anal", "ahegao", "pija", "verga", "trasero", "violation", "violacion", "bdsm", 'cachonda', "+18", 'cp', "mia marin", "lana rhoades", "cepesito", 'hot', "buceta", 'xxx'];

  if (_0x220c0a.some(_0x12b3ac => _0x22faa1.text.toLowerCase().includes(_0x12b3ac))) {
    return _0x698bd1.reply(_0x22faa1.chat, " *استغفر ربك احسن* 😒", _0x22faa1);
  }

  if (!_0x5a0279) {
    throw "استخدم أمر صور عن طريق 🔎\n.صوره eren";
  }

  if (_0x124f60 !== "desktop" && _0x124f60 !== "web") {
    const _0x55f6e8 = await googleImage(_0x5a0279);
    var _0x5f2195 = await prepareWAMessageMedia({
      'image': {
        'url': _0x55f6e8.getRandom()
      }
    }, {
      'upload': _0x698bd1.waUploadToServer
    });

    const _0x4d8853 = {
      'body': {
        'text': ("- الـصـوره الـمـراد الــبحث عـنـها : " + _0x5a0279).trim()
      },
      'footer': {
        'text': "❯⏐ • 𝙱𝙾𝚃 𝙴𝙻𝚃𝙰𝚁𝙱𝙾𝙾 | 🐼❤️) ء".trim()
      },
      'header': {
        'title': "* *الـتـحـميل مـن مـوقـع صور جوجل 🪩*",
        'subtitle': '',
        'hasMediaAttachment': true,
        'imageMessage': _0x5f2195.imageMessage
      },
      'nativeFlowMessage': {
        'buttons': [{
          'name': "quick_reply",
          'buttonParamsJson': JSON.stringify({
            'display_text': "جيب صوره تاني",
            'id': ".image0 " + _0x5a0279
          })
        }],
        'messageParamsJson': ''
      }
    };

    let _0x8b65f7 = generateWAMessageFromContent(_0x22faa1.chat, {
      'viewOnceMessage': {
        'message': {
          'interactiveMessage': _0x4d8853
        }
      }
    }, {
      'userJid': _0x698bd1.user.jid,
      'quoted': _0x22faa1
    });

    _0x698bd1.relayMessage(_0x22faa1.chat, _0x8b65f7.message, {
      'messageId': _0x8b65f7.key.id
    });
  } else {
    _0x698bd1.sendFile(_0x22faa1.chat, "JoAnimi•Error.jpg", _0x22faa1);
  }
};

handler.help = ["صوره"];
handler.tags = ["For Test"];
handler.command = /^(image0|صوره)$/i;

export default handler;