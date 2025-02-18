"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDoubleTap = useDoubleTap;
const react_1 = require("react");
//Hook to detect a double-tap or double-click event.
//Function is working if two clicks occur within specific delay, here (300 ms)
function useDoubleTap(callback, delay = 300) {
    // State to store the timestamp of the last tap
    const [lastTap, setLastTap] = (0, react_1.useState)(null);
    // Return a function that checks the time difference between taps
    return () => {
        const now = Date.now();
        // If lastTap exists and the difference is within the delay, call the callback
        if (lastTap && now - lastTap < delay) {
            callback();
            setLastTap(null);
        }
        else {
            setLastTap(now);
        }
    };
}
