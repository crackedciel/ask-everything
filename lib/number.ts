export const formatBigNumber = (number: number | undefined | null, { minimumFractionDigits = 2 } = {}) => {
  if (number === undefined || number === null) return '0';

  const absNumber = Math.abs(number);

  if (absNumber >= 1000000000000) {
    return (
      (number / 1000000000000).toLocaleString("en-US", {
        maximumFractionDigits: minimumFractionDigits,
        minimumFractionDigits: minimumFractionDigits,
      }) + "T"
    );
  } else if (absNumber >= 1000000000) {
    return (
      (number / 1000000000).toLocaleString("en-US", {
        maximumFractionDigits: minimumFractionDigits,
        minimumFractionDigits: minimumFractionDigits,
      }) + "B"
    );
  } else if (absNumber >= 1000000) {
    return (
      (number / 1000000).toLocaleString("en-US", {
        maximumFractionDigits: minimumFractionDigits,
        minimumFractionDigits: minimumFractionDigits,
      }) + "M"
    );
  } else if (absNumber >= 1000) {
    return (
      (number / 1000).toLocaleString("en-US", {
        maximumFractionDigits: minimumFractionDigits,
      }) + "K"
    );
  } else {
    return number.toLocaleString("en-US", {
      maximumFractionDigits: 0,
    });
  }
};

export const format24hChange = (change: number) => {
  return `${Math.sign(change) < 0 ? "" : "+"}${Math.floor(change * 100) / 100}%`;
}

export const formatNumber = (number: number | undefined | null, decimals = 2): string => {
  if (number === undefined || number === null) return '0';
  
  if (decimals > 0) {
    return number.toLocaleString("en-US", {
      maximumFractionDigits: decimals,
    });
  }
  
  return number.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
};