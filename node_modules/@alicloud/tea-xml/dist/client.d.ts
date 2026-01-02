export default class Client {
    static parseXml<T>(body: string, response: T): {
        [key: string]: any;
    };
    static toXML(body: {
        [key: string]: any;
    }): string;
    static _parseXML(body: string): any;
    static _xmlCast<T>(obj: any, clazz: T): {
        [key: string]: any;
    };
}
