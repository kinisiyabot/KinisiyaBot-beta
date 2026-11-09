import * as pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg

var handler = async (m, { conn, usedPrefix }) => {
const hekma = ['اقبل كل التغيرات في حياتك ولا تقبل ان يتغير عليك احد.', 'لا مزيد من التعلم. المعرفة هي أداة قوية', 'أن العناية بصحتك الجسدية والعقلية هي أساسيات لحياة كاملة.', '"استمتع بالأشياء الصغيرة، يمكنها ان صبح كليره في يوم من الايام.', 'احصل على التسامح، حتى تتمكن من الحصول على نفس الشيء، لتحرير قلب.', 'ن قيمة الوقت الذي تقضيه مع شغفك هو الهدية الأكثر قيمة التي يمكنك الحصول عليها واستلامها.', 'كن ودودًا ورحيمًا مع الناس، فكل عمل مرتبط يمكنه أن يحدث فرقًا في حياتك.', 'اتخذ قرارًا بـ لا عندما تحتاج إلى ذلك، وحدد حدودًا جديرة بالثناء.', 'لا تقارن بأشياءك، كل شخص لديه طريقته الخاصة وروحه في الحياة.', 'استمع إلى زوجك بالتعاطف والفهم، فالتواصل هو أساس علاقة قوية.', 'تحاول التعبير عن مشاعرك، الصدق ضروري في الحب.', 'تعلم الأرز والتسوية، الحب يتطلب التضحية والبذل المتبادل', 'ان تخلي عنك الكل ف لا تيئس انت الأفضل', 'كل شخص لديه ميزه خارقه اجتهد لتعرف ميزتك', ' قم باخيار الخيارات الصعبه ف هي دائما الأفضل.', 'تذكر أن العلاقة مبنية على الثقة المتبادلة والاحترام', 'اختر شخصًا يكملك وسيكون إصدارًا أفضل لنفسك', 'الحب الحقيقي لن يصبح أقل، بل سيصبح أكثر.', 'عمار هو فعل، هو اختيار يوميات يتم زراعته بالأفعال والألفاظ.', 'إذا كنت استباقيًا وتؤدي إلى المبادرة في عملك، فهذا سيكون ذا قيمة من جانب تفوقك.', 'اتعرف بي أخطائك وإخفاقاتك، وستكون لديك فرص للنمو وتحسينها.', 'واجب عليك الصلي اليوميه لتستطيع تحقيق احلامك لان الله قادر علي كل شئ.', 'مية العلاقات الجيدة مع زملائك، فالعمل في الفريق ضروري لتحقيق النجاح','لا تجهد نفسك في البحث عن المساعدة أو البحث عن الإرشاد، دائمًا ما يكون هناك شيء جديد تتعلمه','تعرف على شعاراتك وقيمتها، واحتفل بنجاحاتك من خلال القليل منها','ابحث عن التوازن بين حياتك المهنية والشخصية، مع الجوانب المهمة'];
const randomImage = hekma[Math.floor(Math.random() * hekma.length)];
const url = ['https://telegra.ph/file/a69f4e9cf361408214a3b.jpg', 
             'https://telegra.ph/file/995e4fe8d4371d4a9693b.jpg', 
             'https://telegra.ph/file/f7a08e8795b30c396120d.jpg', 
             'https://telegra.ph/file/a1e458b7b401438c4d042.jpg', 
             'https://telegra.ph/file/bf83eff9c3ac97ae622f6.jpg', 
             'https://telegra.ph/file/95b96de8542d96ac3523b.jpg', 
             'https://telegra.ph/file/46f96abe2d0486290a40f.jpg', 
             'https://telegra.ph/file/636f8e455d8d8263ec80b.jpg'
             ]; 
  const random = url[Math.floor(Math.random() * url.length)];
   var messa = await prepareWAMessageMedia({ image: { url: random } }, { upload: conn.waUploadToServer });
let msg = generateWAMessageFromContent(m.chat, {
  viewOnceMessage: {
    message: {
        "messageContextInfo": {
          "deviceListMetadata": {},
          "deviceListMetadataVersion": 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({
            text: `*${randomImage}*\n*── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆*`
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: "‹ 𝐀𝐁𝐘𝐒𝐒_𝐁𝐎𝐓"
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            title: "*── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆*",
            subtitle: "",
            hasMediaAttachment: true, 
            imageMessage: messa.imageMessage, 
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
              {
                "name": "quick_reply",
                "buttonParamsJson": "{\"display_text\":\"التالي\",\"id\":\".حكمه\"}" 
                }, 
              {
                "name": "quick_reply",
                "buttonParamsJson": "{\"display_text\":\"الدعم\",\"id\":\".الدعم\"}"
               } 
              ],
          })
        })
    }
  }
}, {})

await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })

} 
handler.tags = ['frasss'];
handler.command = ['حكمه','حكمة'];
export default handler;