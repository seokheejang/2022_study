/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*************************!*\
  !*** ./src/messages.ts ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BackgroundMessages": () => (/* binding */ BackgroundMessages),
/* harmony export */   "ContentScriptMessages": () => (/* binding */ ContentScriptMessages)
/* harmony export */ });
var ContentScriptMessages;

(function (ContentScriptMessages) {
  ContentScriptMessages[ContentScriptMessages["SAY_HELLO_TO_CS"] = 0] = "SAY_HELLO_TO_CS";
  ContentScriptMessages[ContentScriptMessages["SAY_BYE_TO_CS"] = 1] = "SAY_BYE_TO_CS";
})(ContentScriptMessages || (ContentScriptMessages = {}));

var BackgroundMessages;

(function (BackgroundMessages) {
  BackgroundMessages[BackgroundMessages["SAY_HELLO_TO_BG"] = 0] = "SAY_HELLO_TO_BG";
  BackgroundMessages[BackgroundMessages["SAY_BYE_TO_BG"] = 1] = "SAY_BYE_TO_BG";
})(BackgroundMessages || (BackgroundMessages = {}));
/******/ })()
;
//# sourceMappingURL=messages.js.map