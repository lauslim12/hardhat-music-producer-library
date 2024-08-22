import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ProducerLibraryModule = buildModule("ProducerLibraryModule", (m) => {
	const producerLibrary = m.contract("ProducerLibrary");

	return { producerLibrary };
});

export default ProducerLibraryModule;
