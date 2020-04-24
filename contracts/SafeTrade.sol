pragma solidity ^0.4.25;


contract SafeTrade {
    struct Item {
        uint256 id;
        string name;
        uint256 price;
        address buyer;
        bool isReserved;
    }
    uint256 public itemCount;
    mapping(uint256 => Item) public items;
    event buyEvent(uint256 indexed _itemId);

    constructor() public {
        addItem("item1", 100);
        addItem("item2", 200);
    }

    function addItem(string _name, uint256 _price) private {
        itemCount++;
        items[itemCount] = Item(itemCount, _name, _price, 0x0, false);
    }

    function buy(uint256 _itemId) public {
        require(items[_itemId].isReserved == false, "Item is reserved");
        require(_itemId > 0 && _itemId <= itemCount, "Invalid item id");
        // update item reserved state
        items[_itemId].isReserved = true;
        // record who buy
        items[_itemId].buyer = msg.sender;
        emit buyEvent(_itemId);
    }
}

