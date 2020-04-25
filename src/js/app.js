App = {
    web3Provider: null,
    contracts: {},
    account: "0x0",

    init: function () {
        return App.initWeb3();
    },

    initWeb3: function () {
        if (typeof web3 !== "undefined") {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            App.web3Provider = new Web3.providers.HttpProvider(
                "http://localhost:7545"
            );
            web3 = new Web3(App.web3Provider);
        }
        return App.initContract();
    },

    initContract: function () {
        $.getJSON("SafeTrade.json", function (safeTrade) {
            App.contracts.SafeTrade = TruffleContract(safeTrade);
            App.contracts.SafeTrade.setProvider(App.web3Provider);

            App.listenForEvents();

            return App.render();
        });
    },

    listenForEvents: function () {
        App.contracts.SafeTrade.deployed().then(function (instance) {
            instance
                .buyEvent(
                    {},
                    {
                        fromBlock: 0,
                        toBlock: "latest",
                    }
                )
                .watch(function (err, event) {
                    console.log("event triggered", event);
                    App.render();
                });
            instance
                .addItemEvent(
                    {},
                    {
                        fromBlock: 0,
                        toBlock: "latest",
                    }
                )
                .watch(function (err, event) {
                    console.log("event triggered", event);
                    App.render();
                });
        });
    },

    render: function () {
        var safeTradeInstance;
        var loader = $("#loader");
        var content = $("#content");

        loader.show();
        content.hide();

        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                App.account = account;
                $("#accountAddress").html("Your Account: " + account);
            }
        });

        App.contracts.SafeTrade.deployed()
            .then(function (instance) {
                safeTradeInstance = instance;
                return safeTradeInstance.itemCount();
            })
            .then(function (itemCount) {
                var itemListing = $("#itemListing");
                itemListing.empty();
                for (var i = 1; i <= itemCount.toNumber(); i++) {
                    safeTradeInstance.items(i).then(function (item) {
                        var id = item[0];
                        var name = item[1];
                        var itemPrice = item[2];
                        var buyer = item[3];
                        var isReserved = item[4];
                        var seller = item[5];
                        var img = item[6];
                        var isPurchased = item[7];
                        if (!isPurchased) {
                            var buyButton = document.createElement("button");
                            buyButton.innerHTML = "Buy";
                            buyButton.className = "btn btn-primary";
                            buyButton.style.cssText = "margin-right:10px;";
                            buyButton.addEventListener("click", function () {
                                App.contracts.SafeTrade.deployed()
                                    .then(function (instance) {
                                        return instance.buy(id, {
                                            from: App.account,
                                            value: web3.toWei(
                                                itemPrice,
                                                "ether"
                                            ),
                                        });
                                    })
                                    .then(function (res) {
                                        content.hide();
                                        loader.show();
                                    })
                                    .catch(function (err) {
                                        console.error(err);
                                    });
                            });

                            var dealButton = document.createElement("button");
                            dealButton.innerHTML = "Deal";
                            dealButton.className = "btn btn-primary";
                            dealButton.addEventListener("click", function () {
                                App.contracts.SafeTrade.deployed()
                                    .then(function (instance) {
                                        return instance.confirm(id, {
                                            from: App.account,
                                        });
                                    })
                                    .then(function (res) {
                                        $("#content").hide();
                                        $("#loader").show();
                                    })
                                    .then(function (err) {
                                        console.error(err);
                                    });
                            });
                            var itemTemplate = document.createElement("tr");
                            var _id = document.createElement("th");
                            _id.innerHTML = id;
                            var _name = document.createElement("td");
                            _name.innerHTML = name;
                            var _img = document.createElement("td");
                            var _img2 = document.createElement("img");
                            _img2.setAttribute("src", img);
                            _img.append(_img2);
                            var _itemPrice = document.createElement("td");
                            _itemPrice.innerHTML = itemPrice;
                            var _isReserved = document.createElement("td");
                            _isReserved.innerHTML = isReserved;
                            var _buyer = document.createElement("td");
                            _buyer.innerHTML = buyer;
                            var _seller = document.createElement("td");
                            _seller.innerHTML = seller;

                            itemTemplate.append(_id);
                            itemTemplate.append(_name);
                            itemTemplate.append(_img);
                            itemTemplate.append(_itemPrice);
                            itemTemplate.append(_isReserved);
                            itemTemplate.append(_buyer);
                            itemTemplate.append(_seller);
                            itemTemplate.append(buyButton);
                            itemTemplate.append(dealButton);

                            itemListing.append(itemTemplate);
                        }
                    });
                }
                loader.hide();
                content.show();
            })
            .catch(function (err) {
                console.warn(err);
            });
    },

    addItem: function () {
        var itemName = $("#itemName").val();
        var itemPrice = $("#itemPrice").val();
        var imgLink = $("#itemImg").val() ? $("#itemImg").val() : "";
        App.contracts.SafeTrade.deployed()
            .then(function (instance) {
                return instance.addItem(itemName, itemPrice, imgLink, {
                    from: App.account,
                });
            })
            .then(function (res) {
                $("#content").hide();
                $("#loader").show();
            })
            .catch(function (err) {
                console.error(err);
            });
    },
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
