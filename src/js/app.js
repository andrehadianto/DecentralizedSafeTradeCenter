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
                .watch(function (error, event) {
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

                var itemSelect = $("#itemSelect");
                itemSelect.empty();

                for (var i = 1; i <= itemCount; i++) {
                    safeTradeInstance.items(i).then(function (item) {
                        var id = item[0];
                        var name = item[1];
                        var itemPrice = item[2];
                        var buyer = item[3];
                        var isReserved = item[4];

                        var itemTemplate =
                            "<tr><th>" +
                            id +
                            "</th><td>" +
                            name +
                            "</td><td>" +
                            `<img src='http://placekitten.com/200/150?image=${id}'` +
                            "</td><td>" +
                            "SGD " +
                            itemPrice +
                            "</td><td>" +
                            isReserved +
                            "</td></tr>";
                        itemListing.append(itemTemplate);

                        var itemOption =
                            "<option value='" +
                            id +
                            "' >" +
                            name +
                            "</ option>";
                        itemSelect.append(itemOption);
                    });
                }
                loader.hide();
                content.show();
            })
            .catch(function (error) {
                console.warn(error);
            });
    },

    buyItem: function () {
        var itemId = $("#itemSelect").val();
        App.contracts.SafeTrade.deployed()
            .then(function (instance) {
                return instance.buy(itemId, {from: App.account});
            })
            .then(function (result) {
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
