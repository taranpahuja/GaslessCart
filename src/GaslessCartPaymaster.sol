// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract GaslessCartPaymaster {
    using ECDSA for bytes32;

    address public owner;
    IERC20 public stablecoin;
    address public verifyingSigner;

    mapping(address => uint256) public nonces;

    event PaymentProcessed(address indexed user, address indexed merchant, uint256 amount, uint256 executionFee);

    // Structure to neatly package the EIP-2612 Permit signature parameters
    struct PermitData {
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor(address _stablecoin, address _verifyingSigner) {
        owner = msg.sender;
        stablecoin = IERC20(_stablecoin);
        verifyingSigner = _verifyingSigner;
    }

    /**
     * @notice Executes a merchant purchase with true zero-gas initialization via Permit.
     */
    function executeGaslessPurchase(
        address user,
        address merchant,
        uint256 amount,
        uint256 executionFee,
        bytes calldata backendSignature,
        PermitData calldata permit // The user's signature to approve token spending
    ) external {
        // 1. Calculate the total tokens needed (Product + Gas Fee)
        uint256 totalAmountNeeded = amount + executionFee;

        // 2. Consume the user's Permit signature to grant this contract allowance
        // This is where the magic happens: Zero-gas approval!
        IERC20Permit(address(stablecoin))
            .permit(user, address(this), totalAmountNeeded, permit.deadline, permit.v, permit.r, permit.s);

        // 3. Verify the Backend Authorization Signature (same as MVP)
        bytes32 messageHash =
            keccak256(abi.encodePacked(user, merchant, amount, executionFee, nonces[user], block.chainid));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ethSignedMessageHash.recover(backendSignature);
        require(signer == verifyingSigner, "Invalid backend signature");

        nonces[user]++;

        // 4. Settle the funds
        require(stablecoin.transferFrom(user, merchant, amount), "Merchant settlement failed");
        require(stablecoin.transferFrom(user, address(this), executionFee), "Gas reimbursement failed");

        emit PaymentProcessed(user, merchant, amount, executionFee);
    }

    // Allows owner to withdraw collected stablecoin reimbursements
    function withdrawTokens() external onlyOwner {
        uint256 balance = stablecoin.balanceOf(address(this));

        // Wrap the transfer in a require statement to check the boolean return value
        require(stablecoin.transfer(owner, balance), "Withdrawal failed");
    }
}
