import {atom} from "recoil";

const isInteractingState = atom({
    key: 'isInteractingState',
    default: false,
});

export {isInteractingState};