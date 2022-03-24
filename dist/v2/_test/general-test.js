"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("../../src/types/const");
const buttons_1 = require("../components/buttons");
const b1 = buttons_1.default({
    label: 'hi',
    style: 'BLUE',
    customId: 'hi',
    disabled: true
});
const b2 = buttons_1.default('https://abc', 'hi', false);
const b3 = buttons_1.default('coolid', { id: '1234123' }, 'BLUE', false, const_1.InteractionComponentFlag.ACCESS_ADMIN);
//# sourceMappingURL=general-test.js.map