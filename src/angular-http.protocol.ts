import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { SerializableNode, autoname, toPascalCase, isValueAvailable } from '@dlcs/tools';
import { ResourceProtocol, ResourceRequest, InjectorTimepoint } from '@dlcs/core';
import { TimeoutError } from 'rxjs/util/TimeoutError';
import { catchError } from 'rxjs/operators/catchError';
import { Observable } from 'rxjs/Observable';
import { timeout } from 'rxjs/operators/timeout';

import { AngularHttpRequestParams } from './AngularHttpRequestParams';
import { AngularHttpRequestData } from './AngularHttpRequestData';
import { ResponseType } from './ResponseType';
import { XHRMethod } from './XHRMethod';

/**
 * Configuration keys for StorageProtocol
 */
export interface AngularHttpProtocolConfigKeys {
    /**
     * Default server configuration for protocol ```remote```.
     */
    server: {
        /**
         * Default server address
         * @default ''
         */
        address: string,
        /**
         * Default resposne type, only allows ```ResponseType``` value
         * @default ResponseType.JSON
         */
        responseType: string,
        /**
         * Default content type
         * @default 'application/json'
         */
        contentType: string
    };
    /**
     * Default assets configuration for protocol ```assets```.
     */
    assets: {
        /**
         * Default assets address
         * @default ''
         */
        address: string
    };
}

export class AngularHttpProtocol extends ResourceProtocol {
    private static _config: SerializableNode = SerializableNode.create('AngularHttpProtocol', undefined);
    private static _configKeys: AngularHttpProtocolConfigKeys = {
        server: { address: '', responseType: '', contentType: '' },
        assets: { address: '' }
    };

    public static initialize(): void {
        autoname(AngularHttpProtocol._configKeys, '/', toPascalCase);
        SerializableNode.set(AngularHttpProtocol.config, AngularHttpProtocol.configKeys.server.address, '');
        SerializableNode.set(AngularHttpProtocol.config, AngularHttpProtocol.configKeys.server.contentType, 'application/json');
        SerializableNode.set(AngularHttpProtocol.config, AngularHttpProtocol.configKeys.server.responseType, ResponseType.JSON);
        SerializableNode.set(AngularHttpProtocol.config, AngularHttpProtocol.configKeys.assets.address, '');
    }

    /**
     * Create new AngularHttpProtocol
     * @param httpClient Angular 5+ HttpClient service
     */
    public constructor(private httpClient: HttpClient) {
        super('remote', 'assets', 'http', 'https');
    }

    /**
     * Get configuration
     */
    public static get config(): SerializableNode {
        return AngularHttpProtocol._config;
    }

    /**
     * Get configuration keys
     */
    public static get configKeys(): Readonly<AngularHttpProtocolConfigKeys> {
        return AngularHttpProtocol._configKeys;
    }

    private static packRequest(raw: ResourceRequest): AngularHttpRequestData {
        const request: { params: HttpParams, responseType: ResponseType, headers: HttpHeaders, observe: 'response' | 'body' } = {
            params: new HttpParams(),
            headers: new HttpHeaders(),
            observe: 'body',
            responseType: SerializableNode.get<ResponseType>(AngularHttpProtocol.config, AngularHttpProtocol.configKeys.server.responseType)
        };
        if (!isValueAvailable(request.responseType)) {
            request.responseType = ResponseType.JSON;
        }
        const rawParams: AngularHttpRequestParams = raw.params;
        if (rawParams.headers) { // 自定义Header
            Object.keys(rawParams.headers).forEach(key => {
                request.headers = request.headers.append(key, rawParams.headers![key]);
            });
        }
        if (rawParams.contentType) { // 请求格式
            request.headers = request.headers.set('Content-Type', rawParams.contentType);
        } else {
            const defaultContentType =
                SerializableNode.get<string>(AngularHttpProtocol.config, AngularHttpProtocol.configKeys.server.contentType);
            if (defaultContentType) {
                request.headers = request.headers.append('Content-Type', defaultContentType);
            }
        }
        if (rawParams.responseType) { // 回执格式
            if (rawParams.responseType === ResponseType.RAW) {
                request.observe = 'response';
            } else {
                request.responseType = rawParams.responseType;
            }
        }
        if (rawParams.querys) { // 查询参数
            Object.keys(rawParams.querys).forEach(key => {
                const value = rawParams.querys![key];
                if (isValueAvailable(value)) {
                    request.params = request.params.set(key, value);
                }
            });
        }
        const method: XHRMethod = rawParams.method || XHRMethod.GET;
        return {
            info: request,
            body: rawParams.body,
            timeout: rawParams.timeout || 0,
            method: method,
            url: AngularHttpProtocol.assembleUrl(raw, method)
        };
    }

