// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DispatchResult } from '@polkadot/types/interfaces';
import type { Props } from './types';

import React, { useMemo } from 'react';


import DispatchError from './DispatchError';
import Static from './Static';
import Unknown from './Unknown';
import { Input } from 'antd';

function isDispatchResultErr (value?: unknown): value is DispatchResult {
  return !!(value && (value as DispatchResult).isErr);
}

function DispatchResultDisplay (props: Props): React.ReactElement<Props> {
  const { defaultValue, isDisabled, label } = props;
  const dispatchError = useMemo(
    () => defaultValue && isDispatchResultErr(defaultValue.value)
      ? { isValid: true, value: defaultValue.value.asErr }
      : null,
    [defaultValue]
  );

  if (!isDisabled) {
    return <Unknown {...props} />;
  } else if (!dispatchError) {
    return (
      <Static
        {...props}
        defaultValue={{ isValid: true, value: 'Ok' }}
      />
    );
  }

  return (
    <DispatchError
      {...props}
      childrenPre={
        <Input placeholder="dispatchresult" />
      }
      defaultValue={dispatchError}
      label='DispatchError'
    />
  );
}

export default React.memo(DispatchResultDisplay);
