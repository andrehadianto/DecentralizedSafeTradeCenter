pragma solidity ^0.4.25;


contract SafeTrade {
    struct Item {
        uint id;
        string name;
        uint price;
    }

    mapping(uint => Item) public items;
    uint public itemCount;

    constructor() public {
        addItem("item1", 100);
        addItem("item2", 200);
    }

    function addItem(string _name, uint _price) private {
        itemCount++;
        items[itemCount] = Item(itemCount, _name, _price);
    }
}

// https://youtu.be/3681ZYbDSSk?t=3390