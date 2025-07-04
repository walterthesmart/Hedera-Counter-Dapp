// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Counter
 * @dev A simple counter smart contract for Hedera blockchain
 * @notice This contract demonstrates basic increment/decrement functionality
 * with proper error handling and events for educational purposes
 */
contract Counter {
    // State Variables
    uint256 private _count;
    address private _owner;
    bool private _paused;
    
    // Constants
    uint256 public constant MAX_COUNT = 1000000;
    uint256 public constant MIN_COUNT = 0;
    
    // Events
    event CountIncremented(uint256 newCount, address indexed caller);
    event CountDecremented(uint256 newCount, address indexed caller);
    event CountReset(address indexed caller);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ContractPaused(address indexed caller);
    event ContractUnpaused(address indexed caller);
    
    // Custom Errors
    error CounterPaused();
    error MaxCountExceeded();
    error MinCountExceeded();
    error OnlyOwner();
    error InvalidAddress();
    
    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != _owner) revert OnlyOwner();
        _;
    }
    
    modifier whenNotPaused() {
        if (_paused) revert CounterPaused();
        _;
    }
    
    /**
     * @dev Constructor sets the initial owner and count
     * @param initialCount The starting count value (optional, defaults to 0)
     */
    constructor(uint256 initialCount) {
        _owner = msg.sender;
        _count = initialCount;
        _paused = false;
        
        emit OwnershipTransferred(address(0), msg.sender);
    }
    
    /**
     * @dev Increments the counter by 1
     * @notice Can only be called when contract is not paused
     * @notice Will revert if incrementing would exceed MAX_COUNT
     */
    function increment() external whenNotPaused {
        if (_count >= MAX_COUNT) revert MaxCountExceeded();
        
        _count += 1;
        emit CountIncremented(_count, msg.sender);
    }
    
    /**
     * @dev Decrements the counter by 1
     * @notice Can only be called when contract is not paused
     * @notice Will revert if decrementing would go below MIN_COUNT
     */
    function decrement() external whenNotPaused {
        if (_count <= MIN_COUNT) revert MinCountExceeded();
        
        _count -= 1;
        emit CountDecremented(_count, msg.sender);
    }
    
    /**
     * @dev Increments the counter by a specified amount
     * @param amount The amount to increment by
     * @notice Can only be called when contract is not paused
     */
    function incrementBy(uint256 amount) external whenNotPaused {
        if (_count + amount > MAX_COUNT) revert MaxCountExceeded();
        
        _count += amount;
        emit CountIncremented(_count, msg.sender);
    }
    
    /**
     * @dev Decrements the counter by a specified amount
     * @param amount The amount to decrement by
     * @notice Can only be called when contract is not paused
     */
    function decrementBy(uint256 amount) external whenNotPaused {
        if (_count < amount || _count - amount < MIN_COUNT) revert MinCountExceeded();
        
        _count -= amount;
        emit CountDecremented(_count, msg.sender);
    }
    
    /**
     * @dev Resets the counter to 0
     * @notice Only the owner can reset the counter
     */
    function reset() external onlyOwner {
        _count = 0;
        emit CountReset(msg.sender);
    }
    
    /**
     * @dev Returns the current count value
     * @return The current count
     */
    function getCount() external view returns (uint256) {
        return _count;
    }
    
    /**
     * @dev Returns the contract owner address
     * @return The owner's address
     */
    function getOwner() external view returns (address) {
        return _owner;
    }
    
    /**
     * @dev Returns whether the contract is paused
     * @return True if paused, false otherwise
     */
    function isPaused() external view returns (bool) {
        return _paused;
    }
    
    /**
     * @dev Pauses the contract, preventing increment/decrement operations
     * @notice Only the owner can pause the contract
     */
    function pause() external onlyOwner {
        _paused = true;
        emit ContractPaused(msg.sender);
    }
    
    /**
     * @dev Unpauses the contract, allowing increment/decrement operations
     * @notice Only the owner can unpause the contract
     */
    function unpause() external onlyOwner {
        _paused = false;
        emit ContractUnpaused(msg.sender);
    }
    
    /**
     * @dev Transfers ownership of the contract to a new account
     * @param newOwner The address of the new owner
     * @notice Only the current owner can transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    /**
     * @dev Returns contract information in a single call
     * @return count The current count value
     * @return owner The owner's address
     * @return paused Whether the contract is paused
     * @return maxCount The maximum allowed count
     * @return minCount The minimum allowed count
     */
    function getContractInfo() external view returns (
        uint256 count,
        address owner,
        bool paused,
        uint256 maxCount,
        uint256 minCount
    ) {
        return (_count, _owner, _paused, MAX_COUNT, MIN_COUNT);
    }
}
