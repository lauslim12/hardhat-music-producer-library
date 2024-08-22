// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

/**
 * Adhering to https://docs.soliditylang.org/en/latest/style-guide.html.
 */
contract ProducerLibrary {
    struct Track {
        /// @dev Unique identifier of each track. It is a positive integer that increments for each new track added to the system.
        uint256 id;
        /// @dev Title of the track. This can be any string representing the name or title of the track.
        string title;
        /// @dev Artist of the track. It is represented as a string containing the name of the artist.
        string artist;
        /// @dev Price of the track. Represented as an unsigned integer.
        uint256 price;
    }

    struct Transaction {
        /// @dev Address of the customer.
        address customerAddress;
        /// @dev Unique identifier of each customer.
        uint256 id;
        /// @dev Track ID that is requested by the customer.
        uint256 trackId;
        /// @dev Total payment made by the customer. It is a positive integer.
        uint256 payment;
        /// @dev Price of the track. Redundancy as it could change in the future.
        uint256 price;
        /// @dev Whether customer has finished the payment or not.
        bool hasFinishedPayment;
        /// @dev Whether the initial purchase request is approved by the owner.
        bool hasBeenApproved;
    }

    // Account of the producer.
    address payable public producerAddress;

    // List of all tracks, a mapping of their IDs and the struct.
    mapping(uint256 => Track) public tracks;

    // List of all transactions on the tracks.
    Transaction[] public transactions;

    // Unique identifier of each track.
    uint256 public trackId = 0;

    // Unique identifier of each transaction, also known as the transaction id.
    uint256 public transactionId = 0;

    // Maximum amount for pagination.
    uint256 public constant MAX_ENTRY_FOR_PAGINATION = 100;

    // Initialize contract, the initial deployment would be for the producer.
    constructor() {
        producerAddress = payable(msg.sender);
    }

    // Special modifier to only allow operations against existing tracks.
    modifier onlyAvailableTrack(uint256 _trackId) {
        require(_trackId < trackId, "Track does not exist.");
        _;
    }

    // Special modifier to only allow operations against existing transaction.
    modifier onlyAvailableTransactions(uint256 _transactionId) {
        require(_transactionId < transactionId, "Transaction does not exist.");
        _;
    }

    modifier onlyApprovedTransaction(uint256 _transactionId) {
        require(
            transactions[_transactionId].hasBeenApproved == true,
            "Customer must submit a purchase request before invoking this functionality."
        );
        _;
    }

    // Special modifier to only allow owner (in this case, producer) to invoke certain operations.
    modifier onlyProducer() {
        require(
            msg.sender == producerAddress,
            "Only the producer can invoke this functionality."
        );
        _;
    }

    // Adds a new track to the chain.
    function addTrack(
        string memory _title,
        string memory _artist,
        uint256 _price
    ) external onlyProducer returns (Track memory) {
        Track memory results = Track(trackId, _title, _artist, _price);
        tracks[trackId] = results;
        trackId++;

        return results;
    }

    // Updates one track from the chain.
    function updateTrack(
        uint256 _id,
        string memory _title,
        string memory _artist,
        uint256 _price
    ) external onlyProducer onlyAvailableTrack(_id) returns (Track memory) {
        Track memory results = Track(_id, _title, _artist, _price);
        tracks[_id] = results;

        return results;
    }

    // Deletes one track from the chain.
    function deleteTrack(uint256 _id)
        external
        onlyProducer
        onlyAvailableTrack(_id)
    {
        delete tracks[_id];
    }

    // Gets one track from the chain.
    function getTrack(uint256 _id) external view returns (Track memory) {
        return tracks[_id];
    }

    // Gets all tracks from the chain.
    function getTracks(uint256 _start, uint256 _end)
        external
        view
        returns (Track[] memory)
    {
        require(_start < trackId, "Start index is out of bounds.");
        require(
            _end < MAX_ENTRY_FOR_PAGINATION,
            "End index is more than the maximum possible entry for a paginated response."
        );

        // Do not allow overflow.
        if (_end > trackId) {
            _end = trackId;
        }

        Track[] memory results = new Track[](_end - _start);
        for (uint256 i = _start; i < _end; i++) {
            results[i] = tracks[i];
        }

        return results;
    }

    // A customer wishes to submit a purchase request for a single track.
    function sendPurchaseRequest(uint256 _trackId)
        external
        onlyAvailableTrack(_trackId)
        returns (uint256)
    {
        require(
            msg.sender != producerAddress,
            "The producer cannot submit a purchase request."
        );
        Track memory track = tracks[_trackId];
        transactions.push(
            Transaction(
                msg.sender,
                transactionId,
                _trackId,
                0,
                track.price,
                false,
                false
            )
        );
        transactionId++;

        return transactionId - 1;
    }

    // The producer wishes to approve the purchase request.
    function approvePurchaseRequest(uint256 _transactionId)
        external
        onlyProducer
        onlyAvailableTransactions(_transactionId)
    {
        transactions[_transactionId].hasBeenApproved = true;
    }

    // The customer wishes to pay deposit and get their track.
    function finishPurchaseRequest(uint256 _transactionId)
        external
        payable
        onlyAvailableTransactions(_transactionId)
    {
        require(
            transactions[_transactionId].hasFinishedPayment == false,
            "This transaction has already been paid for."
        );
        require(
            transactions[_transactionId].customerAddress == msg.sender,
            "This is not the transaction that was made by the sender's address."
        );
        require(
            transactions[_transactionId].price == msg.value,
            "Amount of provided payment does not match the price of the track."
        );
        (bool success, ) = producerAddress.call{value: msg.value}("");
        require(success, "Payment failed!");
        transactions[_transactionId].payment = msg.value;
        transactions[_transactionId].hasFinishedPayment = true;
    }
}
