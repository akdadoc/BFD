// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @author akdadoc 2020 CityTreed Project
/// @title City Trees: Big Fucking Dicks

import "../@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../@openzeppelin/contracts/utils/Counters.sol";

contract bigFDicks is ERC721URIStorage {
    using Counters for Counters.Counter;

    mapping(address => bool) private dickOwners;
    uint256 public minted = 0; // The amount of dicks that has been minted

    Counters.Counter private _dickIds;

    constructor() ERC721("Big Fucking Dicks", "BFD") {}

    function mintDick() external {
        require(
            dickOwners[msg.sender] == false,
            "Unauthorize Mint: Only 1 allowed per wallet"
        ); // Check if user address already owns asset.
        require(minted <= 999, "Unauthorized Mint: Maxium amount exceeded");

        _dickIds.increment();

        uint256 dickId = _dickIds.current();

        _safeMint(msg.sender, dickId);

        string memory _dickId_ = uintToString(dickId);
        string memory _uri_ = "http://cityroots.s3-website.us-east-2.amazonaws.com/bfd/";

        _setTokenURI(
            dickId,
            string(abi.encodePacked(_uri_, _dickId_, ".json"))
        ); //concentate strings

        dickOwners[msg.sender] = true;

        if (minted < 1000) {
            minted++;
        }
    }

    function uintToString(uint256 v) internal pure returns (string memory) {
        uint256 maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint256 i = 0;
        while (v != 0) {
            uint256 remainder = v % 10;
            v = v / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i); // i + 1 is inefficient
        for (uint256 j = 0; j < i; j++) {
            s[j] = reversed[i - j - 1]; // to avoid the off-by-one error
        }
        string memory str = string(s); // memory isn't implicitly convertible to storage
        return str;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);

        if (address(to) != address(0) && address(from) != address(0)) {
            dickOwners[to] = true; // Update dick owners with new owner on transfer
        }
    }
}
