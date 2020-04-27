var SafeTrade = artifacts.require("./SafeTrade.sol");

contract("SafeTrade", (accounts) => {
    describe("initialize two items", () => {
        beforeEach(() => {
            return SafeTrade.deployed()
                .then((instance) => {
                    safeTradeInstance = instance;
                    return safeTradeInstance.addItem("Item1", 10000, "", {
                        from: accounts[0],
                    });
                })
                .then(() => {
                    return safeTradeInstance.addItem("Item2", 20000, "", {
                        from: accounts[1],
                    });
                });
        });

        it("intializes with two items", () => {
            return SafeTrade.deployed()
                .then((instance) => {
                    return instance.itemCount();
                })
                .then((count) => {
                    assert.equal(count, 2);
                });
        });

        it("initializes the items with the correct values", () => {
            return SafeTrade.deployed()
                .then((instance) => {
                    safeTradeInstance = instance;
                    return safeTradeInstance.items(1);
                })
                .then((item) => {
                    assert.equal(item[0], 1, "contains the correct id");
                    assert.equal(
                        item[1],
                        "Item1",
                        "contains the correct item name"
                    );
                    assert.equal(
                        item[2],
                        10000,
                        "contains the correct item price"
                    );
                    assert.equal(item[3], 0x0, "item has no buyer yet");
                    assert.equal(item[4], false, "item is not reserved");
                    assert.equal(item[5], accounts[0], "correct seller");
                    assert.equal(item[6], "", "no image");
                    assert.equal(item[7], false, "item is not yet deleted");
                    return safeTradeInstance.items(2);
                })
                .then((item) => {
                    assert.equal(item[0], 2, "contains the correct id");
                    assert.equal(
                        item[1],
                        "Item2",
                        "contains the correct item name"
                    );
                    assert.equal(
                        item[2],
                        20000,
                        "contains the correct item price"
                    );
                    assert.equal(item[3], 0x0, "item has not buyer yet");
                    assert.equal(item[4], false, "item is not reserved");
                    assert.equal(item[5], accounts[1], "correct seller");
                    assert.equal(item[6], "", "no image");
                    assert.equal(item[7], false, "item is not yet deleted");
                });
        });

        it("cannot be bought by seller", () => {
            return SafeTrade.deployed()
                .then((instance) => {
                    safeTradeInstance = instance;
                    return safeTradeInstance.buy(1, {from: accounts[0]});
                })
                .then(assert.fail)
                .catch((err) => {
                    assert(
                        err.message.indexOf("revert") >= 0,
                        "error message must contain a revert"
                    );
                })
                .then(() => {
                    return safeTradeInstance.items(1);
                })
                .then((item) => {
                    assert.notEqual(item[3], accounts[0], "item has no buyer");
                    assert.notEqual(item[4], true, "item is not reserved");
                });
        });

        it("can be bought and reserved", () => {
            return SafeTrade.deployed()
                .then((instance) => {
                    safeTradeInstance = instance;
                    return safeTradeInstance.buy(1, {from: accounts[1]});
                })
                .then(() => {
                    return safeTradeInstance.items(1);
                })
                .then((item) => {
                    assert.equal(item[3], accounts[1], "Buyer is registered");
                    assert.equal(item[4], true, "item is reserved");
                    assert.equal(item[7], false, "item is not yet deleted");
                });
        });

        it("cannot delete reserved item", () => {
            return SafeTrade.deployed()
                .then((instance) => {
                    safeTradeInstance = instance;
                    return safeTradeInstance.removeListing(1, {
                        from: accounts[0],
                    });
                })
                .then(assert.fail)
                .catch((err) => {
                    assert(
                        err.message.indexOf("revert") >= 0,
                        "error message must contain a revert"
                    );
                })
                .then(() => {
                    return safeTradeInstance.items(1);
                })
                .then((item) => {
                    assert.notEqual(item[7], true, "item is not deleted");
                });
        });

        it("can seal the deal by confirming", () => {
            return SafeTrade.deployed()
                .then((instance) => {
                    safeTradeInstance = instance;
                    return safeTradeInstance.confirm(1, {from: accounts[1]});
                })
                .then(() => {
                    return safeTradeInstance.items(1);
                })
                .then((item) => {
                    assert.equal(item[7], true, "item should be deleted");
                });
        });

        it("can delete non-reserved item", () => {
            return SafeTrade.deployed()
                .then((instance) => {
                    safeTradeInstance = instance;
                    return safeTradeInstance.removeListing(2, {
                        from: accounts[1],
                    });
                })
                .then(() => {
                    return safeTradeInstance.items(2);
                })
                .then((item) => {
                    assert.equal(item[7], true, "item should be deleted");
                });
        });
    });
});
