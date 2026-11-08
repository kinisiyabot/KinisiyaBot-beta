/*
$ curl -X GET http://93.177.64.145:9557/pair/:num

example:
$ curl -X GET http://93.177.64.145:9557/pair/201554582851

*/

import axios from "axios";

let veni = async (m, { conn, text }) => {
if (!text) return m.reply("🪴: *اكتب الرقم جنب الأمر*\n- مثال: *.جلسه 212693863911*")

try {
const formatNum = text.replace(/\s+/g,"").replace(/\+/g, "")
const { data: { code } } = await axios.get(`http://93.177.64.145:9557/pair/${formatNum}`)
await m.reply(code)
} catch (error) {
await m.reply(`Error: ${error.message}`)
}
};

veni.command = ['جلسه', 'session', 'جلسة']

export default veni

// تعديل من امام 🐦💗