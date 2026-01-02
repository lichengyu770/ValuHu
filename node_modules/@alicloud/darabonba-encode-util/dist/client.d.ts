/// <reference types="node" />
export default class Client {
    /**
     * Encode the URL
     * @param url string
     * @return encoded string
     */
    static urlEncode(url: string): string;
    /**
     * Special encoding for url params.
     * @param params string
     * @return encoded string
     */
    static percentEncode(raw: string): string;
    /**
     * Encode the partial path of url.
     * @param path string
     * @return encoded string
     */
    static pathEncode(path: string): string;
    /**
     * Hex encode for byte array.
     * @param raw byte array
     * @return encoded string
     */
    static hexEncode(raw: Buffer): string;
    /**
     * Hash the raw data with signatureAlgorithm.
     * @param raw hashing data
     * @param signatureAlgorithm the autograph method
     * @return hashed bytes
     */
    static hash(raw: Buffer, signatureAlgorithm: string): Buffer;
    /**
     * Base64 encoder for byte array.
     * @param raw byte array
     * @return encoded string
     */
    static base64EncodeToString(raw: Buffer): string;
    /**
     * Base64 dncoder for string.
     * @param src string
     * @return dncoded byte array
     */
    static base64Decode(src: string): Buffer;
}
