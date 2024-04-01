// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Users} from "./Users.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Manager is Users, Ownable {
    uint256 creditsPrice;

    event CreditsPriceUpdated(uint256 newCreditsPrice);

    error InvalidNewCreditsPrice(uint256 newCreditsPrice);
    error InvalidValue(uint256 value, uint256 expectedValue);

    // Constructor to set the initial creditsPrice
    constructor(uint256 _creditsPrice) Ownable(msg.sender) {
        creditsPrice = _creditsPrice;
        emit CreditsPriceUpdated(_creditsPrice);
    }

    function fundUser(uint256 _newCredits) public payable {
        uint256 calculatedValue = _calcValue(_newCredits);
        if (msg.value != calculatedValue) revert InvalidValue(msg.value, calculatedValue);
        _fundUser(_newCredits);
        // todo add logic to store the info in TableLand
    }

    /**
     * @dev Function to update the creditsPrice.
     * @param _newCreditsPrice The new credit price.
     * emits CreditsPriceUpdated event.
     */
    function updateFee(uint256 _newCreditsPrice) public onlyOwner {
        uint256 _oldCreditsPrice = creditsPrice;
        if (_newCreditsPrice == 0 || _newCreditsPrice == _oldCreditsPrice)
            revert InvalidNewCreditsPrice(_newCreditsPrice);
        creditsPrice = _newCreditsPrice;
        emit CreditsPriceUpdated(_newCreditsPrice);
    }

    function _calcValue(uint256 _credits) internal view returns (uint256) {
        return _credits * creditsPrice;
    }
}
