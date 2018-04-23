import { ResponseType } from './ResponseType';
import { XHRMethod } from '.';

/**
 * Request parameters.
 */
export interface AngularHttpRequestParams {
    /**
     * Respnse type.
     */
    responseType?: ResponseType;
    /**
     * Content type.
     */
    contentType?: string;
    /**
     * Extra headers.
     */
    headers?: { [key: string]: string };
    /**
     * Query parameters.
     */
    querys?: { [key: string]: string };
    /**
     * Request body. Only affects POST/PUT/PATCH.
     */
    body?: any;
    /**
     * Request timeout. Do not set this value or set to ```0``` to disable timeout.
     */
    timeout?: number;
    /**
     * Request http method (defualt GET).
     */
    method?: XHRMethod;
}
