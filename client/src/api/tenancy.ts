import { REST } from '@/constants';
import axios from 'axios';

/**
 * Defines REST methods for
 * @author Yousef Yassin
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
