export const minifyAddress = (address) => {
  return address.slice(0, 5) + "..." + address.slice(-4);
};
