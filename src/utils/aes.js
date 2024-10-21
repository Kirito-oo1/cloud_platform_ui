// import CryptoJS from "crypto-js/crypto-js";

// /* 加密 */
// const encryptionAES = (params) => {
//     let key = "dadich,roc2cloud";
//     key = CryptoJS.enc.Latin1.parse(key);
//     let iv = key;
//     let encrypted = CryptoJS.AES.encrypt(params, key, {
//         iv: iv,
//         mode: CryptoJS.mode.CBC,
//         padding: CryptoJS.pad.ZeroPadding
//     });
//     return encrypted.toString();
// };
// /* 解密 */
// const decryptionAES = (params) => {
//     let AESKey = "dadich,roc2cloud";
//     const key = CryptoJS.enc.Utf8.parse(AESKey);
//     let iv = CryptoJS.enc.Utf8.parse(AESKey.substr(0, 16));
//     const decrypt = CryptoJS.AES.decrypt(params, key, {
//         iv: iv,
//         mode: CryptoJS.mode.ECB,
//         padding: CryptoJS.pad.Pkcs7
//     });
//     return CryptoJS.enc.Utf8.stringify(decrypt).toString();
// }
// export {
//     encryptionAES,
//     decryptionAES
// }
