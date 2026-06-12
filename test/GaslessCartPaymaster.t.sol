// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";
import "../src/GaslessCartPaymaster.sol";

contract GaslessCartPaymasterTest is Test {
    MockUSDC public usdc;
    GaslessCartPaymaster public paymaster;

    uint256 public signerPrivateKey = 0xA11CE;
    uint256 public userPrivateKey = 0xB0B;

    address public verifyingSigner;
    address public user;
    address public merchant = address(0x3);

    function setUp() public {
        verifyingSigner = vm.addr(signerPrivateKey);
        user = vm.addr(userPrivateKey);

        usdc = new MockUSDC();
        paymaster = new GaslessCartPaymaster(address(usdc), verifyingSigner);

        usdc.publicMint(user, 500 * 10 ** 18);

        // Notice we removed usdc.approve() here.
        // We are testing true zero-gas initializations now.
    }

    function testSuccessfulGaslessPurchaseWithPermit() public {
        uint256 purchaseAmount = 100 * 10 ** 18;
        uint256 feeAmount = 2 * 10 ** 18;
        uint256 totalAmountNeeded = purchaseAmount + feeAmount;
        uint256 currentNonce = paymaster.nonces(user);

        // ------------------------------------------------------------------
        // STEP 1: Generate the Backend Authorization Signature
        // ------------------------------------------------------------------
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

        (uint8 backendV, bytes32 backendR, bytes32 backendS) = vm.sign(
            signerPrivateKey,
            ethSignedMessageHash
        );
        bytes memory backendSignature = abi.encodePacked(
            backendR,
            backendS,
            backendV
        );

        // ------------------------------------------------------------------
        // STEP 2: Generate the User's EIP-2612 Permit Signature
        // ------------------------------------------------------------------
        uint256 permitDeadline = block.timestamp + 1 hours;
        uint256 tokenNonce = usdc.nonces(user);

        // A. Hash the permit variables exactly as the ERC-20 standard expects
        bytes32 permitStructHash = keccak256(
            abi.encode(
                keccak256(
                    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                ),
                user,
                address(paymaster),
                totalAmountNeeded,
                tokenNonce,
                permitDeadline
            )
        );

        // B. Bind the struct hash to the USDC contract's unique Domain Separator
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                usdc.DOMAIN_SEPARATOR(),
                permitStructHash
            )
        );

        // C. The user signs the permit hash
        (uint8 permitV, bytes32 permitR, bytes32 permitS) = vm.sign(
            userPrivateKey,
            permitHash
        );

        // D. Package the signature into our custom struct
        GaslessCartPaymaster.PermitData memory permitData = GaslessCartPaymaster
            .PermitData({
                deadline: permitDeadline,
                v: permitV,
                r: permitR,
                s: permitS
            });

        // ------------------------------------------------------------------
        // STEP 3: Execute as Relayer (Passing all 6 arguments)
        // ------------------------------------------------------------------
        address relayer = address(0x9);
        vm.prank(relayer);

        paymaster.executeGaslessPurchase(
            user,
            merchant,
            purchaseAmount,
            feeAmount,
            backendSignature,
            permitData
        );

        // ------------------------------------------------------------------
        // STEP 4: Assert State Changes
        // ------------------------------------------------------------------
        assertEq(usdc.balanceOf(merchant), purchaseAmount);
        assertEq(usdc.balanceOf(address(paymaster)), feeAmount);
        assertEq(paymaster.nonces(user), currentNonce + 1);
    }
}
