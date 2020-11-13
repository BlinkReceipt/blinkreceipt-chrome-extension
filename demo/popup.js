document.addEventListener('DOMContentLoaded', () => {
    loadOrders();

    function loadOrders() {

        // chrome.runtime.getBackgroundPage(bg => {
                var bg = chrome.extension.getBackgroundPage();
                var ordersMap = bg._ordersCache || {};
                var ordersEl = document.getElementById("orders-list");
                let ordersListStr = "";

                for (let retailerId in ordersMap) {
                    let retailerMap = ordersMap[retailerId];
                    let isFirstOrder = false;

                    for (let orderKey in retailerMap) {
                        
                        let order = retailerMap[orderKey];
                        let uniqueValue = order[orderKey];
                       
                        let orderProductsCount = 0;
                        const products = order.products || null;
                        const shipments = order.shipments || null;
                        if (products != null) {
                            orderProductsCount += products.length;
                        } else if (shipments != null) {
                            for (let i = 0; i < shipments.length; i++) {
                                const shipment = shipments[i] || {};
                                const products = shipment.products || [];
                                orderProductsCount += products.length;
                            }
                        }
            
                        let date = new Date(order.receiptDate || order.dateUTC);
                        const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
                        const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
                        const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
                        console.log(`${da}-${mo}-${ye}`);
    
                        let merchantName = order.merchantName || "";
                        if (retailerId == "8897") {
                            merchantName = "Walmart Grocery";
                        }

                        if (isFirstOrder === false) {
                            isFirstOrder = true;
                            ordersListStr +=
                            `<li class="order-header">
                                <span style="text-align:left;">${merchantName}</span>
                            </li>`;
                        }

                        ordersListStr += 
                        `
                        <li class="amazon-order">
                            <div>
                                <span><strong>Order #:</strong> ${orderKey}</span>
                                <span>$${order.total}</span>
                            </div>
                            <div>
                                <span><strong>Date:</strong> ${mo} ${da}, ${ye}</span>
                                <span>${orderProductsCount} products</span>
                            </div>
                        </li>`
                    }
                }
                ordersEl.innerHTML = ordersListStr;
            // });

        setTimeout(function() {
            loadOrders()
        }, 1000);
    }

    // var bg = chrome.extension.getBackgroundPage();
    // var orders = bg.foundAmazonOrders || [];
    
    // var ordersEl = document.getElementById("amazon-orders-list");
    // for (let orderNum in orders) {

    //     const order = orders[orderNum];

    //     let li = document.createElement('li');
    //     li.className = "amazon-order";
    //     li.textContent = orderNum;
    //     ordersEl.appendChild(li);   

    // }

});
