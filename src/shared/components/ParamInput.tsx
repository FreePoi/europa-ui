import React, { CSSProperties, FC, ReactElement } from 'react';
import { Input } from 'antd';
import { Style } from '../../shared';
import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 4px 16px;
  height: 48px;
  background: #FFFFFF;
  border: 1px solid ${Style.color.border};

  input.ant-input {
    font-size: 14px;
    color: ${Style.color.label.primary};
    font-weight: bold;
    /* outline: none !important; */
    /* border: none; */
    /* box-shadow: none; */
  }

`;

const Label = styled.div`
  color: ${Style.color.label.default};
  font-size: 12px;
`;


export const ParamInput: FC<{
  style?: CSSProperties;
  label: string;
  onChange: (address: string)  => void;
  unit?: string;
  defaultValue?: string;
}> = ({ style, defaultValue, onChange, label, unit }): ReactElement => {

  return (
    <Wrapper style={style}>
      <Label>{ label }</Label>
      <Input style={{ borderWidth: '0px', padding: '0px' }} defaultValue={defaultValue} suffix={
        <span style={{ color: Style.color.label.default, fontSize: '14px' }}>{unit}</span>
      } onChange={e => onChange(e.target.value)} />
    </Wrapper>
  );
};