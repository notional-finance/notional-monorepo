export function truncateAddress(address: string, firstCharsNum = 6, lastCharsNum = 4) {
  const truncatedAddress = `${address.slice(0, firstCharsNum)}...${address.slice(address.length - lastCharsNum)}`
  return truncatedAddress
}
