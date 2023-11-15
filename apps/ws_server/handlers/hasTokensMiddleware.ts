import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../src';
import { StarlightWebSocketRequest, StarlightWebSocketResponseType } from 'websocket/types';
import { db } from '../services/db';
import { sendToUser } from '../src/connection';

export function hasTokensMiddleware(
  handler: (ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) => void,
) {
  return async (ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) => {
    // TODO: optimize
    /*
    - set flag on connect if we should even check for tokens (if they're a paid user, we don't need to check, makes it so we don't need db call each time)
    - calculate the users total tokens on first connect and update it on every request (only need the initial db call)
    - figure out better way to calculate limit rather than just 100k tokens (input / output are different and we need to account for that, etc)
    */

    const user = await db.user.findUnique({
      where: {
        id: ws.data.webSocketToken?.userId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.stripeSubscriptionStatus !== 'active') {
      console.log(`[hasTokensMiddleware] User ${user.id} does not have active subscription, checking tokens...`);
      const tokens = await db.openAIRequestLog.aggregate({
        where: {
          userId: user.id,
        },
        _sum: {
          totalTokens: true,
        },
      });

      console.log(`[hasTokensMiddleware] User ${user.id} has ${tokens._sum.totalTokens} / 100,000 tokens`);

      if (tokens._sum.totalTokens && tokens._sum.totalTokens > 100000) {
        console.log(`[hasTokensMiddleware] Sending out of credits message...`);
        sendToUser(user.id, {
          type: StarlightWebSocketResponseType.outOfCredits,
          data: {},
        });

        return;
      }
    }

    console.log(`[hasTokensMiddleware] User ${user.id} has active subscription or enough tokens, continuing...`);
    await handler(ws, request);
  };
}
