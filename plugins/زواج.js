import fetch from 'node-fetch';

let toM = a => '@' + a.split('@')[0];

async function handler(m, { conn, groupMetadata }) {
    // لن يتم التحقق من الجواهر ولن يتم خصم أي شيء

    // قم بإرسال رسالة تأكيد الجريمة
    let ps = groupMetadata.participants.map(v => v.id);
    let a = ps[Math.floor(Math.random() * ps.length)];
    let b;
    do {
        b = ps[Math.floor(Math.random() * ps.length)];
    } while (b === a);

    // رابط الصورة الذي تريده
    const fgytSrdf = 'https://telegra.ph/file/0dde86d97f9cab0ea3ccb.jpg';

    // إرسال الصورة مع الكابشن
    await conn.sendFile(m.chat, fgytSrdf, 'image.jpg', 
    `*🧬 اعــلان زواج 🧬*
*❯💗 ╎الــعــࢪﯾـس : ${toM(a)}*
*❯🥹 ╎الــعـࢪوسه : ${toM(b)}*
*الف مبروك* 🎉🎉
> "كل واحد يوزع حلويات ويشيل معاه البوفيه 😂😂`, 
    m, false, { mentions: [a, b] });
}

handler.help = ['formarpareja'];
handler.tags = ['main', 'fun'];
handler.command = ['تزوج', 'زواج'];
handler.group = true;

export default handler;