import React, { FC, ReactElement, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';
import { contentBase, formatAddress, InfoHeader, Style, Tabs } from '../../shared';
import { BlocksContext, ApiContext, useContracts, useBalance, useAbi } from '../../core';
import { Functions } from './Functions';
import { ContractExtrinsics } from './ContractExtrinsics';
import { ContractEvents } from './ContractEvents';
import { UploadAbi } from '../code-hash/UploadAbi';
import { UploadButton } from '../code-hash';
import { formatBalance } from '@polkadot/util';

const Wrapper = styled.div`
  ${contentBase}
  flex: 1;
  display: flex;
  flex-direction: column;

  > .tabs {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
`;
const Uploader = styled.div`
  >span {
    margin: 0px 5px;
    color: ${Style.color.label.primary};
  }
`;

enum TabChoice {
  Functions = 'Functions',
  Extrinsics = 'Extrinsics',
  Events = 'Events',
}

export const Contract: FC = (): ReactElement => {
  const { api, tokenDecimal } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts } = useContracts(api, blocks);
  const { address } = useParams<{ address: string }>();
  const { balance } = useBalance(api, address);
  const [ tabChoice, setTabChoice ] = useState<TabChoice>(TabChoice.Functions);
  const choosedCode = useMemo(() => contracts.find(contract => contract.address === address), [contracts, address]);
  const [ show, setShow ] = useState(false);
  const [ signal, updateSignal ] = useState(0);
  const { abi } = useAbi(choosedCode?.codeHash || '', signal);

  return (
    <Wrapper>
      <InfoHeader pairs={
        [
          {
            label: 'Address',
            render: <span style={{ fontSize: '16px', color: Style.color.label.primary }}>{address}</span>
          },
          {
            label: 'Creator',
            render:
              <Uploader>
                <Link to={`/explorer/eoa/${choosedCode?.extrinsic.signer.toString()}`}>{ formatAddress(choosedCode?.extrinsic.signer.toString() || '') }</Link>
                <span>at</span>
                <Link to={`/block/${choosedCode?.block.blockHash}`}>{ formatAddress(choosedCode?.block.blockHash || '') }</Link>
              </Uploader>
          },
          {
            label: 'Balance',
            align: 'right',
            render:
              <span style={{ fontSize: '18px', fontWeight: 600, color: Style.color.label.primary }}>{formatBalance(balance, {}, tokenDecimal)} DOT</span>
          },
        ]
      }/>
      <div className="tabs">
        <Tabs
          style={{ marginTop: '20px' }}
          options={[
            { name: 'Functions', value: TabChoice.Functions },
            { name: 'Extrinsics', value: TabChoice.Extrinsics },
            { name: 'Events', value: TabChoice.Events },
          ]}
          defaultValue={TabChoice.Functions}
          onChange={choice => setTabChoice(choice)}
        ></Tabs>
        {
          !abi &&
            <UploadButton onClick={() => setShow(true)}>Upload ABI</UploadButton>
        }
      </div>
      {
        tabChoice === TabChoice.Functions &&
          <Functions abi={abi} contractAddress={address} codeHash={choosedCode?.codeHash} />
      }
      {
        tabChoice === TabChoice.Extrinsics &&
          <ContractExtrinsics contractAddress={address} />
      }
      {
        tabChoice === TabChoice.Events &&
          <ContractEvents contractAddress={address} />
      }
      {
        show &&
          <UploadAbi
            onCanceled={() => setShow(false)}
            onCompleted={() => { updateSignal(signal + 1); setShow(false)}}
            codeHash={choosedCode?.codeHash || ''}
            blockHeight={choosedCode?.block.height || 0}
          />
      }
    </Wrapper>
  );
};
