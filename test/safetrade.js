var SafeTrade = artifacts.require("./SafeTrade.sol");

contract("SafeTrade", function (accounts) {
    it("intializes with two items", function () {
        return SafeTrade.deployed()
            .then(function (instance) {
                return instance.itemCount();
            })
            .then(function (count) {
                assert.equal(count, 2);
            });
    });

    it("initializes the items with the correct values", function () {
        return SafeTrade.deployed()
            .then(function (instance) {
                safeTradeInstance = instance;
                return safeTradeInstance.items(1);
            })
            .then(function (item) {
                assert.equal(item[0], 1, "contains the correct id");
                assert.equal(
                    item[1],
                    "item1",
                    "contains the correct item name"
                );
                assert.equal(item[2], 100, "scontains the correct item price");
                return safeTradeInstance.items(2);
            })
            .then(function (item) {
                assert.equal(item[0], 2, "contains the correct id");
                assert.equal(
                    item[1],
                    "item2",
                    "contains the correct item name"
                );
                assert.equal(item[2], 200, "scontains the correct item price");
            });
    });
});
