/**
 * @jest-environment jsdom
 */
import "svelte-jester";
import MockUSBDevice, { TestableMicrobitUSB } from "./mock-bluetooth/mock-usb";

describe("Microbit USB connection tests", () => {

	beforeAll(() => {
		/** Adds the usb property to the navigator for mocking */
		Object.assign(navigator, {
			usb: {
				predefined: undefined,
				requestDevice(options?: USBDeviceRequestOptions): any {
					const result = this.predefined ? this.predefined : Promise.resolve(new MockUSBDevice().build());
					// @ts-ignore
					this.predefined = undefined;
					return Promise.resolve(result);
				}
			}
		});
	});

	test("Can connect read serial", async () => {
		const mockUsbDevice = new MockUSBDevice().withSerialNumber("123test").build();
		const connection = new TestableMicrobitUSB(mockUsbDevice);
		expect(connection.getSerialNumber()).toBe("123test");
	});

	test("Serial number 9900 should be a version 1", async () => {
		const mockUsbDevice = new MockUSBDevice().withSerialNumber("9900serno").build();
		const connection = new TestableMicrobitUSB(mockUsbDevice);
		expect(connection.getModelNumber()).toBe(1);
	});

	test("Serial number 9901 should be a version 1", async () => {
		const mockUsbDevice = new MockUSBDevice().withSerialNumber("9901serno").build();
		const connection = new TestableMicrobitUSB(mockUsbDevice);
		expect(connection.getModelNumber()).toBe(1);
	});

	test("Serial number 9903 should be a version 2", async () => {
		const mockUsbDevice = new MockUSBDevice().withSerialNumber("9903serno").build();
		const connection = new TestableMicrobitUSB(mockUsbDevice);
		expect(connection.getModelNumber()).toBe(2);
	});

	test("Serial number 9904 should be a version 2", async () => {
		const mockUsbDevice = new MockUSBDevice().withSerialNumber("9904serno").build();
		const connection = new TestableMicrobitUSB(mockUsbDevice);
		expect(connection.getModelNumber()).toBe(2);
	});

});