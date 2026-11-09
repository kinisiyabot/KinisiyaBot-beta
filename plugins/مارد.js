// • Developers : SONG × yertchi
// • Channel : https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V
import axios from "axios";
import crypto from "crypto";
import * as pkg from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg;

const BASE_URL = "https://apex-api-five.vercel.app/"; // ✅ API الخاص بك

let handler = async function (m, { text, conn }) {
  if (!text)
    return m.reply(
      `🎮 الأوامر:\n- لبدء اللعبة: .مارد ابدا\n- للرجوع: .مارد رجوع\n- لحذف الجلسة: .مارد حذف`
    );

  if (!conn.aki) conn.aki = {};
  const sessionKey = crypto
    .createHash("sha256")
    .update(`${m.chat}-${m.sender}`)
    .digest("hex");
  const session = conn.aki[sessionKey];

  // ===== دالة إرسال سؤال مارد مع الأزرار والصورة =====
  const sendQuestion = async (jid, question, imgUrl, quoted) => {
    const buttons = [
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: ".مارد نعم", id: ".مارد نعم" }) },
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: ".مارد لا", id: ".مارد لا" }) },
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: ".مارد لا أعرف", id: ".مارد لا أعرف" }) },
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: ".مارد ربما", id: ".مارد ربما" }) },
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: ".مارد ربما لا", id: ".مارد ربما لا" }) },
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🔙 رجوع", id: ".مارد رجوع" }) },
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "❌ حذف", id: ".مارد حذف" }) },
    ];

    try {
      let media = null;
      if (imgUrl) {
        media = await prepareWAMessageMedia(
          { image: { url: imgUrl } },
          { upload: conn.waUploadToServer }
        );
      }

      const msg = generateWAMessageFromContent(
        jid,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: proto.Message.InteractiveMessage.create({
                body: proto.Message.InteractiveMessage.Body.create({
                  text: `🧞‍♂️ مارد:\n${question}\n\nاختر إجابتك 👇`,
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: "By kinisiyabot",
                }),
                header: proto.Message.InteractiveMessage.Header.create(
                  media
                    ? {
                        hasMediaAttachment: true,
                        imageMessage: media.imageMessage,
                      }
                    : { hasMediaAttachment: false, title: "مارد" }
                ),
                nativeFlowMessage:
                  proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons,
                  }),
              }),
            },
          },
        },
        {}
      );

      await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    } catch (e) {
      console.error(e);
      return conn.sendMessage(
        jid,
        {
          text: `🧞‍♂️ مارد:\n${question}\n\nاكتب:\n.مارد نعم / لا / لا أعرف / ربما / ربما لا / رجوع / حذف`,
        },
        { quoted }
      );
    }
  };

  // ===== بدء اللعبة =====
  if (text === "ابدا") {
    try {
      const { data } = await axios.post(`${BASE_URL}/api/v1/games/mard-start`);
      if (!data.session || !data.signature)
        return m.reply("⚠️ فشل بدء الجلسة.");

      conn.aki[sessionKey] = {
        session: data.session,
        signature: data.signature,
        step: 0,
        progression: 0,
      };

      return sendQuestion(m.chat, data.question, null, m);
    } catch (err) {
      console.error(err);
      return m.reply("❌ حدث خطأ أثناء بدء اللعبة.");
    }
  }

  // ===== حذف الجلسة =====
  if (text === "حذف") {
    if (!session) return m.reply("🚫 لا توجد جلسة نشطة.");
    delete conn.aki[sessionKey];
    return m.reply("🧞‍♂️ تم حذف الجلسة بنجاح!");
  }

  // ===== الرجوع خطوة =====
  if (text === "رجوع") {
    if (!session) return m.reply("🚫 لا توجد جلسة نشطة.");
    try {
      const { data } = await axios.post(`${BASE_URL}/api/v1/games/mard-answer`, {
        session: session.session,
        signature: session.signature,
        step: session.step,
        progression: session.progression,
        cm: "false",
      });

      const img =
        data.akitude_url ||
        (data.akitude
          ? `https://ar.akinator.com/assets/img/akitudes_520x650/${data.akitude}`
          : null);

      conn.aki[sessionKey].step = data.step;
      conn.aki[sessionKey].progression = data.progression;

      return sendQuestion(m.chat, data.question, img, m);
    } catch (err) {
      console.error(err);
      return m.reply("⚠️ لا يمكن الرجوع حالياً.");
    }
  }

  // ===== إرسال الإجابة =====
  if (
    text === "نعم" ||
    text === "لا" ||
    text === "لا أعرف" ||
    text === "ربما" ||
    text === "ربما لا"
  ) {
    if (!session) return m.reply("🚫 لا توجد جلسة، ابدأ بـ .مارد ابدا");

    const answers = { "نعم": 0, "لا": 1, "لا أعرف": 2, "ربما": 3, "ربما لا": 4 };
    const answer = answers[text];

    try {
      const { data } = await axios.post(`${BASE_URL}/api/v1/games/mard-cancel`, {
        session: session.session,
        signature: session.signature,
        step: session.step,
        progression: session.progression,
        answer,
        cm: "false",
        sid: "NaN",
        question_filter: "string",
      });

      // إذا وصلنا للتخمين النهائي
      if (data.name_proposition) {
        delete conn.aki[sessionKey];
        return conn.sendMessage(
          m.chat,
          {
            image: { url: data.photo },
            caption: `🤖 أعتقد أنك تفكر في:\n\n✨ ${data.name_proposition}\n📜 ${data.description_proposition || "بدون وصف"}`,
          },
          { quoted: m }
        );
      }

      const img =
        data.akitude_url ||
        (data.akitude
          ? `https://ar.akinator.com/assets/img/akitudes_520x650/${data.akitude}`
          : null);

      conn.aki[sessionKey].step = data.step;
      conn.aki[sessionKey].progression = data.progression;

      return sendQuestion(m.chat, data.question, img, m);
    } catch (err) {
      console.error(err);
      return m.reply("⚠️ حدث خطأ أثناء الإجابة.");
    }
  }
};

handler.command = ["مارد"];
export default handler;