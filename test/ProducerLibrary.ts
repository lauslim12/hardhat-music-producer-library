import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { expect } from "chai";

const deployFixture = async () => {
	const [owner, otherAccount, anotherAccount] = await hre.ethers.getSigners();
	const ProducerLibrary =
		await hre.ethers.getContractFactory("ProducerLibrary");
	const producerLibrary = await ProducerLibrary.deploy();

	return { owner, otherAccount, anotherAccount, producerLibrary };
};

describe("constructor()", () => {
	it("should deploy and set the owner properly", async () => {
		const { producerLibrary, owner } = await loadFixture(deployFixture);
		expect(await producerLibrary.producerAddress()).to.equal(owner.address);
	});
});

describe("addTrack()", () => {
	it("should add a track to the network", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		await producerLibrary.addTrack("Into Your Arms", "Ava Max", 10);

		const results = await producerLibrary.getTrack(0);
		expect(results[0]).to.eq(hre.ethers.getBigInt(0));
		expect(results[1]).to.eq("Into Your Arms");
		expect(results[2]).to.eq("Ava Max");
		expect(results[3]).to.eq(hre.ethers.getBigInt(10));
	});

	it("should be able to add multiple tracks", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		await producerLibrary.addTrack("Into Your Arms", "Ava Max", 10);
		await producerLibrary.addTrack("A Sky Full Of Stars", "Coldplay", 50);

		const results = await producerLibrary.getTrack(0);
		expect(results[0]).to.eq(hre.ethers.getBigInt(0));
		expect(results[1]).to.eq("Into Your Arms");
		expect(results[2]).to.eq("Ava Max");
		expect(results[3]).to.eq(hre.ethers.getBigInt(10));

		const resultsTwo = await producerLibrary.getTrack(1);
		expect(resultsTwo[0]).to.eq(hre.ethers.getBigInt(1));
		expect(resultsTwo[1]).to.eq("A Sky Full Of Stars");
		expect(resultsTwo[2]).to.eq("Coldplay");
		expect(resultsTwo[3]).to.eq(hre.ethers.getBigInt(50));
	});

	it("should only allow a producer to add a track", async () => {
		const { otherAccount, producerLibrary } = await loadFixture(deployFixture);
		await expect(
			producerLibrary
				.connect(otherAccount)
				.addTrack("Into Your Arms", "Ava Max", 10),
		).to.be.revertedWith("Only the producer can invoke this functionality.");
	});
});

describe("updateTrack()", () => {
	it("should update the track successfully if called by the producer", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		const trackId = 0;
		const title = "New Track Title";
		const artist = "New Artist";
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack("Old Track Title", "Old Artist", price);
		await producerLibrary.updateTrack(trackId, title, artist, price);
		const track = await producerLibrary.tracks(trackId);

		expect(track.id).to.equal(trackId);
		expect(track.title).to.equal(title);
		expect(track.artist).to.equal(artist);
		expect(track.price).to.equal(price);
	});

	it("should revert if a non-producer tries to update a track", async () => {
		const { producerLibrary, otherAccount } = await loadFixture(deployFixture);
		const trackId = 2;
		const title = "Unauthorized Update";
		const artist = "Unauthorized Artist";
		const price = hre.ethers.parseUnits("2", "ether");

		await expect(
			producerLibrary
				.connect(otherAccount)
				.updateTrack(trackId, title, artist, price),
		).to.be.revertedWith("Only the producer can invoke this functionality.");
	});

	it("should revert if the track ID is invalid or doesn't exist", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		const invalidTrackId = 999;
		const title = "Invalid Track";
		const artist = "Invalid Artist";
		const price = hre.ethers.parseUnits("3", "ether");

		await expect(
			producerLibrary.updateTrack(invalidTrackId, title, artist, price),
		).to.be.revertedWith("Track does not exist.");
	});
});

