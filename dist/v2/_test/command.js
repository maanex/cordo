"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const button_component_1 = require("../components/button-component");
function handle(i) {
    i
        .replyInteractive({
        content: 'gaming',
        components: [
            button_component_1.button({
                customId: 'hi',
                label: 'Gaming'
            }),
            button_component_1.button({
                customId: 'hi2',
                label: 'Gaming'
            })
        ]
    })
        .withTimeout(2000, j => j.disableComponents(), { onInteraction: 'removeTimeout' })
        .on('hi', (i) => {
        i.edit({
            components: [
                button_component_1.button('gaming', 'hi'),
                button_component_1.button.link('https://gaming', 'Gaming')
            ]
        });
    })
        .on('hi2', () => { });
}
exports.default = handle;
//# sourceMappingURL=command.js.map