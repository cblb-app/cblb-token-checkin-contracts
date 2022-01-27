// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Cblb.sol";

contract CblbCheckin is Ownable {
    event Checkin(address sender, uint256 timestamp, uint256 tokenAcquire);

    uint256 private constant tokenModelNumerator = 144600;
    uint256 private constant tokenModelDenominator = 6390;

    struct Cblber {
        uint256 checkinCount;
        uint256 cblbAcquired;
        uint256 lastCheckinTimestamp;
    }

    mapping(address => Cblber) public cblberInfo;
    mapping(uint256 => address) public checkinList;

    address public CblbAddress;
    uint256 public totalCheckin;
    uint256 public totalFee;
    uint256 public totalCblbMint;
    uint256 private claimableFee;

    constructor(address _cblbAddress) {
        CblbAddress = _cblbAddress;
    }

    function getCblbIssueAmount(uint256 index) public pure returns (uint256) {
        return
            SafeMath.div(
                SafeMath.mul(tokenModelNumerator, 1e18),
                SafeMath.add(index, 100)
            );
    }

    // for frontend
    function getCurrentCblbAmount() public view returns (uint256) {
        return
            SafeMath.div(
                SafeMath.mul(tokenModelNumerator, 1e18),
                SafeMath.add(totalCheckin, 100)
            );
    }

    function getCheckinGap() public view returns (uint256) {
        return
            SafeMath.sub(
                block.timestamp,
                cblberInfo[msg.sender].lastCheckinTimestamp
            );
    }

    function getCheckinFee() public pure returns (uint256) {
        return SafeMath.div(getCblbIssueAmount(100), tokenModelDenominator);
    }

    function checkin() public payable {
        require(
            getCheckinGap() > 1 days,
            "[CblbCheckn.sol]: CHECK IN GAP NEED MORE THAN ONE DAY"
        );

        require(
            msg.value >= getCheckinFee(),
            "[CblbCheckn.sol]: CHECK IN NEED MATIC AS FEE"
        );
        checkinList[totalCheckin] = msg.sender;

        claimableFee = SafeMath.add(claimableFee, getCheckinFee());
        totalFee = SafeMath.add(totalFee, getCheckinFee());

        cblberInfo[msg.sender].checkinCount = SafeMath.add(
            cblberInfo[msg.sender].checkinCount,
            1
        );
        cblberInfo[msg.sender].lastCheckinTimestamp = block.timestamp;

        CBLB cblb = CBLB(CblbAddress);
        uint256 tokenAcquire = getCblbIssueAmount(totalCheckin);

        totalCheckin = SafeMath.add(totalCheckin, 1);

        cblb.mint(msg.sender, tokenAcquire);
        totalCblbMint = SafeMath.add(totalCblbMint, tokenAcquire);

        cblberInfo[msg.sender].cblbAcquired = SafeMath.add(
            cblberInfo[msg.sender].cblbAcquired,
            tokenAcquire
        );

        emit Checkin(msg.sender, block.timestamp, tokenAcquire);
    }

    function getExpectedSwapRatio() public view returns (uint256) {
        if (totalCblbMint > 0) {
            return SafeMath.div(SafeMath.mul(totalFee, 1e18), totalCblbMint);
        } else {
            return 0;
        }
    }

    function devWithdrawAcquiredFee() public onlyOwner {
        msg.sender.transfer(claimableFee);
        claimableFee = 0;
    }

    function sendAcquireFeeToDev() public payable {
        address payable owner = payable(owner());
        owner.transfer(claimableFee);
        claimableFee = 0;
    }
}
