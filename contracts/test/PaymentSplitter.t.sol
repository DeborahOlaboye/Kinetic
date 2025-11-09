// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PaymentSplitter.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title PaymentSplitterTest
 * @notice Test suite for PaymentSplitter contract (public goods distribution)
 * @dev Tests initialization, payments, releases, and edge cases
 */
contract PaymentSplitterTest is Test {
    PaymentSplitter public implementation;
    PaymentSplitter public splitter;
    MockERC20 public token;

    // Test recipients (public goods projects)
    address payable public climateDAO = payable(address(0x1));
    address payable public openSourceDev = payable(address(0x2));
    address payable public educationFund = payable(address(0x3));

    // Test users
    address public alice = payable(address(0x4));
    address public bob = payable(address(0x5));

    // Events to test
    event PayeeAdded(address account, uint256 shares);
    event PaymentReleased(address to, uint256 amount);
    event ERC20PaymentReleased(IERC20 indexed token, address to, uint256 amount);
    event PaymentReceived(address from, uint256 amount);

    function setUp() public {
        // Deploy implementation
        implementation = new PaymentSplitter();

        // Setup recipients with 50%, 30%, 20% allocation
        address[] memory payees = new address[](3);
        payees[0] = climateDAO;
        payees[1] = openSourceDev;
        payees[2] = educationFund;

        uint256[] memory shares = new uint256[](3);
        shares[0] = 5000; // 50%
        shares[1] = 3000; // 30%
        shares[2] = 2000; // 20%

        // Deploy proxy
        bytes memory initData = abi.encodeWithSelector(PaymentSplitter.initialize.selector, payees, shares);

        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);

        splitter = PaymentSplitter(payable(address(proxy)));

        // Deploy mock ERC20 token
        token = new MockERC20("Test Token", "TEST");

        // Fund test accounts
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        token.mint(alice, 1000000 ether);
        token.mint(bob, 1000000 ether);
    }

    /*//////////////////////////////////////////////////////////////
                    INITIALIZATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Initialize_SetsPayeesAndShares() public {
        assertEq(splitter.totalShares(), 10000, "Total shares should be 10000 (100%)");
        assertEq(splitter.shares(climateDAO), 5000, "Climate DAO should have 5000 shares (50%)");
        assertEq(splitter.shares(openSourceDev), 3000, "Open Source Dev should have 3000 shares (30%)");
        assertEq(splitter.shares(educationFund), 2000, "Education Fund should have 2000 shares (20%)");
    }

    function test_Initialize_RevertsOnLengthMismatch() public {
        PaymentSplitter newImpl = new PaymentSplitter();

        address[] memory payees = new address[](2);
        payees[0] = climateDAO;
        payees[1] = openSourceDev;

        uint256[] memory shares = new uint256[](3);
        shares[0] = 5000;
        shares[1] = 3000;
        shares[2] = 2000;

        bytes memory initData = abi.encodeWithSelector(PaymentSplitter.initialize.selector, payees, shares);

        vm.expectRevert("PaymentSplitter: payees and shares length mismatch");
        new ERC1967Proxy(address(newImpl), initData);
    }

    function test_Initialize_RevertsOnNoPayees() public {
        PaymentSplitter newImpl = new PaymentSplitter();

        address[] memory payees = new address[](0);
        uint256[] memory shares = new uint256[](0);

        bytes memory initData = abi.encodeWithSelector(PaymentSplitter.initialize.selector, payees, shares);

        vm.expectRevert("PaymentSplitter: no payees");
        new ERC1967Proxy(address(newImpl), initData);
    }

    function test_Initialize_RevertsOnZeroAddress() public {
        PaymentSplitter newImpl = new PaymentSplitter();

        address[] memory payees = new address[](2);
        payees[0] = address(0); // Invalid
        payees[1] = openSourceDev;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 5000;
        shares[1] = 5000;

        bytes memory initData = abi.encodeWithSelector(PaymentSplitter.initialize.selector, payees, shares);

        vm.expectRevert("PaymentSplitter: account is the zero address");
        new ERC1967Proxy(address(newImpl), initData);
    }

    function test_Initialize_RevertsOnZeroShares() public {
        PaymentSplitter newImpl = new PaymentSplitter();

        address[] memory payees = new address[](2);
        payees[0] = climateDAO;
        payees[1] = openSourceDev;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 0; // Invalid
        shares[1] = 10000;

        bytes memory initData = abi.encodeWithSelector(PaymentSplitter.initialize.selector, payees, shares);

        vm.expectRevert("PaymentSplitter: shares are 0");
        new ERC1967Proxy(address(newImpl), initData);
    }

    function test_Initialize_RevertsOnDuplicatePayee() public {
        PaymentSplitter newImpl = new PaymentSplitter();

        address[] memory payees = new address[](2);
        payees[0] = climateDAO;
        payees[1] = climateDAO; // Duplicate

        uint256[] memory shares = new uint256[](2);
        shares[0] = 5000;
        shares[1] = 5000;

        bytes memory initData = abi.encodeWithSelector(PaymentSplitter.initialize.selector, payees, shares);

        vm.expectRevert("PaymentSplitter: account already has shares");
        new ERC1967Proxy(address(newImpl), initData);
    }

    /*//////////////////////////////////////////////////////////////
                    ETH PAYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_ReceiveETH_UpdatesTotalReceived() public {
        uint256 amount = 10 ether;

        vm.prank(alice);
        (bool success,) = address(splitter).call{value: amount}("");
        require(success, "ETH transfer failed");

        assertEq(address(splitter).balance, amount, "Splitter balance should be 10 ETH");
    }

    function test_ReceiveETH_EmitsPaymentReceivedEvent() public {
        uint256 amount = 10 ether;

        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit PaymentReceived(alice, amount);

        (bool success,) = address(splitter).call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    function test_ReleaseETH_DistributesProportionally() public {
        // Alice sends 10 ETH yield
        uint256 yieldAmount = 10 ether;
        vm.prank(alice);
        (bool success,) = address(splitter).call{value: yieldAmount}("");
        require(success, "ETH transfer failed");

        // Release to each recipient
        splitter.release(climateDAO);
        splitter.release(openSourceDev);
        splitter.release(educationFund);

        // Verify proportional distribution
        assertEq(climateDAO.balance, 5 ether, "Climate DAO should receive 50% (5 ETH)");
        assertEq(openSourceDev.balance, 3 ether, "Open Source Dev should receive 30% (3 ETH)");
        assertEq(educationFund.balance, 2 ether, "Education Fund should receive 20% (2 ETH)");
    }

    function test_ReleaseETH_UpdatesReleasedTracking() public {
        uint256 yieldAmount = 10 ether;
        vm.prank(alice);
        (bool success,) = address(splitter).call{value: yieldAmount}("");
        require(success, "ETH transfer failed");

        splitter.release(climateDAO);

        assertEq(splitter.released(climateDAO), 5 ether, "Released amount should be tracked");
    }

    function test_ReleaseETH_EmitsPaymentReleasedEvent() public {
        uint256 yieldAmount = 10 ether;
        vm.prank(alice);
        (bool success,) = address(splitter).call{value: yieldAmount}("");
        require(success, "ETH transfer failed");

        vm.expectEmit(true, false, false, true);
        emit PaymentReleased(climateDAO, 5 ether);

        splitter.release(climateDAO);
    }

    function test_ReleaseETH_MultipleReleases_AccumulatesCorrectly() public {
        // First yield payment: 10 ETH
        vm.prank(alice);
        (bool success,) = address(splitter).call{value: 10 ether}("");
        require(success, "ETH transfer failed");

        splitter.release(climateDAO);
        uint256 firstRelease = climateDAO.balance;
        assertEq(firstRelease, 5 ether, "First release should be 5 ETH");

        // Second yield payment: 10 ETH
        vm.prank(bob);
        (success,) = address(splitter).call{value: 10 ether}("");
        require(success, "ETH transfer failed");

        splitter.release(climateDAO);
        uint256 totalReleased = climateDAO.balance;
        assertEq(totalReleased, 10 ether, "Total released should be 10 ETH (5+5)");
    }

    /*//////////////////////////////////////////////////////////////
                    ERC20 PAYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_ReleaseERC20_DistributesProportionally() public {
        // Alice sends 1000 tokens as yield
        uint256 yieldAmount = 1000 ether;
        vm.prank(alice);
        token.transfer(address(splitter), yieldAmount);

        // Release to each recipient
        splitter.release(token, climateDAO);
        splitter.release(token, openSourceDev);
        splitter.release(token, educationFund);

        // Verify proportional distribution
        assertEq(token.balanceOf(climateDAO), 500 ether, "Climate DAO should receive 50% (500 tokens)");
        assertEq(token.balanceOf(openSourceDev), 300 ether, "Open Source Dev should receive 30% (300 tokens)");
        assertEq(token.balanceOf(educationFund), 200 ether, "Education Fund should receive 20% (200 tokens)");
    }

    function test_ReleaseERC20_UpdatesReleasedTracking() public {
        uint256 yieldAmount = 1000 ether;
        vm.prank(alice);
        token.transfer(address(splitter), yieldAmount);

        splitter.release(token, climateDAO);

        assertEq(splitter.released(token, climateDAO), 500 ether, "Released amount should be tracked");
    }

    function test_ReleaseERC20_EmitsERC20PaymentReleasedEvent() public {
        uint256 yieldAmount = 1000 ether;
        vm.prank(alice);
        token.transfer(address(splitter), yieldAmount);

        vm.expectEmit(true, true, false, true);
        emit ERC20PaymentReleased(IERC20(address(token)), climateDAO, 500 ether);

        splitter.release(token, climateDAO);
    }

    function test_ReleaseERC20_NoPaymentDue_RevertsOrNoOp() public {
        // Try to release without any payments
        vm.expectRevert("PaymentSplitter: account is not due payment");
        splitter.release(token, climateDAO);
    }

    /*//////////////////////////////////////////////////////////////
                    RELEASABLE & PENDING TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Releasable_CalculatesCorrectAmount() public {
        uint256 yieldAmount = 10 ether;
        vm.prank(alice);
        (bool success,) = address(splitter).call{value: yieldAmount}("");
        require(success, "ETH transfer failed");

        uint256 releasable = splitter.releasable(climateDAO);
        assertEq(releasable, 5 ether, "Releasable should be 5 ETH (50%)");
    }

    function test_Releasable_AfterPartialRelease() public {
        // Send 10 ETH
        vm.prank(alice);
        (bool success,) = address(splitter).call{value: 10 ether}("");
        require(success, "ETH transfer failed");

        // Release to Climate DAO
        splitter.release(climateDAO);

        // Send another 10 ETH
        vm.prank(bob);
        (success,) = address(splitter).call{value: 10 ether}("");
        require(success, "ETH transfer failed");

        // Releasable should be another 5 ETH
        uint256 releasable = splitter.releasable(climateDAO);
        assertEq(releasable, 5 ether, "Releasable should be 5 ETH");
    }

    /*//////////////////////////////////////////////////////////////
                    EDGE CASES & SECURITY
    //////////////////////////////////////////////////////////////*/

    function test_ReleaseETH_RevertsForNonPayee() public {
        uint256 yieldAmount = 10 ether;
        vm.prank(alice);
        (bool success,) = address(splitter).call{value: yieldAmount}("");
        require(success, "ETH transfer failed");

        vm.expectRevert("PaymentSplitter: account has no shares");
        splitter.release(payable(alice));
    }

    function test_ReleaseETH_RevertsWhenNothingDue() public {
        vm.expectRevert("PaymentSplitter: account is not due payment");
        splitter.release(climateDAO);
    }

    function test_MultipleYieldDeposits_CorrectAccumulation() public {
        // Simulate ongoing yield deposits from strategy
        for (uint256 i = 1; i <= 5; i++) {
            vm.prank(alice);
            (bool success,) = address(splitter).call{value: 1 ether}("");
            require(success, "ETH transfer failed");
        }

        // Total should be 5 ETH
        assertEq(address(splitter).balance, 5 ether, "Total balance should be 5 ETH");

        // Release all
        splitter.release(climateDAO);
        splitter.release(openSourceDev);
        splitter.release(educationFund);

        // Verify total distribution
        assertEq(climateDAO.balance, 2.5 ether, "Climate DAO should receive 2.5 ETH");
        assertEq(openSourceDev.balance, 1.5 ether, "Open Source Dev should receive 1.5 ETH");
        assertEq(educationFund.balance, 1 ether, "Education Fund should receive 1 ETH");
    }

    function test_LargeNumberOfRecipients_Gas() public {
        // Test with 10 recipients
        PaymentSplitter newImpl = new PaymentSplitter();

        address[] memory payees = new address[](10);
        uint256[] memory shares = new uint256[](10);

        for (uint256 i = 0; i < 10; i++) {
            payees[i] = address(uint160(i + 100));
            shares[i] = 1000; // 10% each
        }

        bytes memory initData = abi.encodeWithSelector(PaymentSplitter.initialize.selector, payees, shares);

        ERC1967Proxy proxy = new ERC1967Proxy(address(newImpl), initData);

        PaymentSplitter largeSplitter = PaymentSplitter(payable(address(proxy)));

        // Send yield
        vm.prank(alice);
        (bool success,) = address(largeSplitter).call{value: 10 ether}("");
        require(success, "ETH transfer failed");

        // Release to first recipient (should work with reasonable gas)
        largeSplitter.release(payable(payees[0]));
        assertEq(payees[0].balance, 1 ether, "Should receive 1 ETH (10%)");
    }

    /*//////////////////////////////////////////////////////////////
                    REAL-WORLD SCENARIO
    //////////////////////////////////////////////////////////////*/

    function test_RealWorldScenario_ContinuousYieldAndClaims() public {
        // Month 1: 10 ETH yield
        vm.prank(alice);
        (bool success,) = address(splitter).call{value: 10 ether}("");
        require(success, "ETH transfer failed");

        // Climate DAO claims immediately
        splitter.release(climateDAO);
        assertEq(climateDAO.balance, 5 ether, "Month 1: Climate DAO gets 5 ETH");

        // Month 2: Another 10 ETH yield
        vm.prank(alice);
        (success,) = address(splitter).call{value: 10 ether}("");
        require(success, "ETH transfer failed");

        // Open Source Dev claims after 2 months
        splitter.release(openSourceDev);
        assertEq(openSourceDev.balance, 6 ether, "Month 2: Open Source Dev gets 6 ETH (3+3)");

        // Climate DAO claims month 2
        splitter.release(climateDAO);
        assertEq(climateDAO.balance, 10 ether, "Month 2: Climate DAO total is 10 ETH");

        // Month 3: Another 10 ETH
        vm.prank(alice);
        (success,) = address(splitter).call{value: 10 ether}("");
        require(success, "ETH transfer failed");

        // Education Fund claims after 3 months
        splitter.release(educationFund);
        assertEq(educationFund.balance, 6 ether, "Month 3: Education Fund gets 6 ETH (2+2+2)");
    }
}

/**
 * @dev Mock ERC20 token for testing
 */
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
