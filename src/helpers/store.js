import {writable} from "svelte/store";

const state = (function(name) {
  let state = {
    actionBtns: [],
    actionObj: {}
  }

  const { subscribe, set, update } = writable(state);

  return {
    name,
    set,
    update,
    subscribe
  }
});

export const createStateStore = state;
