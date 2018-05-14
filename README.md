# DLCS Angular HttpClient Provider

![status](https://img.shields.io/travis/WinUP/dlcs-provider-angular-http.svg?style=flat-square)
[![npm](https://img.shields.io/npm/v/@dlcs/provider-angular-http.svg?style=flat-square)](https://www.npmjs.com/package/@dlcs/provider-angular-http)

Resource provider for Angular HttpClient.

### Configuration

| Name | Default value | Usage |
|-|:-|:-|
| ```server.address``` | ```''``` | Default server address from ```remote``` protocol |
| ```server.responseType``` | ```'json'``` | Default response type |
| ```server.contentType``` | ```'application/json'``` | Default content type |
| ```assets.address``` | ```''``` | Default address from ```assets``` protocol |

### Supported protocol

* ```remote``` for access default server defined in Configuration.
* ```assets``` for access staic files defined in Configuration.
* ```http``` for access http address.
* ```https``` for access https address.

### Request parameters

| Name | Default value | Description |
|-|:-|:-|
| ```responseType``` | Set by configuration | Respnse type |
| ```contentType``` | Set by configuration | Content type |
| ```method``` | ```XHRMethod.GET``` | Request http method. |
| ```headers``` | ```undefined``` | Extra headers |
| ```querys``` | ```undefined``` | URL query parameters |
| ```body``` | ```undefined``` | Request body, only affects POST/PUT/PATCH |
| ```timeout``` | ```undefined``` | Request timeout, do not set this value or set to ```0``` to disable timeout. |

Structure defined as [AngularHttpRequestParams](https://github.com/WinUP/dlcs-provider-angular-http/blob/master/src/AngularHttpRequestParams.ts).

### Supported mode

| Protocol | Asynchronized | Synchronized | Request | Submit | Delete |
|-|:-:|:-:|:-:|:-:|:-:|
| remote | √ | × | √ | √ | √ |
| assets | √ | × | √ | × | × |
| http   | √ | × | √ | √ | √ |
| https  | √ | × | √ | √ | √ |

### Injectors

| Timepoint | Data structure | Data description | Request method |
|-|:-|:-|:-|
| BeforeSend | ```AngularHttpRequestData``` | Request parameters | Request/Submit/Delete |
| AfterSent | ```Observable<any>``` | Response from HttpClient | Request/Submit/Delete |

See [AngularHttpRequestData](https://github.com/WinUP/dlcs-provider-angular-http/blob/master/src/AngularHttpRequestData.ts)'s definition.

### Example

```typescript
resourceManager.registerProtocol(new AngularHttpProtocol(this.httpClient)); // Angular HttpClient from Angular DI
// Request data
resourceManager.request.to(`http://www.google.com`).tag('google').send();
// Request using default server
http.config.server.address = 'http://www.a.org';
resourceManager.request.to(`remote:///test.txt`).tag('test').send();
// Request static file
http.config.assets.address = '/assets';
resourceManager.request.to(`assets:///test.txt`).tag('test_local').send();
// POST data
resourceManager.request.to(`http://www.test.org`).param({ method: XHRMethod.POST }).tag('google').send();
```
