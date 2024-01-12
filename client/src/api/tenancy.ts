import { REST } from '@/constants';
import axios from 'axios';

/**
 * Defines REST methods for the live socket
 * tenancy API.
 * @author Yousef Yassin
 */

/**
 * Returns a list of active tenants, referenced
 * by their ids, in the specified room.
 * @param roomID The ID of the room to query.
 * @returns The list of active tenants.
 */
const getActiveTenants = async (roomID: string) => {
  try {
    const { data } = await axios.put(REST.tenants.get, {
      roomId: roomID,
    });
    return data.tenantIds;
  } catch (e) {
    console.error('Failed to query tenants');
  }
};

export const tenancy = { get: getActiveTenants };
