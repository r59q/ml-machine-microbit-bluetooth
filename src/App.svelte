<script lang="ts">
  import MBSpecs from './script/MBSpecs';
  import MicrobitBluetooth from './script/MicrobitBluetooth';

  let microbitReference: MicrobitBluetooth | undefined = undefined;

  let inputFieldValue = 'guzag';
  let xVal = '0';
  let yVal = '0';
  let zVal = '0';

  const connectToMicrobit = async (name: string | undefined) => {
    const bluetoothDevice = await MicrobitBluetooth.requestDevice(err => {
      console.log('Connection Failed');
    }, name);

    const microbit = await MicrobitBluetooth.createMicrobitBluetooth(
      bluetoothDevice,
      () => console.log('Connected Successfully'),
      manually => {
        // Manually: True if calling microbit.disconnect(), false if connection lost
        console.log('Disconnected', manually);
      },
      err => console.log('Connection Failed', err),
      mb => console.log('Connection was lost, but reconnected'), // mb: reference to the MicrobitBluetooth object
      () => console.log('Connection was lost, and we failed to reconnect'),
    );

    microbit.listenToAccelerometer((x, y, z) => {
      xVal = x.toFixed(0);
      yVal = y.toFixed(0);
      zVal = z.toFixed(0);
    });
    microbitReference = microbit;
  };

  const connectToAnyHandler = async () => {
    await connectToMicrobit(undefined);
  };

  const connectToNamedMicrobitHandler = async () => {
    await connectToMicrobit(inputFieldValue);
  };

  $: pattern = MBSpecs.Utility.nameToPattern(inputFieldValue);
</script>

<div class="m-10">
  <p>Connecting to any microbit</p>
  <div class="flex flex-row">
    <button class="rounded-full bg-blue-300 px-3" on:click={connectToAnyHandler}>
      Connect
    </button>
    <button
      class="rounded-full bg-blue-300 px-3"
      on:click={() => microbitReference?.disconnect()}>
      Disconnect
    </button>
  </div>

  <p>Connecting to named microbit</p>
  <input class="border-1 border-solid border-black" bind:value={inputFieldValue} />
  <button class="rounded-full bg-blue-300 px-3" on:click={connectToNamedMicrobitHandler}>
    Connect to '{inputFieldValue}'
  </button>

  <div>
    <p>Pairing pattern(type in the name of a microbit above)</p>
    <div class="inline-grid grid-cols-5">
      {#each pattern as elem}
        <div
          class="border-1 border-solid border-black w-10 h-10"
          class:bg-green-400={elem}
          class:bg-blue-200={!elem} />
      {/each}
    </div>
    <p>
      You can also go from pattern to name: <span class="font-bold">
        MBSpecs.Utility.patternToName(pattern)={MBSpecs.Utility.patternToName(
          pattern,
        )}</span>
    </p>
  </div>

  <p>Accelerometer:</p>
  <div class="grid w-50 grid-cols-3">
    <div>{xVal}</div>
    <div>{yVal}</div>
    <div>{zVal}</div>
  </div>
</div>