describe("deleteTrack()", () => {
	it("should delete the track successfully if called by the producer", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		const trackId = 0;
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack("Track Title", "Artist", price);
		await producerLibrary.deleteTrack(trackId);

		const track = await producerLibrary.tracks(trackId);
		expect(track.title).to.equal("");
		expect(track.artist).to.equal("");
		expect(track.price).to.equal(0);
	});

	it("should revert if a non-producer tries to delete a track", async () => {
		const { producerLibrary, otherAccount } = await loadFixture(deployFixture);
		const trackId = 0;
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack("Track Title", "Artist", price);

		await expect(
			producerLibrary.connect(otherAccount).deleteTrack(trackId),
		).to.be.revertedWith("Only the producer can invoke this functionality.");
	});

	it("should revert if the track ID is invalid or doesn't exist", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		const invalidTrackId = 999;

		await expect(
			producerLibrary.deleteTrack(invalidTrackId),
		).to.be.revertedWith("Track does not exist.");
	});
});

describe("getTrack()", () => {
	it("should return the correct track by ID", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		const trackId = 0;
		const title = "Track Title";
		const artist = "Artist";
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack(title, artist, price);
		const track = await producerLibrary.getTrack(trackId);

		expect(track.title).to.equal(title);
		expect(track.artist).to.equal(artist);
		expect(track.price).to.equal(price);
	});

	it("should return empty item if the track ID does not exist", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		const invalidTrackId = 999;

		const track = await producerLibrary.getTrack(invalidTrackId);
		expect(track.title).to.equal("");
		expect(track.artist).to.equal("");
		expect(track.price).to.equal(0);
	});
});

describe("getTracks()", () => {
	it("should return the correct range of tracks", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		const title1 = "Track Title 1";
		const artist1 = "Artist 1";
		const title2 = "Track Title 2";
		const artist2 = "Artist 2";
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack(title1, artist1, price);
		await producerLibrary.addTrack(title2, artist2, price);

		const tracks = await producerLibrary.getTracks(0, 2);

		expect(tracks.length).to.equal(2);
		expect(tracks[0].title).to.equal(title1);
		expect(tracks[1].title).to.equal(title2);
	});

	it("should revert if the start index is out of bounds", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);

		await expect(producerLibrary.getTracks(999, 2)).to.be.revertedWith(
			"Start index is out of bounds.",
		);
	});

	it("should revert if the end index exceeds the maximum allowed for pagination", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		const title = "Track Title";
		const artist = "Artist";
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack(title, artist, price);

		await expect(producerLibrary.getTracks(0, 10000)).to.be.revertedWith(
			"End index is more than the maximum possible entry for a paginated response.",
		);
	});

	it("should adjust the end index correctly when it exceeds the number of existing tracks", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		const title = "Track Title";
		const artist = "Artist";
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack(title, artist, price);

		const tracks = await producerLibrary.getTracks(0, 2);

		expect(tracks.length).to.equal(1);
		expect(tracks[0].title).to.equal(title);
	});
});

describe("sendPurchaseRequest()", () => {
	it("should allow a customer to submit a purchase request", async () => {
		const { producerLibrary, otherAccount } = await loadFixture(deployFixture);
		const trackId = 0;
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack("Track Title", "Artist", price);
		await producerLibrary.connect(otherAccount).sendPurchaseRequest(trackId);

		const transaction = await producerLibrary.transactions(0);

		expect(transaction.customerAddress).to.equal(otherAccount.address);
		expect(transaction.trackId).to.equal(trackId);
		expect(transaction.payment).to.equal(0);
		expect(transaction.price).to.equal(price);
		expect(transaction.hasFinishedPayment).to.be.false;
		expect(transaction.hasBeenApproved).to.be.false;
	});

	it("should revert if the producer tries to submit a purchase request", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		const trackId = 0;
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack("Track Title", "Artist", price);

		await expect(
			producerLibrary.sendPurchaseRequest(trackId),
		).to.be.revertedWith("The producer cannot submit a purchase request.");
	});

	it("should revert if the track ID does not exist", async () => {
		const { producerLibrary, otherAccount } = await loadFixture(deployFixture);
		const invalidTrackId = 999;

		await expect(
			producerLibrary.connect(otherAccount).sendPurchaseRequest(invalidTrackId),
		).to.be.revertedWith("Track does not exist.");
	});
});

