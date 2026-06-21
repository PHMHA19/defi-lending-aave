// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library EnumerableSet {
    struct AddressSet {
        address[] _values;
        mapping(address => uint256) _indexes; // index + 1
    }

    function add(AddressSet storage set, address value) internal returns (bool) {
        if (contains(set, value)) return false;
        set._values.push(value);
        set._indexes[value] = set._values.length;
        return true;
    }

    function remove(AddressSet storage set, address value) internal returns (bool) {
        uint256 index = set._indexes[value];
        if (index == 0) return false;

        uint256 toDeleteIndex = index - 1;
        uint256 lastIndex = set._values.length - 1;

        if (lastIndex != toDeleteIndex) {
            address lastValue = set._values[lastIndex];
            set._values[toDeleteIndex] = lastValue;
            set._indexes[lastValue] = index;
        }

        set._values.pop();
        delete set._indexes[value];
        return true;
    }

    function contains(AddressSet storage set, address value) internal view returns (bool) {
        return set._indexes[value] != 0;
    }

    function values(AddressSet storage set) internal view returns (address[] memory) {
        return set._values;
    }
}