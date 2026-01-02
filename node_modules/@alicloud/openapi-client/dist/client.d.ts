/**
 * @remarks
 * This is for OpenApi SDK
 */
import * as $Util from '@alicloud/tea-util';
import Credential from '@alicloud/credentials';
import SPI, * as $SPI from '@alicloud/gateway-spi';
import { Readable } from 'stream';
import * as $tea from '@alicloud/tea-typescript';
export declare class GlobalParameters extends $tea.Model {
    headers?: {
        [key: string]: string;
    };
    queries?: {
        [key: string]: string;
    };
    static names(): {
        [key: string]: string;
    };
    static types(): {
        [key: string]: any;
    };
    constructor(map?: {
        [key: string]: any;
    });
}
/**
 * @remarks
 * Model for initing client
 */
export declare class Config extends $tea.Model {
    /**
     * @remarks
     * accesskey id
     */
    accessKeyId?: string;
    /**
     * @remarks
     * accesskey secret
     */
    accessKeySecret?: string;
    /**
     * @remarks
     * security token
     *
     * @example
     * a.txt
     */
    securityToken?: string;
    /**
     * @remarks
     * bearer token
     *
     * @example
     * the-bearer-token
     */
    bearerToken?: string;
    /**
     * @remarks
     * http protocol
     *
     * @example
     * http
     */
    protocol?: string;
    /**
     * @remarks
     * http method
     *
     * @example
     * GET
     */
    method?: string;
    /**
     * @remarks
     * region id
     *
     * @example
     * cn-hangzhou
     */
    regionId?: string;
    /**
     * @remarks
     * read timeout
     *
     * @example
     * 10
     */
    readTimeout?: number;
    /**
     * @remarks
     * connect timeout
     *
     * @example
     * 10
     */
    connectTimeout?: number;
    /**
     * @remarks
     * http proxy
     *
     * @example
     * http://localhost
     */
    httpProxy?: string;
    /**
     * @remarks
     * https proxy
     *
     * @example
     * https://localhost
     */
    httpsProxy?: string;
    /**
     * @remarks
     * credential
     */
    credential?: Credential;
    /**
     * @remarks
     * endpoint
     *
     * @example
     * cs.aliyuncs.com
     */
    endpoint?: string;
    /**
     * @remarks
     * proxy white list
     *
     * @example
     * http://localhost
     */
    noProxy?: string;
    /**
     * @remarks
     * max idle conns
     *
     * @example
     * 3
     */
    maxIdleConns?: number;
    /**
     * @remarks
     * network for endpoint
     *
     * @example
     * public
     */
    network?: string;
    /**
     * @remarks
     * user agent
     *
     * @example
     * Alibabacloud/1
     */
    userAgent?: string;
    /**
     * @remarks
     * suffix for endpoint
     *
     * @example
     * aliyun
     */
    suffix?: string;
    /**
     * @remarks
     * socks5 proxy
     */
    socks5Proxy?: string;
    /**
     * @remarks
     * socks5 network
     *
     * @example
     * TCP
     */
    socks5NetWork?: string;
    /**
     * @remarks
     * endpoint type
     *
     * @example
     * internal
     */
    endpointType?: string;
    /**
     * @remarks
     * OpenPlatform endpoint
     *
     * @example
     * openplatform.aliyuncs.com
     */
    openPlatformEndpoint?: string;
    /**
     * @remarks
     * credential type
     *
     * @example
     * access_key
     *
     * @deprecated
     */
    type?: string;
    /**
     * @remarks
     * Signature Version
     *
     * @example
     * v1
     */
    signatureVersion?: string;
    /**
     * @remarks
     * Signature Algorithm
     *
     * @example
     * ACS3-HMAC-SHA256
     */
    signatureAlgorithm?: string;
    /**
     * @remarks
     * Global Parameters
     */
    globalParameters?: GlobalParameters;
    /**
     * @remarks
     * privite key for client certificate
     *
     * @example
     * MIIEvQ
     */
    key?: string;
    /**
     * @remarks
     * client certificate
     *
     * @example
     * -----BEGIN CERTIFICATE-----
     * xxx-----END CERTIFICATE-----
     */
    cert?: string;
    /**
     * @remarks
     * server certificate
     *
     * @example
     * -----BEGIN CERTIFICATE-----
     * xxx-----END CERTIFICATE-----
     */
    ca?: string;
    /**
     * @remarks
     * disable HTTP/2
     *
     * @example
     * false
     */
    disableHttp2?: boolean;
    /**
     * @remarks
     * TLS Minimum Version
     *
     * @example
     * TLSv1, TLSv1.1, TLSv1.2, TLSv1.3
     */
    tlsMinVersion?: string;
    static names(): {
        [key: string]: string;
    };
    static types(): {
        [key: string]: any;
    };
    constructor(map?: {
        [key: string]: any;
    });
}
export declare class OpenApiRequest extends $tea.Model {
    headers?: {
        [key: string]: string;
    };
    query?: {
        [key: string]: string;
    };
    body?: any;
    stream?: Readable;
    hostMap?: {
        [key: string]: string;
    };
    endpointOverride?: string;
    static names(): {
        [key: string]: string;
    };
    static types(): {
        [key: string]: any;
    };
    constructor(map?: {
        [key: string]: any;
    });
}
export declare class Params extends $tea.Model {
    action: string;
    version: string;
    protocol: string;
    pathname: string;
    method: string;
    authType: string;
    bodyType: string;
    reqBodyType: string;
    style?: string;
    static names(): {
        [key: string]: string;
    };
    static types(): {
        [key: string]: any;
    };
    constructor(map?: {
        [key: string]: any;
    });
}
export default class Client {
    _endpoint: string;
    _regionId: string;
    _protocol: string;
    _method: string;
    _userAgent: string;
    _endpointRule: string;
    _endpointMap: {
        [key: string]: string;
    };
    _suffix: string;
    _readTimeout: number;
    _connectTimeout: number;
    _httpProxy: string;
    _httpsProxy: string;
    _socks5Proxy: string;
    _socks5NetWork: string;
    _noProxy: string;
    _network: string;
    _productId: string;
    _maxIdleConns: number;
    _endpointType: string;
    _openPlatformEndpoint: string;
    _credential: Credential;
    _signatureVersion: string;
    _signatureAlgorithm: string;
    _headers: {
        [key: string]: string;
    };
    _spi: SPI;
    _globalParameters: GlobalParameters;
    _key: string;
    _cert: string;
    _ca: string;
    _disableHttp2: boolean;
    _tlsMinVersion: string;
    _attributeMap: $SPI.AttributeMap;
    /**
     * @remarks
     * Init client with Config
     *
     * @param config - config contains the necessary information to create a client
     */
    constructor(config: Config);
    /**
     * @remarks
     * Encapsulate the request and invoke the network
     *
     * @param action - api name
     * @param version - product version
     * @param protocol - http or https
     * @param method - e.g. GET
     * @param authType - authorization type e.g. AK
     * @param bodyType - response body type e.g. String
     * @param request - object of OpenApiRequest
     * @param runtime - which controls some details of call api, such as retry times
     * @returns the response
     */
    doRPCRequest(action: string, version: string, protocol: string, method: string, authType: string, bodyType: string, request: OpenApiRequest, runtime: $Util.RuntimeOptions): Promise<{
        [key: string]: any;
    }>;
    /**
     * @remarks
     * Encapsulate the request and invoke the network
     *
     * @param action - api name
     * @param version - product version
     * @param protocol - http or https
     * @param method - e.g. GET
     * @param authType - authorization type e.g. AK
     * @param pathname - pathname of every api
     * @param bodyType - response body type e.g. String
     * @param request - object of OpenApiRequest
     * @param runtime - which controls some details of call api, such as retry times
     * @returns the response
     */
    doROARequest(action: string, version: string, protocol: string, method: string, authType: string, pathname: string, bodyType: string, request: OpenApiRequest, runtime: $Util.RuntimeOptions): Promise<{
        [key: string]: any;
    }>;
    /**
     * @remarks
     * Encapsulate the request and invoke the network with form body
     *
     * @param action - api name
     * @param version - product version
     * @param protocol - http or https
     * @param method - e.g. GET
     * @param authType - authorization type e.g. AK
     * @param pathname - pathname of every api
     * @param bodyType - response body type e.g. String
     * @param request - object of OpenApiRequest
     * @param runtime - which controls some details of call api, such as retry times
     * @returns the response
     */
    doROARequestWithForm(action: string, version: string, protocol: string, method: string, authType: string, pathname: string, bodyType: string, request: OpenApiRequest, runtime: $Util.RuntimeOptions): Promise<{
        [key: string]: any;
    }>;
    /**
     * @remarks
     * Encapsulate the request and invoke the network
     *
     * @param action - api name
     * @param version - product version
     * @param protocol - http or https
     * @param method - e.g. GET
     * @param authType - authorization type e.g. AK
     * @param bodyType - response body type e.g. String
     * @param request - object of OpenApiRequest
     * @param runtime - which controls some details of call api, such as retry times
     * @returns the response
     */
    doRequest(params: Params, request: OpenApiRequest, runtime: $Util.RuntimeOptions): Promise<{
        [key: string]: any;
    }>;
    /**
     * @remarks
     * Encapsulate the request and invoke the network
     *
     * @param action - api name
     * @param version - product version
     * @param protocol - http or https
     * @param method - e.g. GET
     * @param authType - authorization type e.g. AK
     * @param bodyType - response body type e.g. String
     * @param request - object of OpenApiRequest
     * @param runtime - which controls some details of call api, such as retry times
     * @returns the response
     */
    execute(params: Params, request: OpenApiRequest, runtime: $Util.RuntimeOptions): Promise<{
        [key: string]: any;
    }>;
    callApi(params: Params, request: OpenApiRequest, runtime: $Util.RuntimeOptions): Promise<{
        [key: string]: any;
    }>;
    /**
     * @remarks
     * Get user agent
     * @returns user agent
     */
    getUserAgent(): string;
    /**
     * @remarks
     * Get accesskey id by using credential
     * @returns accesskey id
     */
    getAccessKeyId(): Promise<string>;
    /**
     * @remarks
     * Get accesskey secret by using credential
     * @returns accesskey secret
     */
    getAccessKeySecret(): Promise<string>;
    /**
     * @remarks
     * Get security token by using credential
     * @returns security token
     */
    getSecurityToken(): Promise<string>;
    /**
     * @remarks
     * Get bearer token by credential
     * @returns bearer token
     */
    getBearerToken(): Promise<string>;
    /**
     * @remarks
     * Get credential type by credential
     * @returns credential type e.g. access_key
     */
    getType(): Promise<string>;
    /**
     * @remarks
     * If inputValue is not null, return it or return defaultValue
     *
     * @param inputValue - users input value
     * @param defaultValue - default value
     * @returns the final result
     */
    static defaultAny(inputValue: any, defaultValue: any): any;
    /**
     * @remarks
     * If the endpointRule and config.endpoint are empty, throw error
     *
     * @param config - config contains the necessary information to create a client
     */
    checkConfig(config: Config): void;
    /**
     * @remarks
     * set gateway client
     *
     * @param spi - .
     */
    setGatewayClient(spi: SPI): void;
    /**
     * @remarks
     * set RPC header for debug
     *
     * @param headers - headers for debug, this header can be used only once.
     */
    setRpcHeaders(headers: {
        [key: string]: string;
    }): void;
    /**
     * @remarks
     * get RPC header for debug
     */
    getRpcHeaders(): {
        [key: string]: string;
    };
}
