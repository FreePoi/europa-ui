import type { Props } from '../types';

import React from 'react';

import BaseBytes from './BaseBytes';

function Hash512 ({ className = '', defaultValue, isDisabled, isError, label, name, onChange, onEnter, onEscape, type, withLabel }: Props): React.ReactElement<Props> {
  return (
    <BaseBytes
      asHex
      className={className}
      defaultValue={defaultValue}
      isDisabled={isDisabled}
      isError={isError}
      label={label}
      length={64}
      name={name}
      onChange={onChange}
      onEnter={onEnter}
      onEscape={onEscape}
      type={type}
      withCopy={isDisabled}
      withLabel={withLabel}
    />
  );
}

export default React.memo(Hash512);