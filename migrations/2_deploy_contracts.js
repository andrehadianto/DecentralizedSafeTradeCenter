var SafeTrade = artifacts.require("./SafeTrade.sol");

module.exports = function (deployer) {
    deployer.deploy(SafeTrade);
};
