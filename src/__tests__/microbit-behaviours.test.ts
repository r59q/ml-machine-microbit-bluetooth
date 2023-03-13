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

describe("Microbit behaviours tests", () => {
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

	describe("input behaviour tests", () => {

		test("bluetoothConnect fires when connected", async () => {
			await Microbits.connectBluetoothInput("vatav");
			expect(spyInputBehaviour.hasConnectFired()).toBeTruthy();
			expect(spyInputBehaviour.getConnectedName()).toBe("vatav");
			expect(spyInputBehaviour.didFailConnection()).toBeFalsy();
		});

		test("bluetoothConnectionError fires when connection fails", async () => {
			await Microbits.connectBluetoothInput("noooo");
			expect(spyInputBehaviour.didFailConnection()).toBeTruthy();
		});

		test("bluetoothDisconnect fires when disconnected manually", async () => {
			await Microbits.connectBluetoothInput("vatav");
			Microbits.disconnectBluetoothInput();
			expect(spyInputBehaviour.wasDisconnected()).toBeTruthy();
			expect(spyInputBehaviour.wasManuallyDisconnected()).toBeTruthy();
			expect(spyInputBehaviour.wasBothDisconnected()).toBeTruthy();
		});

		test("bluetoothDisconnect fires when both disconnected manually", async () => {
			await Microbits.connectBluetoothInput("vatav");
			Microbits.disconnectBluetoothInputAndOutput();
			expect(spyInputBehaviour.wasDisconnected()).toBeTruthy();
			expect(spyInputBehaviour.wasManuallyDisconnected()).toBeTruthy();
			expect(spyInputBehaviour.wasBothDisconnected()).toBeTruthy();
		});
	});

	describe("Output behaviour tests", () => {

		test("bluetoothConnect fires when connected", async () => {
			await Microbits.connectBluetoothOutput("vatav");
			expect(spyOutputBehaviour.hasConnectFired()).toBeTruthy();
			expect(spyOutputBehaviour.getConnectedName()).toBe("vatav");
			expect(spyOutputBehaviour.didFailConnection()).toBeFalsy();
		});

		test("bluetoothConnectionError fires when connection fails", async () => {
			await Microbits.connectBluetoothOutput("noooo");
			expect(spyOutputBehaviour.didFailConnection()).toBeTruthy();
		});

		test("bluetoothDisconnect fires when disconnected manually", async () => {
			await Microbits.connectBluetoothOutput("vatav");
			Microbits.disconnectBluetoothOutput();
			expect(spyOutputBehaviour.wasDisconnected()).toBeTruthy();
			expect(spyOutputBehaviour.wasManuallyDisconnected()).toBeTruthy();
			expect(spyOutputBehaviour.wasBothDisconnected()).toBeTruthy();
		});

		test("bluetoothDisconnect fires when both disconnected manually", async () => {
			await Microbits.connectBluetoothOutput("vatav");
			Microbits.disconnectBluetoothInputAndOutput();
			expect(spyOutputBehaviour.wasDisconnected()).toBeTruthy();
			expect(spyOutputBehaviour.wasManuallyDisconnected()).toBeTruthy();
			expect(spyOutputBehaviour.wasBothDisconnected()).toBeTruthy();
		});
	});
});