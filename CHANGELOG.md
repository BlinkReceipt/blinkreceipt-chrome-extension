# Change Log

## 1.2.2

#### Added
* Returning partial orders with `orderUrl` value for `Amazon` when extra login is required to open the order details
* ProdIntel improvements
* Bug fixes and optimizations

---
## 1.2.1

#### Added
* `Picked Up` shipment status

---
## 1.2.0

#### Added
* `getMerchantStatus` function to check if user's session is valid or not
* shipment_status returns one of the following options: `Ordered`, `Delivered`, `Undelivered`, `Shipped`, `Returned`, `Cancelled`, `Invalid`

---
## 1.1.0

#### Added
* Error code improvements. Return 204 when list is empty.

#### Fixed
* `Amazon`
    * WholeFoods order support 
* `Shipt`
    * Unable to authenticate user 
* `Meijer`
    * Parsing orders 
    

---
## 1.0.1

#### Added
* `Walmart`
    * Split products into shipments 
* `Amazon`
    * Split products into shipments 
    * Added order subtotal and taxes 

#### Fixed
* `Walmart`
    * Adding support for the new walmart orders list


---
## 1.0.0
- Initial release
