import ICredential from './icredential';
import SessionCredential from './session_credential';
export default class URICredential extends SessionCredential implements ICredential {
    credentialsURI: string;
    readTimeout?: number;
    connectTimeout?: number;
    constructor(uri: string);
    updateCredential(): Promise<void>;
}
