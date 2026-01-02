"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This file is auto-generated, don't edit it
/**
 * Signature Util for Darabonba.
 */
const crypto_1 = __importDefault(require("crypto"));
class Client {
    /**
     * HmacSHA1 Signature
     * @param stringToSign string
     * @param secret string
     * @return signed bytes
     */
    static HmacSHA1Sign(stringToSign, secret) {
        const obj = crypto_1.default.createHmac('sha1', secret);
        obj.update(stringToSign);
        return obj.digest();
    }
    /**
     * HmacSHA1 Signature
     * @param stringToSign string
     * @param secret bytes
     * @return signed bytes
     */
    static HmacSHA1SignByBytes(stringToSign, secret) {
        return Client.HmacSHA1Sign(stringToSign, secret.toString());
    }
    /**
     * HmacSHA256 Signature
     * @param stringToSign string
     * @param secret string
     * @return signed bytes
     */
    static HmacSHA256Sign(stringToSign, secret) {
        const obj = crypto_1.default.createHmac('sha256', secret);
        obj.update(stringToSign);
        return obj.digest();
    }
    /**
     * HmacSHA256 Signature
     * @param stringToSign string
     * @param secret bytes
     * @return signed bytes
     */
    static HmacSHA256SignByBytes(stringToSign, secret) {
        return Client.HmacSHA256Sign(stringToSign, secret.toString());
    }
    /**
     * HmacSM3 Signature
     * @param stringToSign string
     * @param secret string
     * @return signed bytes
     */
    static HmacSM3Sign(stringToSign, secret) {
        const obj = crypto_1.default.createHmac('sm3', secret);
        obj.update(stringToSign);
        return obj.digest();
    }
    /**
     * HmacSM3 Signature
     * @param stringToSign string
     * @param secret bytes
     * @return signed bytes
     */
    static HmacSM3SignByBytes(stringToSign, secret) {
        return Client.HmacSM3Sign(stringToSign, secret.toString());
    }
    /**
     * SHA256withRSA Signature
     * @param stringToSign string
     * @param secret string
     * @return signed bytes
     */
    static SHA256withRSASign(stringToSign, secret) {
        const PEM_BEGIN = "-----BEGIN PRIVATE KEY-----\n";
        const PEM_END = "\n-----END PRIVATE KEY-----";
        if (!secret.startsWith(PEM_BEGIN)) {
            secret = PEM_BEGIN + secret;
        }
        if (!secret.endsWith(PEM_END)) {
            secret = secret + PEM_END;
        }
        var signerObject = crypto_1.default.createSign("RSA-SHA256");
        signerObject.update(stringToSign);
        var signature = signerObject.sign({ key: secret, padding: crypto_1.default.constants.RSA_PKCS1_PADDING });
        return signature;
    }
    /**
     * MD5 Signature
     *
     * @param stringToSign string
     * @return signed bytes
     */
    static MD5Sign(stringToSign) {
        return crypto_1.default.createHash('md5').update(stringToSign, 'utf8').digest();
    }
    /**
     * MD5 Signature
     *
     * @param bytesToSign bytes
     * @return signed bytes
     */
    static MD5SignForBytes(bytesToSign) {
        return Client.MD5Sign(bytesToSign.toString());
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map