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
        bool isDeleted;
        uint256 dealTimeout;
    }
    uint256 public itemCount;

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public balances;
    event buyEvent(uint256 indexed _itemId);
    event addItemEvent(uint256 indexed _itemId);
    event withdrawAllEvent();

    function addItem(
        string _name,
        uint256 _price,
        string _img
    ) public {
        itemCount++;
        items[itemCount] = Item(
            itemCount,
            _name,
            _price,
            0x0,
            false,
            msg.sender,
            _img,
            false,
            2**256 -1
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
        items[_itemId].dealTimeout = block.timestamp + 72 hours;
        items[_itemId].isReserved = true;
        items[_itemId].buyer = msg.sender;
        emit buyEvent(_itemId);
    }

    function confirm(uint256 _itemId) public payable {
        require(
            items[_itemId].buyer != 0x0 && items[_itemId].isReserved == true,
            "No buyer yet"
        );
        require(msg.sender == items[_itemId].buyer, "Not authorized");
        items[_itemId].isDeleted = true;
        balances[items[_itemId].seller] += items[_itemId].price;
    }

    function dealTimeout(uint256 _itemId) public payable {
        require(msg.sender == items[_itemId].buyer, "Not authorized");
        require(items[_itemId].dealTimeout < block.timestamp, "expiry date not reached");
        items[_itemId].isDeleted = true;
        balances[items[_itemId].buyer] += items[_itemId].price;
    }

    function withdrawAll() public payable {
        uint256 amount = balances[msg.sender];
        msg.sender.transfer(amount);
        balances[msg.sender] = 0;
        emit withdrawAllEvent();
    }

    function removeListing(uint256 _itemId) public {
        require(msg.sender == items[_itemId].seller, "Not authorized");
        require(!items[_itemId].isReserved, "Already reserved");
        items[_itemId].isDeleted = true;
    }

}
