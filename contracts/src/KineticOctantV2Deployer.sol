// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KineticOctantV2Deployer
 * @author Kinetic Protocol
 * @notice Wrapper contract for deploying Octant V2 yield strategies with PaymentSplitter integration
 */
contract KineticOctantV2Deployer {
    /// @notice Morpho strategy factory address
    address public immutable morphoFactory;

    /// @notice Sky strategy factory address
    address public immutable skyFactory;

    /// @notice Tokenized strategy implementation (shared by both protocols)
    address public immutable tokenizedStrategyImplementation;

    /// @dev Struct to track deployed strategies
    struct DeployedStrategy {
        address strategyAddress;      // ERC-4626 vault address
        address donationRecipient;    // PaymentSplitter receiving yield
        string name;                  // Strategy name
        ProtocolType protocol;        // MORPHO or SKY
        uint256 deployedAt;          // Deployment timestamp
    }

    /// @dev Protocol types
    enum ProtocolType {
        MORPHO,
        SKY
    }

    /// @notice Mapping: user address => their deployed strategies
    mapping(address => DeployedStrategy[]) public userStrategies;

    /// @notice All strategies deployed via this contract
    DeployedStrategy[] public allStrategies;

    event StrategyDeployed(
        address indexed deployer,
        address indexed strategyAddress,
        address indexed donationRecipient,
        ProtocolType protocol,
        string name
    );

    /**
     * @notice Initialize deployer with Octant V2 factory addresses
     * @param _morphoFactory MorphoCompounderStrategyFactory address
     * @param _skyFactory SkyCompounderStrategyFactory address
     * @param _tokenizedStrategy YieldDonatingTokenizedStrategy implementation
     */
    constructor(
        address _morphoFactory,
        address _skyFactory,
        address _tokenizedStrategy
    ) {
        require(_morphoFactory != address(0), "Invalid Morpho factory");
        require(_skyFactory != address(0), "Invalid Sky factory");
        require(_tokenizedStrategy != address(0), "Invalid tokenized strategy");

        morphoFactory = _morphoFactory;
        skyFactory = _skyFactory;
        tokenizedStrategyImplementation = _tokenizedStrategy;
    }


    /**
     * @notice Deploy a Morpho yield strategy with 100% donation to PaymentSplitter
     * @param _morphoVault Morpho vault to compound into (can be address(0) for default)
     * @param _strategyName Name for the strategy (e.g., "Kinetic-Morpho-USDC-PublicGoods")
     * @param _paymentSplitter PaymentSplitter address receiving ALL yield
     * @param _enableBurning Whether to burn donation shares (recommended: false)
     * @return strategyAddress Address of deployed ERC-4626 strategy
     *
     * @dev Creates a new Morpho strategy via Octant V2 factory with:
     * - management: msg.sender (can adjust strategy settings)
     * - keeper: msg.sender (can trigger harvest/compound)
     * - emergencyAdmin: msg.sender (can emergency withdraw)
     * - donationAddress: _paymentSplitter (receives 100% of yield)
     *
     * YIELD FLOW:
     * User deposits → Strategy compounds via Morpho → Yield donated → PaymentSplitter → Public goods
     */
    function deployMorphoStrategy(
        address _morphoVault,
        string memory _strategyName,
        address _paymentSplitter,
        bool _enableBurning
    ) external returns (address strategyAddress) {
        require(_paymentSplitter != address(0), "Invalid PaymentSplitter");
        require(bytes(_strategyName).length > 0, "Empty name");

        // Deploy via Morpho factory
        strategyAddress = IMorphoCompounderStrategyFactory(morphoFactory).createStrategy(
            _morphoVault,
            _strategyName,
            msg.sender,          // management
            msg.sender,          // keeper
            msg.sender,          // emergencyAdmin
            _paymentSplitter,    // ALL YIELD GOES HERE
            _enableBurning,
            tokenizedStrategyImplementation
        );

        _trackStrategy(
            strategyAddress,
            _paymentSplitter,
            _strategyName,
            ProtocolType.MORPHO
        );
    }

    /**
     * @notice Deploy a Sky yield strategy with 100% donation to PaymentSplitter
     * @param _strategyName Name for the strategy (e.g., "Kinetic-Sky-DAI-PublicGoods")
     * @param _paymentSplitter PaymentSplitter address receiving ALL yield
     * @param _enableBurning Whether to burn donation shares (recommended: false)
     * @return strategyAddress Address of deployed ERC-4626 strategy
     *
     * @dev Similar to Morpho but uses Sky protocol (MakerDAO)
     * Note: Sky factory does NOT require vault parameter
     */
    function deploySkyStrategy(
        string memory _strategyName,
        address _paymentSplitter,
        bool _enableBurning
    ) external returns (address strategyAddress) {
        require(_paymentSplitter != address(0), "Invalid PaymentSplitter");
        require(bytes(_strategyName).length > 0, "Empty name");

        // Deploy via Sky factory (no vault param)
        strategyAddress = ISkyCompounderStrategyFactory(skyFactory).createStrategy(
            _strategyName,
            msg.sender,          // management
            msg.sender,          // keeper
            msg.sender,          // emergencyAdmin
            _paymentSplitter,    // ALL YIELD GOES HERE
            _enableBurning,
            tokenizedStrategyImplementation
        );

        _trackStrategy(
            strategyAddress,
            _paymentSplitter,
            _strategyName,
            ProtocolType.SKY
        );
    }

    /**
     * @notice Get all strategies deployed by a user
     * @param _user User address
     * @return Array of DeployedStrategy structs
     */
    function getUserStrategies(address _user)
        external
        view
        returns (DeployedStrategy[] memory)
    {
        return userStrategies[_user];
    }

    /**
     * @notice Get total number of strategies deployed
     * @return Total count
     */
    function getTotalStrategies() external view returns (uint256) {
        return allStrategies.length;
    }

    /**
     * @notice Get strategy by global index
     * @param _index Index in allStrategies array
     * @return DeployedStrategy struct
     */
    function getStrategy(uint256 _index)
        external
        view
        returns (DeployedStrategy memory)
    {
        require(_index < allStrategies.length, "Index out of bounds");
        return allStrategies[_index];
    }


    /**
     * @dev Track deployed strategy in storage
     */
    function _trackStrategy(
        address _strategyAddress,
        address _donationRecipient,
        string memory _name,
        ProtocolType _protocol
    ) internal {
        DeployedStrategy memory newStrategy = DeployedStrategy({
            strategyAddress: _strategyAddress,
            donationRecipient: _donationRecipient,
            name: _name,
            protocol: _protocol,
            deployedAt: block.timestamp
        });

        userStrategies[msg.sender].push(newStrategy);
        allStrategies.push(newStrategy);

        emit StrategyDeployed(
            msg.sender,
            _strategyAddress,
            _donationRecipient,
            _protocol,
            _name
        );
    }
}


/**
 * @dev Minimal interface for Morpho strategy factory
 */
interface IMorphoCompounderStrategyFactory {
    function createStrategy(
        address _compounderVault,
        string memory _name,
        address _management,
        address _keeper,
        address _emergencyAdmin,
        address _donationAddress,
        bool _enableBurning,
        address _tokenizedStrategyAddress
    ) external returns (address);
}

/**
 * @dev Minimal interface for Sky strategy factory
 */
interface ISkyCompounderStrategyFactory {
    function createStrategy(
        string memory _name,
        address _management,
        address _keeper,
        address _emergencyAdmin,
        address _donationAddress,
        bool _enableBurning,
        address _tokenizedStrategyAddress
    ) external returns (address);
}
