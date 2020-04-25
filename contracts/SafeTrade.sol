pragma solidity ^0.4.25;


contract SafeTrade {
    struct Item {
        uint256 id;
        string name;
        uint256 price;
        address buyer;
        bool isReserved;
        address seller;
        string img;
        bool isPurchased;
    }
    uint256 public itemCount;

    mapping(uint256 => Item) public items;
    event buyEvent(uint256 indexed _itemId);
    event addItemEvent(uint256 indexed _itemId);

    function addItem(string _name, uint256 _price, string _img) public {
        itemCount++;
        items[itemCount] = Item(
            itemCount,
            _name,
            _price,
            0x0,
            false,
            msg.sender,
            _img,
            false
        );
        emit addItemEvent(itemCount);
    }

    function buy(uint256 _itemId) public payable {
        require(
            msg.sender != items[_itemId].seller,
            "Cannot buy your own item"
        );
        require(items[_itemId].isReserved == false, "Item is reserved");
        require(_itemId > 0 && _itemId <= itemCount, "Invalid item id");
        items[_itemId].isReserved = true;
        items[_itemId].buyer = msg.sender;
        emit buyEvent(_itemId);
    }

    function confirm(uint256 _itemId) public payable {
        require(msg.sender == items[_itemId].seller, "Invalid authorization");
        require(
            items[_itemId].buyer != 0x0 && items[_itemId].isReserved == true,
            "No buyer yet"
        );
        items[_itemId].isPurchased = true;
        msg.sender.transfer(address(this).balance);
    }
}
