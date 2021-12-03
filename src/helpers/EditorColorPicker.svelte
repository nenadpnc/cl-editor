<div style="display: {show ? 'block' : 'none'}">
  <div class="color-picker-overlay" on:click="{close}"></div>
  <div class="color-picker-wrapper">
    {#each btns as btn}
    <button type="button" class="color-picker-btn" style="background-color:{btn.color};" on:click="{event => selectColor(btn)}">{btn.text || ''}</button>
    {/each}
  </div>
</div>

<script>
    import { createEventDispatcher } from "svelte";

    const dispatcher = new createEventDispatcher();

    export let show = false;
    export let btns = [];
    export let event = '';
    export let colors = [];

    $: btns = colors
            .map((color) => ({ color }))
            .concat([{ text: '#', modal: true }]);

    function close() {
        show = false;
    }

    function selectColor(btn) {
        dispatcher(event,btn)
        close();
    }

</script>

<style>
    .color-picker-wrapper {
        border: 1px solid #ecf0f1;
        border-top: none;
        background: #FFF;
        box-shadow: rgba(0,0,0,.1) 0 2px 3px;
        width: 290px;
        left: 50%;
        -webkit-transform: translateX(-50%);
        transform: translateX(-50%);
        padding: 0;
        position: absolute;
        top: 37px;
        z-index: 11;
    }

    .color-picker-overlay {
        position: absolute;
        background-color: rgba(255,255,255,.5);
        height: 100%;
        width: 100%;
        left: 0;
        top: 0;
        z-index: 10;
    }

    .color-picker-btn {
        display: block;
        position: relative;
        float: left;
        height: 20px;
        width: 20px;
        border: 1px solid #333;
        padding: 0;
        margin: 2px;
        line-height: 35px;
        text-decoration: none;
        background: #FFF;
        color: #333!important;
        cursor: pointer;
        text-align: left;
        font-size: 15px;
        transition: all 150ms;
        line-height: 20px;
        padding: 0px 5px;
    }

    .color-picker-btn:hover::after {
        content: " ";
        display: block;
        position: absolute;
        top: -5px;
        left: -5px;
        height: 27px;
        width: 27px;
        background: inherit;
        border: 1px solid #FFF;
        box-shadow: #000 0 0 2px;
        z-index: 10;
    }
</style>
