/// <reference types="node" />
import SPI, * as $SPI from '@alicloud/gateway-spi';
export default class Client extends SPI {
    _sha256: string;
    _sm3: string;
    constructor();
    modifyConfiguration(context: $SPI.InterceptorContext, attributeMap: $SPI.AttributeMap): Promise<void>;
    modifyRequest(context: $SPI.InterceptorContext, attributeMap: $SPI.AttributeMap): Promise<void>;
    modifyResponse(context: $SPI.InterceptorContext, attributeMap: $SPI.AttributeMap): Promise<void>;
    getEndpoint(productId: string, regionId: string, endpointRule: string, network: string, suffix: string, endpointMap: {
        [key: string]: string;
    }, endpoint: string): string;
    defaultAny(inputValue: any, defaultValue: any): any;
    getAuthorization(pathname: string, method: string, query: {
        [key: string]: string;
    }, headers: {
        [key: string]: string;
    }, signatureAlgorithm: string, payload: string, ak: string, signingkey: Buffer, product: string, region: string, date: string): Promise<string>;
    getSignature(pathname: string, method: string, query: {
        [key: string]: string;
    }, headers: {
        [key: string]: string;
    }, signatureAlgorithm: string, payload: string, signingkey: Buffer): Promise<string>;
    getSigningkey(signatureAlgorithm: string, secret: string, product: string, region: string, date: string): Promise<Buffer>;
    getRegion(product: string, endpoint: string): string;
    buildCanonicalizedResource(query: {
        [key: string]: string;
    }): Promise<string>;
    buildCanonicalizedHeaders(headers: {
        [key: string]: string;
    }): Promise<string>;
    getSignedHeaders(headers: {
        [key: string]: string;
    }): Promise<string[]>;
}
