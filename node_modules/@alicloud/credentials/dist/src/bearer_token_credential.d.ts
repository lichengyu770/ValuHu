import DefaultCredential from './default_credential';
import ICredential from './icredential';
export default class BearerTokenCredential extends DefaultCredential implements ICredential {
    constructor(bearerToken: string);
}
