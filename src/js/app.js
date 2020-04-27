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
                        fromBlock: "latest",
                    }
                )
                .watch(function (err, event) {
                    console.log("event triggered", event);
                });
            instance
                .addItemEvent(
                    {},
                    {
                        fromBlock: "latest",
                    }
                )
                .watch(function (err, event) {
                    console.log("event triggered", event);
                });
            instance
                .withdrawAllEvent(
                    {},
                    {
                        fromBlock: "latest",
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
                var activeAccount = document.createElement("p");
                activeAccount.innerHTML = "Active account: " + App.account;
                $("#activeAccount").append(activeAccount);

                var withdrawOverview = $("#withdrawOverview");
                withdrawOverview.empty();
                safeTradeInstance
                    .balances(App.account)
                    .then(function (balance) {
                        var accountBalance = balance;
                        var withdrawWrapper = document.createElement("div");
                        var withdrawData1 = document.createElement("p");
                        withdrawData1.innerHTML =
                            "TRANSFER FROM: " + "SAFE TRADE CENTER";
                        var withdrawData2 = document.createElement("p");
                        withdrawData2.innerHTML = "TRANSFER TO: " + App.account;
                        var withdrawData3 = document.createElement("p");
                        withdrawData3.innerHTML =
                            "AMOUNT: ETH " + accountBalance / Math.pow(10, 18);

                        withdrawWrapper.append(
                            withdrawData1,
                            withdrawData2,
                            withdrawData3
                        );
                        withdrawOverview.append(withdrawWrapper);
                    });

                var itemListing = $("#itemListing");
                itemListing.empty();
                for (var i = 1; i <= itemCount.toNumber(); i++) {
                    safeTradeInstance.items(i).then(function (item) {
                        var id = item[0];
                        var name = item[1];
                        var itemPrice = item[2] / Math.pow(10, 18);
                        var buyer = item[3];
                        var isReserved = item[4];
                        var seller = item[5];
                        var img = item[6];
                        var isDeleted = item[7];
                        if (!isDeleted) {
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
                            dealButton.className = "btn btn-dark";
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
                            var itemTemplate = document.createElement("div");
                            itemTemplate.className = "col-6";

                            var cardOuter = document.createElement("div");
                            cardOuter.style.cssText = "max-width: 600px;";
                            cardOuter.className = "card mb-3";
                            if (isReserved) {
                                cardOuter.className =
                                    "card mb-3 text-white bg-secondary";
                            }
                            var cardRow = document.createElement("div");
                            cardRow.className = "row no-gutters";
                            var cardImg = document.createElement("div");
                            cardImg.className = "col-md-4";
                            var cardImg_ = document.createElement("img");
                            cardImg_.className = "card-img";
                            cardImg_.style.cssText = "height: 241.04px;";
                            cardImg_.src = img;
                            cardImg.append(cardImg_);

                            var cardBody = document.createElement("div");
                            cardBody.className = "col-md-8";
                            var cardBody_ = document.createElement("div");
                            cardBody_.className = "card-body";
                            cardBody.append(cardBody_);

                            var cardClose = document.createElement("span");
                            cardClose.className = "pull-right clickable";
                            cardClose.style.cssText = "cursor: pointer;";
                            cardClose.addEventListener("click", function () {
                                App.contracts.SafeTrade.deployed()
                                    .then(function (instance) {
                                        return instance.delete(id, {
                                            from: App.account,
                                        });
                                    })
                                    .then(() => {
                                        $("#content").hide();
                                        $("#loader").show();
                                    })
                                    .catch((err) => {
                                        console.error(err);
                                    });
                            });
                            var cardIcon = document.createElement("i");
                            cardIcon.className = "fa fa-times";
                            cardClose.append(cardIcon);

                            var cardTitle = document.createElement("h5");
                            cardTitle.className = "card-title";
                            cardTitle.innerHTML = name;
                            if (isReserved) {
                                cardTitle.innerHTML =
                                    name +
                                    " <span class='badge  badge-warning'>RESERVED</span>";
                            }

                            var cardPrice = document.createElement("h1");
                            cardPrice.className = "card-text display-4";
                            cardPrice.innerHTML = "ETH " + itemPrice;

                            var cardMeta = document.createElement("p");
                            cardMeta.className = "card-text small";
                            cardMeta.innerHTML = "</br>Seller: " + seller;
                            if (isReserved) {
                                cardMeta.innerHTML =
                                    "Buyer: " +
                                    buyer +
                                    "</br>" +
                                    "Seller: " +
                                    seller;
                            }
                            if (isReserved) {
                                cardBody_.append(
                                    cardTitle,
                                    cardPrice,
                                    cardMeta,
                                    dealButton
                                );
                            } else {
                                cardBody_.append(
                                    cardClose,
                                    cardTitle,
                                    cardPrice,
                                    cardMeta,
                                    buyButton
                                );
                            }
                            cardRow.append(cardImg, cardBody);
                            cardOuter.append(cardRow);
                            itemTemplate.append(cardOuter);
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
        var itemPrice = $("#itemPrice").val() * Math.pow(10, 18);
        var imgLink = $("#itemImg").val() ? $("#itemImg").val() : "";
        App.contracts.SafeTrade.deployed()
            .then(function (instance) {
                return instance.addItem(itemName, itemPrice, imgLink, {
                    from: App.account,
                });
            })
            .then(function (res) {
                $("#addItemModal").modal("hide");
                $("#content").hide();
                $("#loader").show();
            })
            .catch(function (err) {
                console.error(err);
            });
    },

    withdrawAll: function () {
        App.contracts.SafeTrade.deployed()
            .then(function (instance) {
                return instance.withdrawAll({from: App.account});
            })
            .then(function (res) {
                $("#withdrawModal").modal("hide");
                $("#content").hide();
                $("#loader").show();
            })
            .catch((err) => {
                console.error(err);
            });
    },
};

$(function () {
    $(window).on("load", function () {
        App.init();
    });
});
