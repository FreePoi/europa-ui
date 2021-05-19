import { useEffect, useState, useContext } from 'react';
import { accounts as accountsObservable } from '@polkadot/ui-keyring/observable/accounts';
import keyring from '@polkadot/ui-keyring';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of, zip } from 'rxjs';
import { ApiContext } from '../provider/api.provider';
import type { KeyringPair$Meta } from '@polkadot/keyring/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
import { SubjectInfo } from '@polkadot/ui-keyring/observable/types';

interface AccountJson extends KeyringPair$Meta {
  address: string;
  genesisHash?: string | null;
  isExternal?: boolean;
  isHardware?: boolean;
  isHidden?: boolean;
  name?: string;
  parentAddress?: string;
  suri?: string;
  type?: KeypairType;
  whenCreated?: number;
}

export type AccountInfo = AccountJson & { balance: string; mnemonic: string; };


function transformAccounts (accounts: SubjectInfo): AccountJson[] {
  return Object.values(accounts).map(({ json: { address, meta }, type }): AccountJson => ({
    address,
    ...meta,
    type
  }));
}

export const useAccounts = () => {
  const { api } = useContext(ApiContext);
  const [ accounts, setAccounts ] = useState<AccountInfo[]>([]);

  useEffect(() => {
    
    const sub = accountsObservable.subject.pipe(
      map(accounts => transformAccounts(accounts)),
      mergeMap(accounts =>
        zip(
          ...accounts.map(keyringAccount =>
            api.query.balances.account(keyring.decodeAddress(keyringAccount.address)).pipe(
              map(accountInfo => ({
                ...keyringAccount,
                balance: accountInfo.free.toString(),
                mnemonic: localStorage.getItem(`mnemonic${keyringAccount.address}`) || '',
              })),
              catchError(() => of({
                ...keyringAccount,
                balance: '0',
                mnemonic: localStorage.getItem(`mnemonic${keyringAccount.address}`) || '',
              })),
            )
          )        
        )
      ),
    ).subscribe((accounts) => {
      accounts = accounts.filter((account) => !!account);
      setAccounts(accounts);
      console.log('accounts', accounts);
    }, e => console.log('eee', e));

    return () => sub.unsubscribe();
  }, [api.query.balances]);

  return { accounts };
}