"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCordo = void 0;
const discord_interactions_1 = require("discord-interactions");
const _1 = require(".");
function useCordo(clientPublicKey) {
    if (!clientPublicKey)
        throw new Error('You must specify a Discord client public key');
    const checkKey = discord_interactions_1.verifyKeyMiddleware(clientPublicKey);
    return (req, res) => {
        checkKey(req, res, () => _1.default.emitInteraction(req.body));
    };
}
exports.useCordo = useCordo;
//# sourceMappingURL=express-middleware.js.map