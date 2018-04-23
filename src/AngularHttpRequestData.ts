import { HttpHeaders, HttpParams } from '@angular/common/http';

import { ResponseType } from './ResponseType';
import { XHRMethod } from './XHRMethod';

/**
 * Request data.
 */
export interface AngularHttpRequestData {
    /**
     * Request information.
     */
    info: {
        /**
         * Request parameters.
         */
        params: HttpParams,
        /**
         * Response type.
         */
        responseType: ResponseType,
        /**
         * Extra http headers (includes Content-Type).
         */
        headers: HttpHeaders,
        /**
         * Observe mode, usually should be ```body``` that makes ```responseType``` work. If set to ```response```
         * service will return raw angular ```HttpResponse```. ```events``` still have no use.
         */
        observe: 'body' | 'response' | 'events'
    };
    /**
     * Request body.
     */
    body: any[];
    /**
     * Timeout. ```0``` means no timeout.
     */
    timeout: number;
    /**
     * Request method.
     */
    method: XHRMethod;
    /**
     * Request full url.
     */
    url: string;
}
