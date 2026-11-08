let handler = m => m;
handler.all = async function (m) {
  // التحقق مما إذا كانت الرسالة مرسلة من البوت
  if (m.key.fromMe) {
    return; // إيقاف التنفيذ إذا كانت الرسالة مرسلة من البوت
  }

  let chat = global.db.data.chats[m.chat];
  
  if (chat.isBanned) {
    return;  
  }
  
  const wm = '*واتربو*'; // أو يمكنك تعديل هذا لتحديد قيمة `wm` الصحيحة
  
  if (/^احا$/i.test(m.text)) { 
    conn.reply(m.chat, `*احتين علي احتك 🐦🥹*`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^يالاك$/i.test(m.text)) { 
    conn.reply(m.chat, `*قلبه 🥺♥*`, m, wm, null, [['الدعم', '#الدعم']]);
  }
  
  if (/^الحمدلله$/i.test(m.text)) { 
    conn.reply(m.chat, `ادام الله حمدك`, m, wm, null, [['الدعم', '#الدعم']]);
  }
 
  if (/^عبيط|يا عبيط|اهبل|غبي$/i.test(m.text)) { 
    conn.reply(m.chat, `*انت يبيبي 🥲❤️*`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^منور|منوره$/i.test(m.text)) { 
    conn.reply(m.chat, `*بنوري انا 🫠💔*`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^بوت$/i.test(m.text)) { 
    conn.reply(m.chat, `*اسمي تربو يسطا 🐦💔*`, m, wm, null, [['الدعم', '#الدعم']]);
  }
  
  if (/^يب$/i.test(m.text)) { 
    conn.reply(m.chat, `*يعم استرجل وقول نعم 🐦❤*`, m, wm, null, [['الدعم', '#الدعم']]);
  }
  
  if (/^ميسي$/i.test(m.text)) { 
    conn.reply(m.chat, `*عم العالم ♥😎*`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^بوت خرا|بوت زفت|خرا عليك$/i.test(m.text)) { 
    conn.reply(m.chat, `*🐤💔بص يا حب اذا كان لا يعجبك البوت لا تستخدمه لانك بسب البوت تكون قد سبيت مطور البوت*`, m, wm, null, [['الدعم', '#الدعم']]);
  }
  
  if (/^بنورك|دا نورك|نورك الاصل|نور نورك$/i.test(m.text)) { 
    conn.reply(m.chat, `*يعم بنوري انا 🫠🐦*`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^امزح|بهزر$/i.test(m.text)) { 
    conn.reply(m.chat, `*ماشي🥲*`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^في ايه$/i.test(m.text)) { 
    conn.reply(m.chat, `*انا معرفش حاجه🙂*`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^تست$/i.test(m.text)) { 
    conn.reply(m.chat, `*انا شغال يا ينجم 🐦💔*`, m, wm, null, [['الدعم', '#الدعم']]);
  }
  
  if (/^بتعمل ايه دلوقتي|بتعمل اي$/i.test(m.text)) { 
    conn.reply(m.chat, `*بكلمك🌚♥*`, m, wm, null, [['الدعم', '#الدعم']]);
  }
  
  if (/^انا جيت$/i.test(m.text)) { 
    conn.reply(m.chat, `منور ✨💜`, m, wm, null, [['الدعم', '#الدعم']]);
  }
  
  if (/^حرامي|سارق$/i.test(m.text)) { 
    conn.reply(m.chat, `*تتهم بريء بالسرقة من دون تحري او بحث عن حقيقة ليست ملموسة ارحنا واعمل شرطي ثم افتح فمك وثرثر فكلامك كـجاهل واحد بل جهلاً ارحم من حديثك تتصنع دور الشرطي وكأنك محقق بالله اصمت ولا تحرج نفسك ارحنا وارح أعصابك ان اكرمك الله بعقل فبسكوتك اقتل جهلك*`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^ملل|مللل|ملللل|زهق$/i.test(m.text)) { 
    conn.reply(m.chat, `*عارفين ف اسكت احسن لك🥱*`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^🤖$/i.test(m.text)) { 
    conn.reply(m.chat, `انت بوت عشان ترسل الملصق ده 🐦`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^🐦‍⬛$/i.test(m.text)) { 
    conn.reply(m.chat, `🐦`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^ايه$/i.test(m.text)) { 
    conn.reply(m.chat, `*مفيش يا حبي 🐤💔*`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^نعم$/i.test(m.text)) { 
    conn.reply(m.chat, `*حد ناداك 🌚🐦*`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^كيفك|شخبارك|علوك|عامل ايه|اخبارك|اي الدنيا$/i.test(m.text)) { 
    conn.reply(m.chat, `*الحمد لله و انت*`, m, wm, null, [['الدعم', '#الدعم']]);
  }

  if (/^🐤$/i.test(m.text)) { 
    conn.reply(m.chat, `🐦`, m, wm, null, [['الدعم', '#الدعم']]);
  }
  
  if (/^تصبح علي خير|تصبحوا علي خير$/i.test(m.text)) { 
    conn.reply(m.chat, `وانت من اهل الخير حبيبي✨💜`, m, wm, null, [['الدعم', '#الدعم']]);
  }
  
  if (/^ببحبك بوت|حبك|بوت بحبك$/i.test(m.text)) { 
    conn.reply(m.chat, `انا اكتر ✨🥹💜`, m, wm, null, [['الدعم', '#الدعم']]);
  }
   
  if (/^🙂$/i.test(m.text)) { 
    conn.reply(m.chat, `بص بعيد🙂`, m, wm, null, [['الدعم', '#الدعم']]);
  }
  
  if (/^باي$/i.test(m.text)) { 
    conn.reply(m.chat, `باي`, m, wm, null, [['الدعم', '#الدعم']]);
  }
   
  if (/^هلا$/i.test(m.text)) { 
    conn.reply(m.chat, `اهلا`, m, wm, null, [['الدعم', '#الدعم']]);
  }
  
  return !0;
}
export default handler;