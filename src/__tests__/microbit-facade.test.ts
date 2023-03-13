/**
 * @jest-environment jsdom
 */
import "svelte-jester";
import Microbits from "../script/microbit-interfacing/Microbits";
import ConnectionBehaviours from "../script/connection-behaviours/ConnectionBehaviours";
import OutputBehaviour from "../script/connection-behaviours/OutputBehaviour";
import InputBehaviour from "../script/connection-behaviours/InputBehaviour";
import SpyConnectionBehaviour from "./mock-bluetooth/SpyConnectionBehaviour";
import MockBTDevice from "./mock-bluetooth/mock-microbit-bluetooth";

describe("Microbit facade tests", () => {
	let spyInputBehaviour: SpyConnectionBehaviour;
	let spyOutputBehaviour: SpyConnectionBehaviour;

	beforeAll(() => {
		spyInputBehaviour = new SpyConnectionBehaviour();
		spyOutputBehaviour = new SpyConnectionBehaviour();
		ConnectionBehaviours.setOutputBehaviour(spyOutputBehaviour as unknown as OutputBehaviour);
		ConnectionBehaviours.setInputBehaviour(spyInputBehaviour as unknown as InputBehaviour);
		console.warn("Warning: Using requestDevice on any micro:bit that is not named 'vatav', will result in rejection.");
		/** Adds the bluetooth property to the navigator for mocking */
		Object.assign(navigator, {
			bluetooth: {
				requestDevice(options?: RequestDeviceOptions & { filters?: any | any[] }): Promise<BluetoothDevice> {
					const microBitName = "vatav";
					if (!options) {
						return Promise.reject(undefined);
					}
					if (!options.filters) {
						return Promise.reject(undefined);
					}
					if (options.filters.length == 0) {
						return Promise.reject(undefined);
					}
					if (!options.filters[0].namePrefix) {
						return Promise.reject(undefined);
					}
					if (options.filters[0].namePrefix !== `BBC micro:bit [${microBitName}]`) {
						return Promise.reject(undefined);
					}
					return Promise.resolve(new MockBTDevice().withMicrobitVersion(2).build());
				}
			}
		});
	});

	beforeEach(() => {
		try {
			Microbits.disconnectBluetoothInputAndOutput();
		} catch (_e) {
		}
	});

	test("Should give correct hex file", () => {
		expect(Microbits.hexFiles[1]).toBe("firmware/ml-microbit-cpp-version-combined.hex");
		expect(Microbits.hexFiles[2]).toBe("firmware/MICROBIT.hex");
	});

	test("Input should not be connected before connecting", () => {
		expect(Microbits.isBluetoothInputConnected()).toBeFalsy();
	});

	test("Input should be connected after connecting", async () => {
		const wasConnected = await Microbits.connectBluetoothInput("vatav");
		expect(wasConnected).toBeTruthy();
		expect(Microbits.isBluetoothInputConnected()).toBeTruthy();
		expect(Microbits.isBluetoothOutputConnected()).toBeFalsy();
	});

	test("Output should not be connected before connecting", () => {
		expect(Microbits.isBluetoothOutputConnected()).toBeFalsy();
	});

	test("Output should be connected after connecting", async () => {
		const wasConnected = await Microbits.connectBluetoothOutput("vatav");
		expect(wasConnected).toBeTruthy();
		expect(Microbits.isBluetoothOutputConnected()).toBeTruthy();
		expect(Microbits.isBluetoothInputConnected()).toBeFalsy();
	});

	test("Can connect the same microbit to output and input", async () => {
		const wasConnected = await Microbits.connectBluetoothInput("vatav");
		await Microbits.useInputAsOutput();
		expect(wasConnected).toBeTruthy();
		expect(Microbits.isBluetoothOutputConnected()).toBeTruthy();
		expect(Microbits.isBluetoothInputConnected()).toBeTruthy();
		expect(Microbits.isInputOutputTheSame()).toBeTruthy();
	});

	test("When same, disconnecting input also disconnects output", async () => {
		const wasConnected = await Microbits.connectBluetoothInput("vatav");
		await Microbits.useInputAsOutput();
		expect(wasConnected).toBeTruthy();
		Microbits.disconnectBluetoothInputAndOutput();
		expect(Microbits.isBluetoothOutputConnected()).toBeFalsy();
		expect(Microbits.isBluetoothInputConnected()).toBeFalsy();
	});

	test("Can get connected input", async () => {
		await Microbits.connectBluetoothInput("vatav");
		expect(Microbits.getBluetoothInput()).toBeDefined();
	});

	test("Can get connected output", async () => {
		await Microbits.connectBluetoothOutput("vatav");
		expect(Microbits.getBluetoothOutput()).toBeDefined();
	});

	test("Should get correct name", async () => {
		await Microbits.connectBluetoothOutput("vatav");
		await Microbits.connectBluetoothInput("vatav");
		expect(Microbits.getOutputName()).toBe("vatav");
		expect(Microbits.getInputName()).toBe("vatav");
	});

	test("Should get correct version", async () => {
		await Microbits.connectBluetoothOutput("vatav");
		await Microbits.connectBluetoothInput("vatav");
		expect(Microbits.getInputVersion()).toBe(2);
		expect(Microbits.getOutputVersion()).toBe(2);
	});
});