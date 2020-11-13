# BlinkReceipt Chrome Extension Library

This JavaScript library plugs in to a Chrome extension and enables the retrieval of order data from a set list of retailers.

## Setup

- Copy `alp.js` into your extension's directory (CDN integration coming soon)

- You must configure your `manifest.json` in the following way (only relevant keys shown):

```
"background": {
        "scripts": [
            "alpjs.js" //must appear before your own background script(s)
        ]
    },
    "content_security_policy": "script-src 'self' 'wasm-eval'; object-src 'self'",
    "permissions": [
        "tabs",
        "storage",
        "cookies",
        "background",
        "*://*/*"
    ]
```
Notes: These values are meant to _supplement_ any values you already have in your extension for these keys. For example, it is assumed you also have your own background page in the `background.scripts` key

## Interacting with the `alpjs` object

- In your background script, you will interact with the `alpjs` object that is created when `alpjs.js` is loaded

- There are 2 functions you can use to retrieve orders:
    1. `alpjs.getUserOrders(options, callback)`
    2. `aljs.enableScheduledGetOrders(interval, options, callback)`
    
- The difference is that the former retrieves orders on-demand, whereas the latter sets up order fetching on a fixed interval.

- For the scheduled call, the `interval` parameter is the duration of each retrieval interval in seconds.

- The `options` parameter is an object with the following properties:

| Property | Type | Description |
|---|---|---|
| clientKey  | string  | Your license key  |
| retailers | array&lt;string&gt; | An array of the retailer names you would like to try to retrieve orders for. The list of supported retailers can be obtained by alling `alpjs.getSupportedRetailers()` |
| cutOffDays | integer | How far back in the user's order history to search |

- The `callback` function has the following signaure:
```
function callback(name, code, data, errorMessage)
```
- and the parameters are as follows:

| Property | Type | Description |
|---|---|---|
| name | string | The name of the retailer for this set of retrieve orders |
| code | integer | The status code of this retrieval attempt (200 is OK) |
| data | string | A base-64 encoded, encrypted payload of the retrieval results, which should be decrypted server side using your secret key |
| errorMessage | string | If an error occurred, this will be populated with the error message |