    private static assembleUrl(request: ResourceRequest, method: XHRMethod): string {
        let url = request.protocol;
        if (request.protocol === 'assets') {
            if (method !== XHRMethod.GET) {
                throw new TypeError(`Cannot request asset file ${request.address}: Only GET method is allowed for this protocol`);
            }
            const base = SerializableNode.get<string>(AngularHttpProtocol.config, AngularHttpProtocol.configKeys.assets.address);
            if (!isValueAvailable(base)) {
                throw new ReferenceError(`Cannot request asset file ${request.address}: No assets directory provided`);
            }
            url = `${base}${request.address}`;
        } else if (request.protocol === 'remote') {
            const base = SerializableNode.get<string>(AngularHttpProtocol.config, AngularHttpProtocol.configKeys.server.address);
            if (!isValueAvailable(base)) {
                throw new ReferenceError(`Cannot request asset file ${request.address}: No default server provided`);
            }
            url = `${base}${request.address}`;
        } else {
            url = `${request.protocol}://${request.address}`;
        }
        return url;
    }

    private makeRequest(params: AngularHttpRequestData): Observable<any> {
        let result: Observable<any>;
        const requestBody = params.body.length === 0 ? null : (params.body.length === 1 ? params.body[0] : params.body);
        if (params.method === XHRMethod.GET) {
            result = this.httpClient.get(params.url, params.info as any);
        } else if (params.method === XHRMethod.DELETE) {
            result = this.httpClient.delete(params.url, params.info as any);
        } else if (params.method === XHRMethod.HEAD) {
            result = this.httpClient.head(params.url, params.info as any);
        } else if (params.method === XHRMethod.OPTIONS) {
            result = this.httpClient.options(params.url, params.info as any);
        } else if (params.method === XHRMethod.PATCH) {
            result = this.httpClient.patch(params.url, requestBody, params.info as any);
        } else if (params.method === XHRMethod.POST) {
            result = this.httpClient.post(params.url, requestBody, params.info as any);
        } else if (params.method === XHRMethod.PUT) {
            result = this.httpClient.put(params.url, requestBody, params.info as any);
        } else {
            throw new TypeError(`Cannot send request: ${params.method} is not a known http method`);
        }
        if (params.timeout > 0) {
            result = result.pipe(timeout(params.timeout));
        }
        return result;
    }

    public requestSync(request: ResourceRequest, injector: (data: any, timepoint: InjectorTimepoint) => any): any {
        throw new ReferenceError('Cannot request resource: Synchronized requests are not supported by AngularHttpProtocol');
    }

    public request(request: ResourceRequest, injector: (data: any, timepoint: InjectorTimepoint) => any): Observable<any> {
        let data = AngularHttpProtocol.packRequest(request);
        injector && (data = injector(data, InjectorTimepoint.BeforeSend));
        let result: Observable<any> = this.makeRequest(data);
        result = result.pipe(catchError(e => {
            return e instanceof TimeoutError
                ? Observable.throw(new HttpErrorResponse({
                    error: e.message,
                    status: 408,
                    headers: data.info.headers,
                    statusText: e.name,
                    url: request.address
                }))
                : Observable.throw(e);
        }));
        injector && (result = injector(result, InjectorTimepoint.AfterSent));
        return result;
    }
}

AngularHttpProtocol.initialize();
