# Hardhat Music Producer Library

This project demonstrates a sample use-case on the Ethereum blockchain, focusing on a simplified model of a music producer's library. The producer can add, update, and manage music tracks, while customers can purchase these tracks through a decentralized application.

The repository includes a smart contract written in Solidity, comprehensive tests for the contract, and a Hardhat Ignition module for deployment. By default, the deployment is configured for a local blockchain network (localhost). Deployment to a public testnet is currently out of scope, but the contract is fully compatible with such environments. For exploratory and development purposes, using [Remix IDE](https://remix.ethereum.org/) is recommended, as it allows for easy interaction with the smart contract.

The smart contract implements a set of features that facilitate a basic music track marketplace, where producers can manage their music and customers can make purchases. The contract is designed with modularity and security in mind, ensuring that only the producer can manage tracks and that all transactions are handled securely.

This project includes:

- **Smart Contract:** Implements core functionality for managing music tracks and handling purchase requests on the blockchain.
- **Test Suite:** Comprehensive tests that validate the smart contract's behavior, ensuring it operates as expected.
- **Hardhat Ignition Module:** Simplifies the deployment process of the smart contract, allowing easy deployment to a local network.

By default, the setup is configured to deploy to a local network using Hardhat. For now, deploying to a testnet is out of scope. However, the contract is fully compatible with Ethereum testnets, and you can easily adapt the deployment process as needed.

**Tip:** It is recommended to use [Remix IDE](https://remix.ethereum.org/) to interact with the smart contract, especially if you're exploring the contract's functionality for the first time.

After running `pnpm install`, please take a look at the `package.json` to see what kind of scripts are available and understand how the project is structured.

## Business Process

The following table describes the business process of this simplified blockchain:

| Function Name            | Visibility | Parameters                                                             | Returns          | Payable | Description                                                                                                                |
| ------------------------ | ---------- | ---------------------------------------------------------------------- | ---------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| `constructor`            | public     | None                                                                   | None             | No      | Initializes the contract by setting the `producerAddress` to the address that deployed the contract.                       |
| `addTrack`               | external   | `_title: string`, `_artist: string`, `_price: uint256`                 | `Track memory`   | No      | Adds a new track to the system. Can only be called by the producer.                                                        |
| `updateTrack`            | external   | `_id: uint256`, `_title: string`, `_artist: string`, `_price: uint256` | `Track memory`   | No      | Updates the details of an existing track. Can only be called by the producer.                                              |
| `deleteTrack`            | external   | `_id: uint256`                                                         | None             | No      | Deletes a track from the system. Can only be called by the producer.                                                       |
| `getTrack`               | external   | `_id: uint256`                                                         | `Track memory`   | No      | Retrieves a track's details by its ID.                                                                                     |
| `getTracks`              | external   | `_start: uint256`, `_end: uint256`                                     | `Track[] memory` | No      | Retrieves a list of tracks between the specified start and end indices.                                                    |
| `sendPurchaseRequest`    | external   | `_trackId: uint256`                                                    | `uint256`        | No      | Submits a purchase request for a specific track. Can only be called by non-producer addresses. Returns the transaction ID. |
| `approvePurchaseRequest` | external   | `_transactionId: uint256`                                              | None             | No      | Approves a purchase request. Can only be called by the producer.                                                           |

## Contract Overview

### Key Structures

- **Track:** Represents a music track with properties like ID, title, artist, and price.
- **Transaction:** Represents a purchase transaction with details such as customer address, track ID, payment status, and approval status.

### Core Functionalities

The `ProducerLibrary` smart contract is designed to simulate a simplified marketplace where a music producer can manage and sell tracks. The core functionalities include:

- **Track Management:** The producer can add, update, and delete tracks, providing complete control over the available music library.
- **Purchase Requests:** Customers can browse the available tracks and submit purchase requests for the tracks they wish to buy.
- **Payment Handling:** The contract handles the financial transactions, ensuring that payments are processed securely and that the producer receives the correct payment.

### Modifiers

The contract includes several important modifiers that enforce rules and conditions:

- **onlyProducer:** Ensures that only the producer (the contract owner) can perform certain actions, such as adding or updating tracks.
- **onlyAvailableTrack:** Checks that a specified track exists before performing actions related to it.
- **onlyAvailableTransactions:** Validates that a specified transaction exists before allowing further actions.
- **onlyApprovedTransaction:** Ensures that a purchase request has been approved before finalizing the payment process.

## Testing

The project includes a suite of tests to ensure the contract behaves as expected. To run the tests:

```bash
pnpm test
```
