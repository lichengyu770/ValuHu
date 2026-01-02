import ICredential from '../icredential';
type IProvider = {
    getCredential: () => ICredential;
};
export declare function getCredentials(providers?: IProvider[]): ICredential;
export {};