describe("approvePurchaseRequest()", () => {
	it("should allow the producer to approve a purchase request", async () => {
		const { producerLibrary, otherAccount } = await loadFixture(deployFixture);
		const trackId = 0;
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack("Track Title", "Artist", price);
		await producerLibrary.connect(otherAccount).sendPurchaseRequest(trackId);

		await producerLibrary.approvePurchaseRequest(0);
		const transaction = await producerLibrary.transactions(0);

		expect(transaction.hasBeenApproved).to.be.true;
	});

	it("should revert if a non-producer tries to approve a purchase request", async () => {
		const { producerLibrary, otherAccount } = await loadFixture(deployFixture);
		const trackId = 0;
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack("Track Title", "Artist", price);
		await producerLibrary.connect(otherAccount).sendPurchaseRequest(trackId);

		await expect(
			producerLibrary.connect(otherAccount).approvePurchaseRequest(0),
		).to.be.revertedWith("Only the producer can invoke this functionality.");
	});

	it("should revert if the purchase request does not exist", async () => {
		const { producerLibrary } = await loadFixture(deployFixture);
		const invalidTransactionId = 999;

		await expect(
			producerLibrary.approvePurchaseRequest(invalidTransactionId),
		).to.be.revertedWith("Transaction does not exist.");
	});
});

describe("finishPurchaseRequest()", () => {
	it("should allow the customer to finalize a purchase request by paying the correct amount", async () => {
		const { producerLibrary, otherAccount } = await loadFixture(deployFixture);
		const trackId = 0;
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack("Track Title", "Artist", price);
		await producerLibrary.connect(otherAccount).sendPurchaseRequest(trackId);
		await producerLibrary.approvePurchaseRequest(0);

		await producerLibrary
			.connect(otherAccount)
			.finishPurchaseRequest(0, { value: price });

		const transaction = await producerLibrary.transactions(0);
		expect(transaction.payment).to.equal(price);
		expect(transaction.hasFinishedPayment).to.be.true;
	});

	it("should revert if the transaction has already been paid for", async () => {
		const { producerLibrary, otherAccount } = await loadFixture(deployFixture);
		const trackId = 0;
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack("Track Title", "Artist", price);
		await producerLibrary.connect(otherAccount).sendPurchaseRequest(trackId);
		await producerLibrary.approvePurchaseRequest(0);

		await producerLibrary
			.connect(otherAccount)
			.finishPurchaseRequest(0, { value: price });

		await expect(
			producerLibrary
				.connect(otherAccount)
				.finishPurchaseRequest(0, { value: price }),
		).to.be.revertedWith("This transaction has already been paid for.");
	});

	it("should revert if the sender is not the customer", async () => {
		const { producerLibrary, otherAccount, anotherAccount } =
			await loadFixture(deployFixture);
		const trackId = 0;
		const price = hre.ethers.parseUnits("1", "ether");

		await producerLibrary.addTrack("Track Title", "Artist", price);
		await producerLibrary.connect(otherAccount).sendPurchaseRequest(trackId);
		await producerLibrary.approvePurchaseRequest(0);

		await expect(
			producerLibrary
				.connect(anotherAccount)
				.finishPurchaseRequest(0, { value: price }),
		).to.be.revertedWith(
			"This is not the transaction that was made by the sender's address.",
		);
	});

	it("should revert if the payment amount is incorrect", async () => {
		const { producerLibrary, otherAccount } = await loadFixture(deployFixture);
		const trackId = 0;
		const price = hre.ethers.parseUnits("1", "ether");
		const incorrectPrice = hre.ethers.parseUnits("0.5", "ether");

		await producerLibrary.addTrack("Track Title", "Artist", price);
		await producerLibrary.connect(otherAccount).sendPurchaseRequest(trackId);
		await producerLibrary.approvePurchaseRequest(0);

		await expect(
			producerLibrary
				.connect(otherAccount)
				.finishPurchaseRequest(0, { value: incorrectPrice }),
		).to.be.revertedWith(
			"Amount of provided payment does not match the price of the track.",
		);
	});
});
