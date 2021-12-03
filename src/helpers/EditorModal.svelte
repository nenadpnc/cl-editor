<svelte:options accessors={true}></svelte:options>
{#if show}
  <div class="cl-editor-overlay" on:click="{cancel}"></div>
  <div class="cl-editor-modal">
    <div class="modal-box">
      <span class="modal-title">{title}</span>
      <form on:submit|preventDefault="{event=>confirm()}">
        <label class="modal-label" class:input-error={error}>
          <input bind:this={refs.text} on:keyup="{hideError}" use:inputType name="text" bind:value="{text}">
          <span class="input-info">
            <span>{label}</span>
            {#if error}
            <span class="msg-error">Required</span>
            {/if}
          </span>
        </label>
        <button class="modal-button modal-submit" type="submit">Confirm</button>
        <button class="modal-button modal-reset" type="reset" on:click="{cancel}">Cancel</button>
      </form>
    </div>
  </div>
{/if}

<script>
  import { createEventDispatcher } from "svelte";

  let dispatcher = new createEventDispatcher();

  export let show = false;
  export let text = '';
  export let event = '';
  export let title = '';
  export let label = '';
  export let error = false;

  let refs = {}
  
  const inputType = (e) => {
    e.type = event.includes('Color') ? 'color' : 'text';
  };

  $:{
    if (show) {
      setTimeout(() => {
        refs.text.focus();
      });
    }
  }

  function confirm() {
    if (text) {
      dispatcher(event,text);
      cancel();
    } else {
      error = true;
      refs.text.focus();
    }
  }

  function cancel() {
    show = false;
    text = '';
    error = false;
  }

  function hideError() {
    error = false;
  }
</script>

<style>
.cl-editor-modal {
  position: absolute;
  top: 37px;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  max-width: 520px;
  width: 100%;
  height: 140px;
  backface-visibility: hidden;
  z-index: 11;
}

.cl-editor-overlay {
  position: absolute;
  background-color: rgba(255,255,255,.5);
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  z-index: 10;
}

.modal-box {
  position: absolute;
  top: 0;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  max-width: 500px;
  width: calc(100% - 20px);
  padding-bottom: 36px;
  z-index: 1;
  background-color: #FFF;
  text-align: center;
  font-size: 14px;
  box-shadow: rgba(0,0,0,.2) 0 2px 3px;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 20px;
  padding: 2px 0 4px;
  display: block;
  border-bottom: 1px solid #EEE;
  color: #333;
  background: #fbfcfc;
}

.modal-label {
  display: block;
  position: relative;
  margin: 15px 12px;
  height: 29px;
  line-height: 29px;
  overflow: hidden;
}

.modal-label input {
  position: absolute;
  top: 0;
  right: 0;
  height: 27px;
  line-height: 25px;
  border: 1px solid #DEDEDE;
  background: #fff;
  font-size: 14px;
  max-width: 330px;
  width: 70%;
  padding: 0 7px;
  transition: all 150ms;
}

.modal-label input:focus {
  outline: none;
}

.input-error input {
  border: 1px solid #e74c3c;
}

.input-info {
  display: block;
  text-align: left;
  height: 25px;
  line-height: 25px;
  transition: all 150ms;
}

.input-info span {
  display: block;
  color: #69878f;
  background-color: #fbfcfc;
  border: 1px solid #DEDEDE;
  padding: 1px 7px;
  width: 150px;
}

.input-error .input-info {
  margin-top: -29px;
}

.input-error .msg-error {
  color: #e74c3c;
}

.modal-button {
  position: absolute;
  bottom: 10px;
  right: 0;
  text-decoration: none;
  color: #FFF;
  display: block;
  width: 100px;
  height: 35px;
  line-height: 33px;
  margin: 0 10px;
  background-color: #333;
  border: none;
  cursor: pointer;
  font-family: "Lato",Helvetica,Verdana,sans-serif;
  font-size: 16px;
  transition: all 150ms;
}

.modal-submit {
  right: 110px;
  background: #2bc06a;
}

.modal-reset {
  color: #555;
  background: #e6e6e6;
}
</style>
