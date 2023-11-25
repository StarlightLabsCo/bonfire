import { InstanceStage } from 'database';
import { db } from '../services/db';

export const InstanceFunctions = {};

export function stepInstance(instanceId: string) {}

// The issue with this state machine approach is you need specific data at certain steps so they don't share the same params
// you need the starting description for the init - i think i fixed this now
// you need the pplayer message for the loop after - although the player message is added on it's own so all the functions there are the same: (userId, instance.id, messages);
