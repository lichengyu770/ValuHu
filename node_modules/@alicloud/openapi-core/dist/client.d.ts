import * as $dara from '@darabonba/typescript';
import * as $OpenApiUtil from './utils';
import Credential from '@alicloud/credentials';
import SPI, * as $SPI from '@alicloud/gateway-spi';
export * as $OpenApiUtil from './utils';
export { default as OpenApiUtil } from './utils';
export * from './exceptions/error';
import * as $_model from './models/model';
export * from './models/model';
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
    _globalParameters: $OpenApiUtil.GlobalParameters;
    _key: string;
    _cert: string;
    _ca: string;
    _disableHttp2: boolean;
    _retryOptions: $dara.RetryOptions;
    _tlsMinVersion: string;
    _attributeMap: $SPI.AttributeMap;
    /**
     * @remarks
     * Init client with Config
     *
     * @param config - config contains the necessary information to create a client
     */
    constructor(config: $OpenApiUtil.Config);
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
    doRPCRequest(action: string, version: string, protocol: string, method: string, authType: string, bodyType: string, request: $OpenApiUtil.OpenApiRequest, runtime: $dara.RuntimeOptions): Promise<{
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
    doROARequest(action: string, version: string, protocol: string, method: string, authType: string, pathname: string, bodyType: string, request: $OpenApiUtil.OpenApiRequest, runtime: $dara.RuntimeOptions): Promise<{
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
    doROARequestWithForm(action: string, version: string, protocol: string, method: string, authType: string, pathname: string, bodyType: string, request: $OpenApiUtil.OpenApiRequest, runtime: $dara.RuntimeOptions): Promise<{
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
    doRequest(params: $OpenApiUtil.Params, request: $OpenApiUtil.OpenApiRequest, runtime: $dara.RuntimeOptions): Promise<{
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
    execute(params: $OpenApiUtil.Params, request: $OpenApiUtil.OpenApiRequest, runtime: $dara.RuntimeOptions): Promise<{
        [key: string]: any;
    }>;
    callSSEApi(params: $OpenApiUtil.Params, request: $OpenApiUtil.OpenApiRequest, runtime: $dara.RuntimeOptions): AsyncGenerator<$_model.SSEResponse, any, unknown>;
    callApi(params: $OpenApiUtil.Params, request: $OpenApiUtil.OpenApiRequest, runtime: $dara.RuntimeOptions): Promise<{
        [key: string]: any;
    }>;
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
     * If the endpointRule and config.endpoint are empty, throw error
     *
     * @param config - config contains the necessary information to create a client
     */
    checkConfig(config: $OpenApiUtil.Config): void;
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
    getAccessDeniedDetail(err: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
}
