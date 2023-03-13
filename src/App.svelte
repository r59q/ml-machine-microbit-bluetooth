<script lang="ts">
	import ConnectionBehaviours from "./script/connection-behaviours/ConnectionBehaviours";
	import InputBehaviour from "./script/connection-behaviours/InputBehaviour";
	import OutputBehaviour from "./script/connection-behaviours/OutputBehaviour";
	import OverlayView from "./views/OverlayView.svelte";
	import SideBarMenuView from "./views/SideBarMenuView.svelte";
	import PageContentView from "./views/PageContentView.svelte";
	import BottomBarMenuView from "./views/BottomBarMenuView.svelte";
	import CookieBanner from "./components/cookie-bannner/CookieBanner.svelte";
	import { fade } from "svelte/transition";
	import { state } from "./script/stores/uiStore";
	import LoadingSpinner from "./components/LoadingSpinner.svelte";
	import CompatibilityChecker from "./script/compatibility/CompatibilityChecker";
	import IncompatiblePlatformView from "./views/IncompatiblePlatformView.svelte";
	import BluetoothIncompatibilityWarningDialog from "./components/BluetoothIncompatibilityWarningDialog.svelte";

	ConnectionBehaviours.setInputBehaviour(new InputBehaviour());
	ConnectionBehaviours.setOutputBehaviour(new OutputBehaviour());
</script>


{#if !CompatibilityChecker.checkCompatibility().platformAllowed}
	<!-- Denies mobile users access to the platform -->
	<IncompatiblePlatformView />
{:else}
	{#if $state.isLoading}
		<main class="h-screen w-screen bg-[#63BFC2] flex absolute z-10" transition:fade>
			<LoadingSpinner />
		</main>
	{/if}
	<!-- Here we use the hidden class, to allow for it to load in. -->
	<main class="h-screen w-screen m-0 relative flex"
				class:hidden={$state.isLoading}>
		<!-- OVERLAY ITEMS -->
		<CookieBanner />
		<OverlayView />
		<BluetoothIncompatibilityWarningDialog />

		<!-- <div class="h-full flex"> -->

		<!-- SIDE BAR -->
		<div
			class="h-full flex min-w-75 max-w-75"
		>
			<SideBarMenuView />
		</div>

		<div class=" h-full w-full overflow-y-hidden overflow-x-auto flex flex-col bg-[#63BFC2] shadow-2xl">

			<!-- CONTENT -->
			<div class="relative z-1 flex-1 overflow-y-auto flex-row">
				<PageContentView />
			</div>

			<!-- BOTTOM BAR -->
			<div class="h-160px w-full">
				<BottomBarMenuView />
			</div>

		</div>
		<!-- </div> -->
	</main>
{/if}

<style global windi:preflights:global windi:safelist:global>
    .textAnimation {
        animation: 3s textAni ease;
    }

    @font-face {
        font-family: ultrabit;
        src: url(/ultrabit/fonts/ultrabit.ttf) format('truetype');
    }

    .font-ultrabit {
        font-family: "ultrabit", serif;
    }

    @keyframes textAni {
        0% {
            opacity: 0;
        }
        3% {
            opacity: 1;
        }
        97% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }
</style>