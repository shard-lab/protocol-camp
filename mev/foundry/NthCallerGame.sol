// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract NthCallerGame {
  address public owner;
  uint256 public currentRound;
  uint256 public targetN;
  uint256 public currentCount;
  bool public roundActive;
  uint256 public reward;

  mapping(uint256 => address) public roundWinners;
  mapping(uint256 => uint256) public roundRewards;
  mapping(uint256 => mapping(address => uint256[])) public participantPositions;
  mapping(uint256 => mapping(address => uint256)) public lastPosition;

  event RoundStarted(uint256 indexed round, uint256 targetN, uint256 reward);
  event Participated(uint256 indexed round, address indexed participant, uint256 position);
  event WinnerSelected(uint256 indexed round, address indexed winner, uint256 reward);
  event RoundEnded(uint256 indexed round);

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this function");
    _;
  }

  constructor() payable {
    owner = msg.sender;
    currentRound = 0;
    roundActive = false;
    reward = 0;
  }

  /**
   * @dev Starts a new round. A reward must be sent along with the call.
   * @param _targetN The Nth caller that will receive the reward in this round
   */
  function startNewRound(uint256 _targetN) external payable onlyOwner {
    require(!roundActive, "Current round is still active");
    require(_targetN > 0, "Target N must be greater than 0");
    require(msg.value > 0, "Must provide a reward for the round");
    // Start new round
    currentRound++;
    targetN = _targetN;
    currentCount = 0;
    roundActive = true;
    reward = msg.value;

    // Store round information
    roundRewards[currentRound] = msg.value;

    emit RoundStarted(currentRound, targetN, reward);
  }

  /**
   * @dev Function called by participants. The Nth caller receives the reward.
   */
  function participate() external {
    require(roundActive, "No active round");
    require(msg.sender != owner, "Owner cannot participate");

    // Increase participant count
    currentCount++;

    // Record participant position (add to array)
    participantPositions[currentRound][msg.sender].push(currentCount);

    // Update last position
    lastPosition[currentRound][msg.sender] = currentCount;

    // Emit event
    emit Participated(currentRound, msg.sender, currentCount);

    // Check if this is the Nth caller
    if (currentCount == targetN) {
      // End the round
      roundActive = false;

      // Store winner
      roundWinners[currentRound] = msg.sender;

      // Transfer reward
      uint256 currentReward = reward;
      reward = 0;

      // Emit event
      emit WinnerSelected(currentRound, msg.sender, currentReward);

      // Send reward
      (bool sent, ) = msg.sender.call{value: currentReward}("");
      require(sent, "Failed to send reward");
    }
  }

  /**
   * @dev Returns the current round information.
   */
  function getRoundInfo()
    external
    view
    returns (
      uint256 _currentRound,
      uint256 _targetN,
      uint256 _currentCount,
      bool _roundActive,
      uint256 _reward
    )
  {
    return (currentRound, targetN, currentCount, roundActive, reward);
  }

  /**
   * @dev Returns the winner of a specific round.
   */
  function getRoundWinner(uint256 _round) external view returns (address) {
    require(_round > 0 && _round <= currentRound, "Invalid round");
    return roundWinners[_round];
  }

  /**
   * @dev Returns the reward of a specific round.
   */
  function getRoundReward(uint256 _round) external view returns (uint256) {
    require(_round > 0 && _round <= currentRound, "Invalid round");
    return roundRewards[_round];
  }

  /**
   * @dev Contract owner forcefully ends the current round.
   */
  function forceEndRound() external onlyOwner {
    require(roundActive, "No active round");
    roundActive = false;
    emit RoundEnded(currentRound);
  }

  /**
   * @dev Contract owner withdraws ether.
   */
  function withdraw(uint256 _amount) external onlyOwner {
    require(_amount <= address(this).balance, "Not enough balance");
    (bool sent, ) = owner.call{value: _amount}("");
    require(sent, "Failed to send Ether");
  }

  /**
   * @dev Returns the last position of a participant.
   */
  function getLastPosition(uint256 _round, address _participant) external view returns (uint256) {
    require(_round > 0 && _round <= currentRound, "Invalid round");
    return lastPosition[_round][_participant];
  }

  /**
   * @dev Returns all positions of a participant.
   */
  function getAllPositions(
    uint256 _round,
    address _participant
  ) external view returns (uint256[] memory) {
    require(_round > 0 && _round <= currentRound, "Invalid round");
    return participantPositions[_round][_participant];
  }

  /**
   * @dev Returns the participation count of a participant.
   */
  function getParticipationCount(
    uint256 _round,
    address _participant
  ) external view returns (uint256) {
    require(_round > 0 && _round <= currentRound, "Invalid round");
    return participantPositions[_round][_participant].length;
  }
}
