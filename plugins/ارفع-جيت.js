import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';

const TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = 'fazbear-Official';
const REPO_NAME = 'uploads';

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) return m.reply('*⛔ يجب الرد على صورة أو فيديو أو صوت!*');

  const media = await q.download();
  const { ext } = await fileTypeFromBuffer(media);
  const fileName = `upload-${Date.now()}.${ext}`;
  const filePath = path.join('./tmp', fileName);

  if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
  fs.writeFileSync(filePath, media);

  try {
    await ensureGitHubFolderExists('uploads');

    const url = await uploadToGitHub(filePath, fileName);

    let cap = '*⌲ تم رفع الملف بنجاح إلى GitHub!*\n\n';
    cap += `*📂 الاسم:* ${fileName}\n`;
    cap += `*📁 الامتداد:* ${ext}\n`;
    cap += `*🔗 الرابط:* ${url}`;
    m.reply(cap);
  } catch (err) {
    console.error(err);
    m.reply(`❌ خطأ أثناء رفع الملف: ${err.message}`);
  } finally {
    fs.unlinkSync(filePath);
  }
};

export default handler;
handler.command = ['ارفع-جيت'];

const uploadToGitHub = async (filePath, fileName) => {
  const content = fs.readFileSync(filePath);
  const base64Content = Buffer.from(content).toString('base64');
  const uploadPath = `uploads/${fileName}`;
  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${uploadPath}`;

  const res = await axios.put(
    url,
    {
      message: `Upload ${fileName}`,
      content: base64Content,
      branch: 'main',
    },
    {
      headers: {
        Authorization: `token ${TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (res.status === 201 || res.status === 200) {
    return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${uploadPath}`;
  } else {
    throw new Error('فشل في رفع الملف.');
  }
};

const ensureGitHubFolderExists = async (folderName) => {
  const checkUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${folderName}?ref=main`;

  try {
    await axios.get(checkUrl, {
      headers: {
        Authorization: `token ${TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      const dummyPath = `${folderName}/.gitkeep`;
      const content = Buffer.from('').toString('base64');
      const createUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${dummyPath}`;

      await axios.put(
        createUrl,
        {
          message: 'Create uploads folder with .gitkeep',
          content,
          branch: 'main',
        },
        {
          headers: {
            Authorization: `token ${TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
    } else {
      throw new Error('حدث خطأ أثناء التحقق من مجلد uploads');
    }
  }
};