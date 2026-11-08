import mongoose from 'mongoose';

const uri = 'mongodb+srv://itachi3mk:mypassis1199@cluster0.zzyxjo3.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB')).catch(error => console.error('Error connecting to MongoDB:', error));

const bk9Schema = new mongoose.Schema({
    groupId: String,
    userId: String,
    bk9: String
});

const BK9 = mongoose.model('BK9', bk9Schema);

let handler = async function (message, { conn, text, command, isAdmin }) {
    try {
        if (command === 'الالقاب') {
            if (!message.isGroup) {
                message.reply('*ف الجروبات بس يا حب*\n*تعالي جروب الدعم جربه*\n 『 https://chat.whatsapp.com/DXZjiND37zo2oZQoGcLTuU 』');
                return;
            }
            if (!isAdmin) {
                message.reply('*انت عضو ملكش لازمه والامر دا للادمن بس*');
                return;
            }
            const nicknames = await BK9.find({ groupId: message.chat });
            if (nicknames.length === 0) {
                message.reply(' لا يـوجـد ألـقـاب مـسـجـلـة حـالـيـا ┇');
            } else {
                let replyText = '┇الألقـاب المـسـجـلـة:\n\n';
                const mentions = [];
                for (const nickname of nicknames) {
                    const userId = nickname.userId + '@s.whatsapp.net';
                    replyText += `*『${nickname.bk9}』* - @${nickname.userId}\n`;
                    mentions.push(userId);
                }
                const imageUrl = 'https://telegra.ph/file/0e611ef0f5898f84e06ff.jpg';
                await conn.sendMessage(message.chat, { image: { url: imageUrl }, caption: replyText + '\n 𝐁𝐘┋❥ ILOMY☞𝐁𝐎𝐓┋', mentions });
            }
        } else if (command === 'لقب') {
            if (!message.isGroup) {
                message.reply('*ف الجروبات بس يا حب*');
                return;
            }
            if (!isAdmin) {
                message.reply('*للمشرفين بس*');
                return;
            }
            if (!message.mentionedJid || !text || text.trim() === '') {
                message.reply('*مثال:*\n *.لقب @العضو تربو*');
                return;
            }
            const userId = message.mentionedJid[0].replace('@s.whatsapp.net', '');
            const nickname = text.trim().split(' ').slice(1).filter(part => part.trim() !== '').join(' ');
            if (!/\S/.test(nickname)) {
                message.reply('*مثال:*\n *.تسجيل @العضو تربو*');
                return;
            }
            const existingNickname = await BK9.findOne({ bk9: nickname, groupId: message.chat });
            if (existingNickname) {
                const userName = await conn.getName(existingNickname.userId + '@s.whatsapp.net');
                message.reply('*┇ اللقب*' + nickname +'*ماخوذ من طرف @*' + existingNickname.userId);
            } else {
                await BK9.findOneAndUpdate({ userId, groupId: message.chat }, { bk9: nickname }, { upsert: true });
                message.reply('┇ تم تسجيله بلقب ' + nickname + ' بنجاح');
            }
        } else if (command === 'حذف_لقب') {
            if (!message.isGroup) {
                message.reply('هذا الأمر يعمل فقط في المجموعات');
                return;
            }
            if (!isAdmin) {
                message.reply('هذا الأمر يعمل فقط مع الإداريين');
                return;
            }
            if (!text || text.trim() === '') {
                message.reply('اكتب اللقب الذي تريد حذفه');
                return;
            }
            const nickname = text.trim();
            const result = await BK9.deleteOne({ bk9: nickname, groupId: message.chat });
            result.deletedCount > 0 ? message.reply('┇ تم حذف اللقب ' + nickname + ' بنجاح') : message.reply('اللّقب ' + nickname + ' غير مسجل لاحد اساسا');
        } else if (command === 'لقبي') {
            try {
                const userId = message.sender.split('@')[0];
                const userNickname = await BK9.findOne({ userId, groupId: message.chat });
                userNickname && userNickname.bk9 ? message.reply('┇ لقبك هو : ' + userNickname.bk9) : message.reply('┇ لم يتم تسجيلك بعد');
            } catch (error) {
                console.error('Error fetching user\'s nickname:', error);
                message.reply('حدث خطأ أثناء جلب لقبك');
            }
        } else if (command === 'لقبه' && message.mentionedJid) {
            if (!message.mentionedJid || message.mentionedJid.length === 0) {
                message.reply('منشن احد');
                return;
            }
            const userId = message.mentionedJid[0].replace('@s.whatsapp.net', '');
            const userNickname = await BK9.findOne({ userId, groupId: message.chat });
            if (userNickname) {
                message.reply('┇ لقبه هو : ' + userNickname.bk9);
            } else {
                message.reply('┇ لم يتم تسجيله بعد');
            }
        } else if (command === 'اللقب') {
            if (!text || text.trim() === '') {
                message.reply('اكتب لقب للتحقق منه');
                return;
            }
            const nickname = text.trim();
            const userNickname = await BK9.findOne({ bk9: nickname, groupId: message.chat });
            if (userNickname) {
                message.reply('┇ اللقب ' + nickname + ' ماخوذ من طرف @' + userNickname.userId);
            } else {
                message.reply('┇ اللقب ' + nickname + ' متوفر');
            }
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

handler.command = ['الالقاب','لقب', 'لقبي', 'لقبه', 'حذف_لقب', 'اللقب'];
handler.tags = ['BK9'];

export default handler;
