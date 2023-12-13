import { Instance, InstanceStage } from 'database';
import { db } from '../../services/db';
import { StarlightWebSocketResponseType } from 'websocket/types';
import { sendToInstanceSubscribers } from '../../src/connection';

export async function updateInstanceStage(instance: Instance, stage: InstanceStage) {
  const updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      history: {
        push: instance.stage,
      },
      stage: stage,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  sendToInstanceSubscribers(instance.id, {
    type: StarlightWebSocketResponseType.instanceStageChanged,
    data: {
      instanceId: instance.id,
      stage,
    },
  });

  return updatedInstance;
}
