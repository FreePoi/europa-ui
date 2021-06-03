import React, { FC, ReactElement, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { LabelDefault, Style, ValueDefault } from '../../shared';
import { Trace } from './Detail';
import MoveSVG from '../../assets/imgs/more.svg';
import { store, ApiContext, BlocksContext, useContracts } from '../../core';
import { hexToU8a } from '@polkadot/util';
import { Abi } from '@polkadot/api-contract';
import type { Codec } from '@polkadot/types/types';
import { Link } from 'react-router-dom';

const depthColors = [
  '#BEAC92',
  '#DFC49A',
  '#95BEEB',
  '#AA94DC',
  '#D9A4D8',
  '#E69696',
  '#81CBB5',
];

const Wrapper = styled.div<{ err: boolean, depth: number }>`
  margin-top: 10px;
  position: relative;
  background-color: ${props => props.err ? Style.color.bg.error : ''};
  margin-left: ${props => (props.depth - 1) * 20}px;
`;
const BorderBase = styled.div<{ depth: number }>`
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 4px;
  background-color: ${props => depthColors[props.depth - 1 % depthColors.length]};
  opacity: 0.2;
`;
const Contract = styled.div<{ depth: number }>`
  border: 1px solid ${Style.color.border.default};
  border-left: 4px solid ${props => depthColors[props.depth - 1 % depthColors.length]};
  `;
const MainInfo = styled.div`
  padding: 20px;
`;

const Line = styled.div`
  display: flex;
`;
const Left = styled.div`
  flex: 1;
`;
const Right = styled.div`
  flex: 1;
`;
const GasLeft = styled.div`

`;
const GasUsed = styled.div`

`;
const Detail = styled.div`
  border-top: 1px solid ${Style.color.border.default};
  padding: 20px;
`;
const DetailBase = styled.div`
  display: flex;
`;

const Error = styled.div`
  color: ${Style.color.label.error};
  display: flex;
  margin-top: 14px;
`;
const ErrorTrap = styled.div`
  margin-left: 8px;
  flex: 1;
  border: 1px solid ${Style.color.border.error};
  background-color: #FFF9FA;
  padding: 12px;
`;

const Toggle = styled.div<{ expanded: boolean }>`
  padding: 0px 20px;
  cursor: pointer;
  border-top: 1px solid ${Style.color.border.default};
  height: 36px;
  color: ${Style.color.primary};
  
  > div {
    float: right;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    
    > img {
      width: 16px;
      height: 16px;
      margin-left: 4px;
      transform: ${props => props.expanded ? 'scaleY(-1)' : 'scaleY(1)'}
    }
  }
`;
const Args = styled.div`
  border: 1px solid ${Style.color.border.default};
  border-radius: 4px;
  height: 144px;
  background: #F6F5F7;
  word-break: break-all;
  word-wrap: break-word;
  overflow-y: auto;
  padding: 12px;
`;

const Button = styled.button`
  margin-top: 10px;
  padding: 0px 12px;
  font-size: 12px;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 32px;
  height: 32px;
  background: ${Style.color.primary};
  border-width: 0px;
  cursor: pointer;
`;

const getIdentifer = (abi: Abi, selector: string): string => {
  return abi.messages.find(c => c.selector.toString() === selector)?.identifier ||
    abi.constructors.find(c => c.selector.toString() === selector)?.identifier || selector;
};

const getArgs = (abi: Abi, selector: string, args: string): Codec[] => {
  const message = abi.messages.find(c => c.selector.toString() === selector) ||
    abi.constructors.find(c => c.selector.toString() === selector);
  
  if (!message) {
    return [];
  }

  return message.fromU8a(hexToU8a(args)).args;
};

export const ContractTrace: FC<{
  index: number;
  trace: Trace;
}> = ({ trace }): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts } = useContracts(api, blocks);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const contract = useMemo(() => contracts.find(contracts => contracts.address === trace.self_account), [contracts, trace]);

  const abi = useMemo(() => {
    if (!contract) {
      return;
    }

    store.loadAll();

    return store.getCode(contract.codeHash)?.contractAbi;
  }, [contract]);

  return (
    <Wrapper err={!!trace.ext_result.Err} depth={trace.depth}>
      <BorderBase depth={trace.depth} />
      <Contract depth={trace.depth}>
        <MainInfo>
          <Line>
            <Left>
              <LabelDefault>From</LabelDefault>
              <ValueDefault>{trace.caller}</ValueDefault>
            </Left>
            <Right>
              <LabelDefault>Value</LabelDefault>
              <ValueDefault>{trace.value}</ValueDefault>
            </Right>
          </Line>
          <Line>
            <Left>
              <LabelDefault>To</LabelDefault>
              <ValueDefault>
                <Link to={`/explorer/contract/${contract?.address.toString()}`}>
                  {store.getCode(contract?.codeHash || '')?.json.name}
                  &nbsp;:&nbsp;
                  {trace.self_account}
                </Link>
              </ValueDefault>
            </Left>
            <Right>
              <GasLeft>
                <LabelDefault>Gas Left</LabelDefault>
                <ValueDefault>{trace.gas_left}</ValueDefault>
              </GasLeft>
              <GasUsed>
                <LabelDefault>Gas used</LabelDefault>
                <ValueDefault>-</ValueDefault>
              </GasUsed>
            </Right>
          </Line>
        </MainInfo>
        {
          showDetail &&
            <Detail>
              <DetailBase>
                <Left>
                  <Line>
                    <LabelDefault>Function</LabelDefault>
                    <ValueDefault>{
                      abi ? getIdentifer(abi, trace.selector) : trace.selector
                    }</ValueDefault>
                  </Line>
                  <Line>
                    <LabelDefault>Args</LabelDefault>
                    <div>
                      <Args>{
                        abi ?
                          getArgs(abi, trace.selector, trace.args).map((arg, index) =>
                            <div key={index}>{arg.toString()}</div>
                          )
                          :
                          trace.args
                      }</Args>
                      {
                        !abi &&
                          <Button>Decode Parameters</Button>
                      }
                    </div>
                  </Line>
                </Left>
                <Right>
                  <Line>
                    <LabelDefault>Trap Reason</LabelDefault>
                    <ValueDefault>{JSON.stringify(trace.trap_reason)}</ValueDefault>
                  </Line>
                  <Line>
                    <LabelDefault>Env trace</LabelDefault>
                    <Args>{JSON.stringify(trace.env_trace)}</Args>
                  </Line>
                </Right>
              </DetailBase>
              {
                !!trace.ext_result.Err &&
                  <Error>
                    <span>Wasm Error</span>
                    <ErrorTrap>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '40px', marginRight: '10px' }}>Code</span>
                        <div>
                          { trace.wasm_error.Trap.code }
                        </div>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '40px', marginRight: '10px' }}>Trap</span>
                        <div>
                          {
                            trace.wasm_error.Trap.trace.map((t, index) =>
                              <div key={index}>{t}</div>
                            )
                          }
                        </div>
                      </div>
                    </ErrorTrap>
                  </Error>
              }
            </Detail>
        }
        <Toggle expanded={showDetail} onClick={() => setShowDetail(!showDetail)}>
          <div>
            <span>More Details</span>
            <img src={MoveSVG} alt="" />
          </div>
        </Toggle>
      </Contract>
      {
        trace.nests.length > 0 &&
        trace.nests.map((child, index) =>
          <ContractTrace key={index} index={index} trace={child} />
        )
      }
    </Wrapper>
  );
};
