# BlinkReceipt Chrome Extension Library

This JavaScript library plugs in to a Chrome extension and enables the retrieval of order data from a set list of retailers.

## Setup

- Copy `accountLinking.js` into your extension's directory (CDN integration coming soon)

- You must configure your `manifest.json` in the following way (only relevant keys shown):

```
"background": {
        "scripts": [
            "accountLinking.js",
            "background.js"
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
Note: These values are meant to _supplement_ any values you already have in your manifest for these keys.

Note: `accountLinking.js` must appear _before_ your background script(s) in the `background.scripts` key

## Interacting with the `AccountLinking` object

In your background script, you will interact with the `AccountLinking` object that is created when `accountLinking.js` is loaded. There are 2 functions you can use to retrieve orders:

1. `AccountLinking.getUserOrders(options, callback)`
    
2. `AccountLinking.enableScheduledGetOrders(interval, options, callback)`
    
The difference is that the former retrieves orders on-demand, whereas the latter sets up order fetching on a fixed interval.

For the scheduled call, the `interval` parameter is the duration of each retrieval interval in seconds.

The `options` parameter is an object with the following properties:

| Property | Type | Description |
|---|---|---|
| `clientKey`  | `string`  | Your license key  |
| `retailers` | `array<string>` | An array of the retailer names you would like to try to retrieve orders for. The list of supported retailers can be obtained by calling `AccountLinking.getSupportedRetailers()` |
| `cutOffDays` | `integer` | How far back (in days) in the user's order history to search |

The `callback` function has the following signature:

```
function callback(name, code, data, errorMessage)
```
and the parameters are as follows:

| Property | Type | Description |
|---|---|---|
| `name` | `string` | The name of the retailer for this set of retrieve orders |
| `code` | `integer` | The status code of this retrieval attempt (200 is OK) |
| `data` | `string` | A base-64 encoded, encrypted payload of the retrieval results, which should be decrypted server side using your secret key |
| `errorMessage` | `string` | If an error occurred, this will be populated with the error message |

## Decrypting Results

The `data` parameter will contain the hex-encoded encrypted results. Here is the procedure for decryption:
 - The algorithm used for encryption & decryption is AES-128-CBC
 - The key is the first 16 bytes of your _secret key_ as assigned during setup
 - The initialization vector is the first 16 bytes of the encrypted text
 - You should remove the IV from the ciphertext prior to decryption (i.e. pull out the first 16 bytes which are the IV, and use the rest as the input for decryption)
 
### Decryption Samples in Different Languages 
- Node.js
```javascript
function decryptData(text, secretKey) {
    const buffer = Buffer.from(text, 'hex');
    const finalKey = Buffer.from(secretKey).slice(0, 16).toString();
    const iv = new Buffer.from(buffer.slice(0, 16));
    const encryptedText = new Buffer.from(buffer.slice(16, buffer.length));

    const decipher = crypto.createDecipheriv("aes-128-cbc", finalKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
```
- Java
- Bash

## Results Structure

Once decrypted, the results will be a JSON-encoded string that deserializes into this structure:

### Top Level object

| Key | Type | Notes |
|---|---|---|
| `merchantName` | `string` | |
| `total` | `float` | |
| `subtotal` | `float` | |
| `taxes` | `float` | |
| `receiptDate` | `string` | Format is `mm/dd/yyyy` |
| `receiptTime` | `string` | Format is `hh:mm` |
| `transactionId` | `string` | |
| `storeNumber` | `string` | |
| `storeAddress` | `string` | |
| `barcode` | `string` | |
| `last4CC` | `string` | |
| `products` | `array<Product>` | |
| `paymentMethods` | `array<PaymentMethod>` | |
| `qualifiedPromos` | `array<Promotion>` | |

### `Product` object

| Key | Type | Notes |
|---|---|---|
| `productNumber` | `string` | |
| `productName` | `string` | |
| `brand` | `string` | |
| `quantity` | `float` | |
| `unitOfMeasure` | `string` | e.g. "ounces", "packages", etc |
| `size` | `string` | |
| `unitPrice` | `float` | |
| `totalPrice` | `float` | The total price paid for this item taking into account quantities and discounts |
| `fullPrice` | `float` | The full price of this item before any discounts or coupons were applied |
| `category` | `string` | |
| `imgUrl` | `string` | |
| `upc` | `string` | |

### `PaymentMethod` object

| Key | Type | Notes |
|---|---|---|
| `amount` | `float` | |
| `method` | `string` | e.g. "Cash", "Credit", etc |
| `cardType` | `string` | e.g. "Visa", "Mastercard", etc |

### `Promotion` object

| Key | Type | Notes |
|---|---|---|
| `slug` | `string` | The identifier for this promo |
| `rewardValue` | `float` | |
| `rewardCurrency` | `string` | e.g. "USD" |
| `relatedProductIndexes` | `array<integer>` | The indexes of the items in the `products` array that qualified for this promotion |
| `qualifications` | `array<array<integer>>` | An array containing one element for each instance where this promotion qualified in an order. For example, a promo to buy ketchup & mustard would qualify twice on an order with `products` "ketchup, mustard, ketchup, mustard" and this property would have value: `[ [0,1], [2,3] ]` |