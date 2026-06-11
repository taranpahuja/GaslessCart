// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";
import "../src/GaslessCartPaymaster.sol";

contract GaslessCartPaymasterTest is Test {
    MockUSDC public usdc;
    GaslessCartPaymaster public paymaster;

    // Simulate cryptographic keys for actors
    uint256 public signerPrivateKey = 0xA11CE;
    uint256 public userPrivateKey = 0xB0B;

    address public verifyingSigner;
    address public user;
    address public merchant = address(0x3);

    function setUp() public {
        verifyingSigner = vm.addr(signerPrivateKey);
        user = vm.addr(userPrivateKey);

        // Deploy contracts locally
        usdc = new MockUSDC();
        paymaster = new GaslessCartPaymaster(address(usdc), verifyingSigner);

        // Distribute tokens to user and grant allowance permissions
        usdc.publicMint(user, 500 * 10 ** 18);

        vm.prank(user);
        usdc.approve(address(paymaster), type(uint256).max);
    }

    function testSuccessfulGaslessPurchase() public {
        uint256 purchaseAmount = 100 * 10 ** 18;
        uint256 feeAmount = 2 * 10 ** 18; // $2 gas fee compensation
        uint256 currentNonce = paymaster.nonces(user);

        // Compute the structural hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                user,
                merchant,
                purchaseAmount,
                feeAmount,
                currentNonce,
                block.chainid
            )
        );
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        // Sign payload using the trusted backend signer key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            signerPrivateKey,
            ethSignedMessageHash
        );
        bytes memory signature = abi.encodePacked(r, s, v);

        // Any third party executor (e.g., our relayer) runs the transaction paying the gas
        address relayer = address(0x9);
        vm.prank(relayer);
        paymaster.executeGaslessPurchase(
            user,
            merchant,
            purchaseAmount,
            feeAmount,
            signature
        );

        // Verify accurate ledger updates
        assertEq(usdc.balanceOf(merchant), purchaseAmount);
        assertEq(usdc.balanceOf(address(paymaster)), feeAmount);
        assertEq(paymaster.nonces(user), currentNonce + 1);
    }
}
