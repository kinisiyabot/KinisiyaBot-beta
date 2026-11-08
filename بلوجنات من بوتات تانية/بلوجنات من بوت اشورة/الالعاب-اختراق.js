const handler = async (m, { conn, command, text }) => {
  const lovePercentage = Math.floor(Math.random() * 100);
  const isHighLove = lovePercentage >= 50;
  const loveMessages = [
    "¡Eso es un amor ardiente y apasionado! ¡Ve y díselo ahora mismo!",
    "Parece que hay una chispa entre ustedes dos. ¡Inténtalo!",
    "Podría haber algo especial aquí. ¡Dale una oportunidad!",
    "Hmm, el amor está en el aire. ¡Quizás sea hora de un café juntos!",
    "Las estrellas indican que hay un potencial romántico. ¡Haz un movimiento!",
    "Una historia de amor increíble podría estar esperando para ser escrita por ustedes.",
    "No subestimen el poder del tiempo y la paciencia en el amor. Grandes cosas pueden suceder.",
    "Recuerden que el amor es un viaje, y cada paso es valioso, sin importar la distancia.",
    "Las conexiones fuertes pueden convertirse en relaciones hermosas. ¡Sigan explorando!",
    "El amor verdadero a menudo requiere tiempo y esfuerzo. ¡No renuncien!",
  ];
  const notSoHighLoveMessages = [
    "A veces, la amistad es el comienzo de algo hermoso, pero no siempre se convierte en amor.",
    "El amor no es todo, ¡la amistad también es genial! Mantengan su amistad especial.",
    "Recuerda que las mejores relaciones comienzan con una buena amistad. ¡No subestimen su vínculo!",
    "A veces, el amor puede crecer con el tiempo. ¡Sigan fortaleciendo su conexión!",
    "La vida es una sorpresa, ¡quién sabe qué depara el futuro! No pierdan la esperanza.",
    "Aunque el amor no florezca como esperaban, su conexión sigue siendo valiosa.",
    "Los corazones pueden tardar en sincronizarse, pero eso no disminuye lo especial que son juntos.",
    "A pesar de los desafíos del amor, su amistad es un regalo que merece ser celebrado.",
    "El tiempo puede revelar cosas sorprendentes. ¡Sigamos explorando juntos!",
    "La vida está llena de giros inesperados. ¡Permanezcan abiertos a las posibilidades!",
  ];
  const loveDescription = isHighLove ? "" : "";
  const getRandomMessage = (messages) => messages[Math.floor(Math.random() * messages.length)];
  const loveMessage = isHighLove ? getRandomMessage(loveMessages) : getRandomMessage(notSoHighLoveMessages);
  const response =
    `⌘━━━━━━━⬣ *『👑』* ⬣━━━━━━━⌘\n` +
    `*تم اختراقك بنجاح*✅, ${text}\n${loveDescription}\n*تم اختراقك بواسطه اشورا بوت ملفاتك وبياناتك عند شات المطورين كروكو*\n` + 
    `⌘━━━━━━━⬣ *『👑』* ⬣━━━━━━━⌘`    
  
  async function loading() {
var hawemod = [
"*جاري الاختراق*",
"*جاري تحميل الاختراق* 《 ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒》 0%",
"*جاري تحميل الصور* 《 █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒》10%",
"*تم تحميل الصور* 《 ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒》20%",
"*جاري تحميل الفيديوهات* 《 ███▒▒▒▒▒▒▒▒▒▒▒▒▒》30%",
"*تم تحميل الفيديوهات* 《 ████▒▒▒▒▒▒▒▒▒▒▒▒》40%",
"*جاري تحميل الاصوات* 《 █████▒▒▒▒▒▒▒▒▒▒▒》50%",
"*تم تحميل الاصوات* 《 ██████▒▒▒▒▒▒▒▒▒▒》60%",
"*جاري تحميل الملفات* 《 ███████▒▒▒▒▒▒▒▒▒》70%",
"*تم تحميل الملفات* 《 ████████▒▒▒▒▒▒▒▒》80%",
"*جاري تحميل محادثات واتساب* 《 █████████▒▒▒▒▒▒▒》90%",
"*تم تحميل محادثات واتساب* 《 ███████████▒▒▒▒▒》92%",
"*يتم تحميل الاختراق جاري رفع الاختراق علي السيرفر* 《 ███████████▒▒▒▒▒》95%",
"*تم الاتصال بجهاز الضحيه يتم تحميل البيانات* 《 ███████████▒▒▒▒▒》96%",
"*اختراق الضحيه 100% اكتمل جاري جمع جميع الادله* 《 ████████████▒▒▒▒》97%",
"*اكتمل الاختراق* ✅ 《 ████████████████》100%",
"*جاري حفظ بيانات الضحيه* ⌛",
"*تم حفظ بيانات الضحيه بنجاح* ✅"
]
   let { key } = await conn.sendMessage(m.chat, {text: `_*جاري الحصول علي عنوان IP هاتف المخترق*_`, mentions: conn.parseMention(response)}, {quoted: m})
 for (let i = 0; i < hawemod.length; i++) {
   await new Promise(resolve => setTimeout(resolve, 1000)); 
   await conn.sendMessage(m.chat, {text: hawemod[i], edit: key, mentions: conn.parseMention(response)}, {quoted: m}); 
  }
  await conn.sendMessage(m.chat, {text: response, edit: key, mentions: conn.parseMention(response)}, {quoted: m});         
 }
loading()    
};
handler.help = ['love'];
handler.tags = ['fun'];
handler.command = /^(تهكير|هكر)$/i;
handler.rowner = false
export default handler;
  
