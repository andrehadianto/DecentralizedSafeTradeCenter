App = {
    web3Provider: null,
    contracts: {},
    account: "0x0",

    init: function () {
        return App.initWeb3();
    },

    initWeb3: function () {
        // TODO: refactor conditional
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
            // Instantiate a new truffle contract from the artifact
            App.contracts.SafeTrade = TruffleContract(safeTrade);
            // Connect provider to interact with contract
            App.contracts.SafeTrade.setProvider(App.web3Provider);

            App.listenForEvents();

            return App.render();
        });
    },

    // Listen for events emitted from the contract
    listenForEvents: function () {
        App.contracts.SafeTrade.deployed().then(function (instance) {
            // Restart Chrome if you are unable to receive this event
            // This is a known issue with Metamask
            // https://github.com/MetaMask/metamask-extension/issues/2393
            instance
                .votedEvent(
                    {},
                    {
                        fromBlock: 0,
                        toBlock: "latest",
                    }
                )
                .watch(function (error, event) {
                    console.log("event triggered", event);
                    // Reload when a new vote is recorded
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

        // Load account data
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                App.account = account;
                $("#accountAddress").html("Your Account: " + account);
            }
        });

        // Load contract data
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

                        // Render item Result
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
                            "</td></tr>";
                        itemListing.append(itemTemplate);

                        // Render item ballot option
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
                return safeTradeInstance.voters(App.account);
            })
            .catch(function (error) {
                console.warn(error);
            });
    },

    // castVote: function () {
    //     var candidateId = $("#itemSelect").val();
    //     App.contracts.SafeTrade.deployed()
    //         .then(function (instance) {
    //             return instance.vote(candidateId, {from: App.account});
    //         })
    //         .then(function (result) {
    //             // Wait for votes to update
    //             $("#content").hide();
    //             $("#loader").show();
    //         })
    //         .catch(function (err) {
    //             console.error(err);
    //         });
    // },
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
