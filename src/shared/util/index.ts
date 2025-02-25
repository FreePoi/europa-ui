import { Block, Extrinsic } from '../../core/provider/blocks.provider';

export const formatAddress = (address: string, len = 15) => {
  if (!address || address.length < len) {
    return address;
  }
  return `${address.slice(0, len - 3)}...`;
};

export const lookForDestAddress = (extrinsic: Extrinsic): string => {
  try {
    if (extrinsic.method.section === 'balances'
      && (extrinsic.method.method === 'transfer' || extrinsic.method.method === 'transferKeepAlive')
    ) {
      return (extrinsic.method.args[0].toHuman() as any).Id;
    }
    if (extrinsic.method.section === 'balances'
      && (extrinsic.method.method === 'forceTransfer')
    ) {
      return (extrinsic.method.args[1].toHuman() as any).Id;
    }
  } catch (e) { }

  return '';
};

export const lookForTranferedValue = (extrinsic: Extrinsic): string => {
  try {
    if (extrinsic.method.section === 'balances'
      && (extrinsic.method.method === 'transfer' || extrinsic.method.method === 'transferKeepAlive')
    ) {
      return extrinsic.method.args.map(a => a.toHuman())[1] as any;
    }
    if (extrinsic.method.section === 'balances'
      && (extrinsic.method.method === 'forceTransfer')
    ) {
      return extrinsic.method.args.map(a => a.toHuman())[2] as any;
    }
  } catch (e) { }

  return '-';
};

export const getBlockTimestamp = (block: Block): number => {
  const setTimeExtrinsic = block.extrinsics.find(extrinsic =>
    extrinsic.method.section === 'timestamp' && extrinsic.method.method === 'set'
  );
  const timestamp = parseInt(setTimeExtrinsic?.method.args[0].toString() || '');

  return timestamp;
}

export const formatBlockTimestamp = (block: Block): string => {
  const timestamp = getBlockTimestamp(block);

  if (`${timestamp}` === 'NaN') {
    return '-';
  }
  
  return (new Date(timestamp)).toUTCString();
}

export * from './require';