/// <reference types="node" />
export default class Client {
    /**
     * HmacSHA1 Signature
     * @param stringToSign string
     * @param secret string
     * @return signed bytes
     */
    static HmacSHA1Sign(stringToSign: string, secret: string): Buffer;
    /**
     * HmacSHA1 Signature
     * @param stringToSign string
     * @param secret bytes
     * @return signed bytes
     */
    static HmacSHA1SignByBytes(stringToSign: string, secret: Buffer): Buffer;
    /**
     * HmacSHA256 Signature
     * @param stringToSign string
     * @param secret string
     * @return signed bytes
     */
    static HmacSHA256Sign(stringToSign: string, secret: string): Buffer;
    /**
     * HmacSHA256 Signature
     * @param stringToSign string
     * @param secret bytes
     * @return signed bytes
     */
    static HmacSHA256SignByBytes(stringToSign: string, secret: Buffer): Buffer;
    /**
     * HmacSM3 Signature
     * @param stringToSign string
     * @param secret string
     * @return signed bytes
     */
    static HmacSM3Sign(stringToSign: string, secret: string): Buffer;
    /**
     * HmacSM3 Signature
     * @param stringToSign string
     * @param secret bytes
     * @return signed bytes
     */
    static HmacSM3SignByBytes(stringToSign: string, secret: Buffer): Buffer;
    /**
     * SHA256withRSA Signature
     * @param stringToSign string
     * @param secret string
     * @return signed bytes
     */
    static SHA256withRSASign(stringToSign: string, secret: string): Buffer;
    /**
     * MD5 Signature
     *
     * @param stringToSign string
     * @return signed bytes
     */
    static MD5Sign(stringToSign: string): Buffer;
    /**
     * MD5 Signature
     *
     * @param bytesToSign bytes
     * @return signed bytes
     */
    static MD5SignForBytes(bytesToSign: Buffer): Buffer;
}
