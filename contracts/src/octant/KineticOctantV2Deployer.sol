// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KineticOctantV2Deployer
 * @author Kinetic Protocol
 * @notice Wrapper contract for deploying Octant V2 yield strategies with PaymentSplitter integration
 *
 * OCTANT V2 INTEGRATION FOR HACKATHON PRIZE:
 * ==========================================
 * This contract programmatically allocates 100% of realized yield from Morpho and Sky protocols
 * toward public goods funding via PaymentSplitter, meeting Octant V2 prize requirements.
 *
 * YIELD ROUTING POLICY:
 * - Deploys ERC-4626 yield strategies via Octant V2 factories
 * - Configures PaymentSplitter as the donation recipient (dragonRouter)
 * - 100% of compounded yield is automatically donated to public goods
 * - PaymentSplitter distributes yield proportionally to configured recipients
 *
 * SUPPORTED PROTOCOLS:
 * - Morpho: High-efficiency lending protocol
 * - Sky (MakerDAO): DAI savings and lending
 *
 * FLOW:
 * 1. User deposits assets → Octant V2 Strategy (ERC-4626)
 * 2. Strategy compounds yield via Morpho/Sky
 * 3. Realized yield auto-donated → PaymentSplitter
 * 4. PaymentSplitter → Multiple public goods recipients
 */
contract KineticOctantV2Deployer {
    /*//////////////////////////////////////////////////////////////
                                IMMUTABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Morpho strategy factory address
    address public immutable morphoFactory;

    /// @notice Sky strategy factory address
    address public immutable skyFactory;

    /// @notice Tokenized strategy implementation (shared by both protocols)
    address public immutable tokenizedStrategyImplementation;

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @dev Struct to track deployed strategies
    struct DeployedStrategy {
        address strategyAddress; // ERC-4626 vault address
        address donationRecipient; // PaymentSplitter receiving yield
        string name; // Strategy name
        ProtocolType protocol; // MORPHO or SKY
        uint256 deployedAt; // Deployment timestamp
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

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event StrategyDeployed(
        address indexed deployer,
        address indexed strategyAddress,
        address indexed donationRecipient,
        ProtocolType protocol,
        string name
    );

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initialize deployer with Octant V2 factory addresses
     * @param _morphoFactory MorphoCompounderStrategyFactory address
     * @param _skyFactory SkyCompounderStrategyFactory address
     * @param _tokenizedStrategy YieldDonatingTokenizedStrategy implementation
     */
    constructor(address _morphoFactory, address _skyFactory, address _tokenizedStrategy) {
        require(_morphoFactory != address(0), "Invalid Morpho factory");
        require(_skyFactory != address(0), "Invalid Sky factory");
        require(_tokenizedStrategy != address(0), "Invalid tokenized strategy");

        morphoFactory = _morphoFactory;
        skyFactory = _skyFactory;
        tokenizedStrategyImplementation = _tokenizedStrategy;
    }

    /*//////////////////////////////////////////////////////////////
                        DEPLOYMENT FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Deploy a Morpho yield strategy with 100% donation to PaymentSplitter
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
     * - Uses hardcoded Yearn USDC vault (0x074134A2784F4F66b6ceD6f68849382990Ff3215)
     *
     * YIELD FLOW:
     * User deposits → Strategy compounds via Morpho → Yield donated → PaymentSplitter → Public goods
     */
    function deployMorphoStrategy(string memory _strategyName, address _paymentSplitter, bool _enableBurning)
        external
        returns (address strategyAddress)
    {
        require(_paymentSplitter != address(0), "Invalid PaymentSplitter");
        require(bytes(_strategyName).length > 0, "Empty name");

        // Deploy via Morpho factory (vault is hardcoded in factory)
        strategyAddress = IMorphoCompounderStrategyFactory(morphoFactory).createStrategy(
            _strategyName,
            msg.sender, // management
            msg.sender, // keeper
            msg.sender, // emergencyAdmin
            _paymentSplitter, // ALL YIELD GOES HERE
            _enableBurning,
            tokenizedStrategyImplementation
        );

        _trackStrategy(strategyAddress, _paymentSplitter, _strategyName, ProtocolType.MORPHO);
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
    function deploySkyStrategy(string memory _strategyName, address _paymentSplitter, bool _enableBurning)
        external
        returns (address strategyAddress)
    {
        require(_paymentSplitter != address(0), "Invalid PaymentSplitter");
        require(bytes(_strategyName).length > 0, "Empty name");

        // Deploy via Sky factory (no vault param)
        strategyAddress = ISkyCompounderStrategyFactory(skyFactory).createStrategy(
            _strategyName,
            msg.sender, // management
            msg.sender, // keeper
            msg.sender, // emergencyAdmin
            _paymentSplitter, // ALL YIELD GOES HERE
            _enableBurning,
            tokenizedStrategyImplementation
        );

        _trackStrategy(strategyAddress, _paymentSplitter, _strategyName, ProtocolType.SKY);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get all strategies deployed by a user
     * @param _user User address
     * @return Array of DeployedStrategy structs
     */
    function getUserStrategies(address _user) external view returns (DeployedStrategy[] memory) {
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
    function getStrategy(uint256 _index) external view returns (DeployedStrategy memory) {
        require(_index < allStrategies.length, "Index out of bounds");
        return allStrategies[_index];
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL HELPERS
    //////////////////////////////////////////////////////////////*/

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

        emit StrategyDeployed(msg.sender, _strategyAddress, _donationRecipient, _protocol, _name);
    }
}

/*//////////////////////////////////////////////////////////////
                    FACTORY INTERFACES
//////////////////////////////////////////////////////////////*/

/**
 * @dev Minimal interface for Morpho strategy factory
 * Note: MorphoCompounderStrategyFactory has hardcoded YS_USDC vault address
 */
interface IMorphoCompounderStrategyFactory {
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
