/**
 * DNS API helpers - no API in free version, returns placeholder data
 */

export const fetchDnsServerStatus = async () => {
  return false;
};

export const fetchDnsRecords = async () => {
  return { records: [], domain: '' };
};
