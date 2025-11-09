// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/octant/KineticOctantV2Deployer.sol";

/**
 * @title KineticOctantV2DeployerTest
 * @notice Test suite for KineticOctantV2Deployer contract
 * @dev Tests deployment, strategy creation, and tracking functionality
 */
contract KineticOctantV2DeployerTest is Test {
    KineticOctantV2Deployer public deployer;

    // Mock addresses for factories and implementation
    address public mockMorphoFactory = address(0x1);
    address public mockSkyFactory = address(0x2);
    address public mockTokenizedStrategy = address(0x3);
    address public mockPaymentSplitter = address(0x4);

    // Test users
    address public alice = address(0x5);
    address public bob = address(0x6);

    // Events to test
    event StrategyDeployed(
        address indexed deployer,
        address indexed strategyAddress,
        address indexed donationRecipient,
        KineticOctantV2Deployer.ProtocolType protocol,
        string name
    );

    function setUp() public {
        // Deploy the KineticOctantV2Deployer contract
        deployer = new KineticOctantV2Deployer(mockMorphoFactory, mockSkyFactory, mockTokenizedStrategy);
    }

    /*//////////////////////////////////////////////////////////////
                        CONSTRUCTOR TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Constructor_SetsFactoryAddresses() public {
        assertEq(deployer.morphoFactory(), mockMorphoFactory, "Morpho factory not set correctly");
        assertEq(deployer.skyFactory(), mockSkyFactory, "Sky factory not set correctly");
        assertEq(
            deployer.tokenizedStrategyImplementation(), mockTokenizedStrategy, "TokenizedStrategy not set correctly"
        );
    }

    function test_Constructor_RevertsOnZeroAddressMorphoFactory() public {
        vm.expectRevert("Invalid Morpho factory");
        new KineticOctantV2Deployer(address(0), mockSkyFactory, mockTokenizedStrategy);
    }

    function test_Constructor_RevertsOnZeroAddressSkyFactory() public {
        vm.expectRevert("Invalid Sky factory");
        new KineticOctantV2Deployer(mockMorphoFactory, address(0), mockTokenizedStrategy);
    }

    function test_Constructor_RevertsOnZeroAddressTokenizedStrategy() public {
        vm.expectRevert("Invalid tokenized strategy");
        new KineticOctantV2Deployer(mockMorphoFactory, mockSkyFactory, address(0));
    }

    /*//////////////////////////////////////////////////////////////
                    MORPHO DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_DeployMorphoStrategy_RevertsOnInvalidPaymentSplitter() public {
        vm.prank(alice);
        vm.expectRevert("Invalid PaymentSplitter");
        deployer.deployMorphoStrategy("Test-Morpho-Strategy", address(0), false);
    }

    function test_DeployMorphoStrategy_RevertsOnEmptyName() public {
        vm.prank(alice);
        vm.expectRevert("Empty name");
        deployer.deployMorphoStrategy("", mockPaymentSplitter, false);
    }

    function test_DeployMorphoStrategy_CallsMorphoFactory() public {
        // Mock the factory to return a strategy address
        address mockStrategyAddress = address(0x999);

        vm.mockCall(
            mockMorphoFactory,
            abi.encodeWithSelector(IMorphoCompounderStrategyFactory.createStrategy.selector),
            abi.encode(mockStrategyAddress)
        );

        vm.prank(alice);
        address deployedStrategy = deployer.deployMorphoStrategy("Test-Morpho-Strategy", mockPaymentSplitter, false);

        assertEq(deployedStrategy, mockStrategyAddress, "Strategy address mismatch");
    }

    function test_DeployMorphoStrategy_EmitsStrategyDeployedEvent() public {
        address mockStrategyAddress = address(0x999);

        vm.mockCall(
            mockMorphoFactory,
            abi.encodeWithSelector(IMorphoCompounderStrategyFactory.createStrategy.selector),
            abi.encode(mockStrategyAddress)
        );

        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit StrategyDeployed(
            alice,
            mockStrategyAddress,
            mockPaymentSplitter,
            KineticOctantV2Deployer.ProtocolType.MORPHO,
            "Test-Morpho-Strategy"
        );

        deployer.deployMorphoStrategy("Test-Morpho-Strategy", mockPaymentSplitter, false);
    }

    function test_DeployMorphoStrategy_TracksUserStrategies() public {
        address mockStrategyAddress = address(0x999);

        vm.mockCall(
            mockMorphoFactory,
            abi.encodeWithSelector(IMorphoCompounderStrategyFactory.createStrategy.selector),
            abi.encode(mockStrategyAddress)
        );

        vm.prank(alice);
        deployer.deployMorphoStrategy("Test-Morpho-Strategy", mockPaymentSplitter, false);

        KineticOctantV2Deployer.DeployedStrategy[] memory aliceStrategies = deployer.getUserStrategies(alice);

        assertEq(aliceStrategies.length, 1, "Should have 1 strategy");
        assertEq(aliceStrategies[0].strategyAddress, mockStrategyAddress, "Strategy address mismatch");
        assertEq(aliceStrategies[0].donationRecipient, mockPaymentSplitter, "Donation recipient mismatch");
        assertEq(aliceStrategies[0].name, "Test-Morpho-Strategy", "Strategy name mismatch");
        assertEq(
            uint256(aliceStrategies[0].protocol),
            uint256(KineticOctantV2Deployer.ProtocolType.MORPHO),
            "Protocol mismatch"
        );
    }

    /*//////////////////////////////////////////////////////////////
                        SKY DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_DeploySkyStrategy_RevertsOnInvalidPaymentSplitter() public {
        vm.prank(alice);
        vm.expectRevert("Invalid PaymentSplitter");
        deployer.deploySkyStrategy("Test-Sky-Strategy", address(0), false);
    }

    function test_DeploySkyStrategy_RevertsOnEmptyName() public {
        vm.prank(alice);
        vm.expectRevert("Empty name");
        deployer.deploySkyStrategy("", mockPaymentSplitter, false);
    }

    function test_DeploySkyStrategy_CallsSkyFactory() public {
        address mockStrategyAddress = address(0x888);

        vm.mockCall(
            mockSkyFactory,
            abi.encodeWithSelector(ISkyCompounderStrategyFactory.createStrategy.selector),
            abi.encode(mockStrategyAddress)
        );

        vm.prank(alice);
        address deployedStrategy = deployer.deploySkyStrategy("Test-Sky-Strategy", mockPaymentSplitter, false);

        assertEq(deployedStrategy, mockStrategyAddress, "Strategy address mismatch");
    }

    function test_DeploySkyStrategy_EmitsStrategyDeployedEvent() public {
        address mockStrategyAddress = address(0x888);

        vm.mockCall(
            mockSkyFactory,
            abi.encodeWithSelector(ISkyCompounderStrategyFactory.createStrategy.selector),
            abi.encode(mockStrategyAddress)
        );

        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit StrategyDeployed(
            alice,
            mockStrategyAddress,
            mockPaymentSplitter,
            KineticOctantV2Deployer.ProtocolType.SKY,
            "Test-Sky-Strategy"
        );

        deployer.deploySkyStrategy("Test-Sky-Strategy", mockPaymentSplitter, false);
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetUserStrategies_ReturnsEmptyArrayForNewUser() public {
        KineticOctantV2Deployer.DeployedStrategy[] memory strategies = deployer.getUserStrategies(alice);
        assertEq(strategies.length, 0, "New user should have 0 strategies");
    }

    function test_GetTotalStrategies_InitiallyZero() public {
        assertEq(deployer.getTotalStrategies(), 0, "Total strategies should be 0 initially");
    }

    function test_GetTotalStrategies_IncrementsOnDeployment() public {
        address mockStrategyAddress = address(0x999);

        vm.mockCall(
            mockMorphoFactory,
            abi.encodeWithSelector(IMorphoCompounderStrategyFactory.createStrategy.selector),
            abi.encode(mockStrategyAddress)
        );

        vm.prank(alice);
        deployer.deployMorphoStrategy("Test-Morpho-Strategy", mockPaymentSplitter, false);

        assertEq(deployer.getTotalStrategies(), 1, "Total strategies should be 1");
    }

    function test_GetStrategy_ReturnsCorrectStrategy() public {
        address mockStrategyAddress = address(0x999);

        vm.mockCall(
            mockMorphoFactory,
            abi.encodeWithSelector(IMorphoCompounderStrategyFactory.createStrategy.selector),
            abi.encode(mockStrategyAddress)
        );

        vm.prank(alice);
        deployer.deployMorphoStrategy("Test-Morpho-Strategy", mockPaymentSplitter, false);

        KineticOctantV2Deployer.DeployedStrategy memory strategy = deployer.getStrategy(0);

        assertEq(strategy.strategyAddress, mockStrategyAddress, "Strategy address mismatch");
        assertEq(strategy.donationRecipient, mockPaymentSplitter, "Donation recipient mismatch");
        assertEq(strategy.name, "Test-Morpho-Strategy", "Strategy name mismatch");
    }

    function test_GetStrategy_RevertsOnOutOfBounds() public {
        vm.expectRevert("Index out of bounds");
        deployer.getStrategy(0);
    }

    /*//////////////////////////////////////////////////////////////
                    MULTI-USER & EDGE CASES
    //////////////////////////////////////////////////////////////*/

    function test_MultipleUsers_CanDeployStrategies() public {
        address mockStrategyAlice = address(0x999);
        address mockStrategyBob = address(0x888);

        // Alice deploys Morpho
        vm.mockCall(
            mockMorphoFactory,
            abi.encodeWithSelector(IMorphoCompounderStrategyFactory.createStrategy.selector),
            abi.encode(mockStrategyAlice)
        );

        vm.prank(alice);
        deployer.deployMorphoStrategy("Alice-Morpho-Strategy", mockPaymentSplitter, false);

        // Bob deploys Sky
        vm.mockCall(
            mockSkyFactory,
            abi.encodeWithSelector(ISkyCompounderStrategyFactory.createStrategy.selector),
            abi.encode(mockStrategyBob)
        );

        vm.prank(bob);
        deployer.deploySkyStrategy("Bob-Sky-Strategy", mockPaymentSplitter, false);

        // Verify separate tracking
        assertEq(deployer.getUserStrategies(alice).length, 1, "Alice should have 1 strategy");
        assertEq(deployer.getUserStrategies(bob).length, 1, "Bob should have 1 strategy");
        assertEq(deployer.getTotalStrategies(), 2, "Total should be 2 strategies");
    }

    function test_SingleUser_CanDeployMultipleStrategies() public {
        address mockStrategy1 = address(0x999);
        address mockStrategy2 = address(0x888);

        // First strategy
        vm.mockCall(
            mockMorphoFactory,
            abi.encodeWithSelector(IMorphoCompounderStrategyFactory.createStrategy.selector),
            abi.encode(mockStrategy1)
        );

        vm.prank(alice);
        deployer.deployMorphoStrategy("Strategy-1", mockPaymentSplitter, false);

        // Second strategy
        vm.mockCall(
            mockSkyFactory,
            abi.encodeWithSelector(ISkyCompounderStrategyFactory.createStrategy.selector),
            abi.encode(mockStrategy2)
        );

        vm.prank(alice);
        deployer.deploySkyStrategy("Strategy-2", mockPaymentSplitter, false);

        assertEq(deployer.getUserStrategies(alice).length, 2, "Alice should have 2 strategies");
        assertEq(deployer.getTotalStrategies(), 2, "Total should be 2 strategies");
    }

    function test_EnableBurning_PassedToFactory() public {
        address mockStrategyAddress = address(0x999);

        // Expect createStrategy to be called with enableBurning = true
        vm.mockCall(
            mockMorphoFactory,
            abi.encodeWithSelector(
                IMorphoCompounderStrategyFactory.createStrategy.selector,
                "Test-Strategy",
                alice, // management
                alice, // keeper
                alice, // emergencyAdmin
                mockPaymentSplitter, // donationAddress
                true, // enableBurning = true
                mockTokenizedStrategy
            ),
            abi.encode(mockStrategyAddress)
        );

        vm.prank(alice);
        deployer.deployMorphoStrategy(
            "Test-Strategy",
            mockPaymentSplitter,
            true // enableBurning = true
        );

        // If mock call expectations are met, test passes
    }
}
