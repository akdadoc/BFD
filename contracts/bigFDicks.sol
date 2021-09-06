// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @author akdadoc 2020 Sample Proof of Concept Project
/// @title BFDS: Big Fucking Dicks

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract bigFDicks is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    mapping(address => bool) private hasMinted;
    mapping(address => uint256) private dickOwners;

    uint256 public minted = 0; // The amount of dicks that has been minted

    Counters.Counter private _dickIds;

    constructor() ERC721("BFDS", "bfds") {}

    function mintDick() external {
        require(
            hasMinted[msg.sender] == false,
            "Unauthorize Mint: Only 1 allowed per wallet"
        ); // Check if user address already owns asset.

        if (minted <= 1000) {
            minted++;
        }

        require(minted <= 1000, "Unauthorized Mint: Maxium amount exceeded");

        _dickIds.increment();

        uint256 dickId = _dickIds.current();

        _safeMint(msg.sender, dickId);

        dickOwners[msg.sender] = dickId;

        string memory _dickId_ = uintToString(dickId);
        string
            memory _uri_ = "http://bfd.s3-website-us-east-1.amazonaws.com/meta/";

        _setTokenURI(
            dickId,
            string(abi.encodePacked(_uri_, _dickId_, ".json"))
        ); //concentate strings

        hasMinted[msg.sender] = true;
    }

    function getOwnerTokenId(address owner) external view returns (uint256) {
        uint256 tokenId = dickOwners[owner];
        return tokenId;
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
            hasMinted[to] = true; // Update dick owners with new owner on transfer
        }
    }

    function contractURI() public pure returns (string memory) {
        return "https://bfd.s3.amazonaws.com/meta/collection.json";
    }
}
