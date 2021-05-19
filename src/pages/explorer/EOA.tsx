import React, { ReactElement, FC, useState, useEffect, useContext, useMemo } from 'react';
import { Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ApiContext } from '../../core/provider/api.provider';
import { BlocksContext, Extrinsic } from '../../core/provider/blocks.provider';
import { PaginationContext } from '../../core/provider/pagination.provider';
import { PageSize } from '../../shared/components/PageSize';
import { PaginationR } from '../../shared/components/Pagination';
import { Style } from '../../shared/styled/const';
import { LabelDefault } from '../../shared/styled/LabelDefault';
import { TitleWithBottom } from '../../shared/styled/TitleWithBottom';
import { ValueDefault } from '../../shared/styled/ValueDefault';
import { formatAddress, lookForDestAddress, lookForTranferedValue } from '../../shared/util';
import { PaginationLine } from '../../shared/components/PaginationLine';

const Wrap = styled.div`
  padding: 20px;
`;
const LabelLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ValueLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Value = styled(ValueDefault)`
  font-size: 18px;
  font-weight: bold;
`;
const Title = styled.h2`
  padding: 20px;

  > label {
    font-size: 24px;
    color: ${Style.color.label.primary};
    font-weight: bold;
  }
  > span {
    margin-left: 12px;
    font-size: 14px;
    font-weight: 400;
    color: #8C8B8C;
  }
`;

type ExtenedExtrinsic = Extrinsic & {
  blockHash: string;
  height: number;
  from: string;
  to: string;
  fee: string;
};

export const EOA: FC = (): ReactElement => {
  const { address } = useParams<{ address: string; }>();
  const [ balance, setBalance ] = useState('');
  const { blocks } = useContext(BlocksContext);
  const { api } = useContext(ApiContext);
  const { pageIndex, pageSize, setTotal, total } = useContext(PaginationContext);
  
  useEffect(() => {
    const sub = api.query.balances.account(address).subscribe(accountInfo =>
      setBalance(accountInfo.free.toString())
    );

    return () => sub.unsubscribe();
  }, [api, address]);

  const extrinsics: ExtenedExtrinsic[] = useMemo(() =>
    [...blocks]
      .reverse()
      .reduce(
        (extrinsics: ExtenedExtrinsic[], block) =>
          extrinsics.concat(
            block.extrinsics.map(extrinsic => Object.assign(extrinsic, {
              blockHash: block.blockHash,
              height: block.height,
              from: extrinsic.signer.toString(),
              to: lookForDestAddress(extrinsic),
              fee: '',
            }))
          ),
          [],
        )
      .filter(extrinsic => extrinsic.from === address || extrinsic.to === address)
    ,
    [blocks, address],
  );

  const selectedExtrinsics = useMemo(
    () => extrinsics.slice(pageSize * (pageIndex - 1), pageSize * pageIndex),
    [extrinsics, pageIndex, pageSize],
  );

  useMemo(() => setTotal(extrinsics.length), [extrinsics, setTotal]);

  console.log('extrinsics', extrinsics);

  return (
    <Wrap>
      <TitleWithBottom>
        <LabelLine>
          <LabelDefault>Address</LabelDefault>
          <LabelDefault>Balance</LabelDefault>
        </LabelLine>
        <ValueLine>
          <Value>{ address }</Value>
          <Value>{ balance }</Value>
        </ValueLine>
      </TitleWithBottom>
      <Title><label>Extrinsics</label> <span>Total { total } Extrinsics</span></Title>
      <Table
        style={{ marginBottom: '16px' }}
        rowKey={record => record.hash.toString()}
        locale={{emptyText: 'No Data'}}
        pagination={false}
        dataSource={selectedExtrinsics}
        columns={[
          {
            title: <span>Hash</span>,
            width: '20%',
            key: 'hash',
            render: (_, record) => <Link to={`/extrinsic/${record.hash}/details`}>{formatAddress(record.hash.toString(), 23)}</Link>,
          },
          {
            title: <span>height</span>,
            width: '15%',
            key: 'from',
            render: (_, record) => <Link to={`/block/${record.blockHash}`}>{record.height}</Link>,
          },
          {
            title: <span>from</span>,
            width: '15%',
            key: 'from',
            render: (_, record) => record.from === address ?
              <span>{ record.from }</span>
              : <Link to={`/explorer/eoa/${record.from}`}>{ formatAddress(record.from) }</Link>,
          },
          {
            title: <span>to</span>,
            width: '15%',
            key: 'to',
            render: (_, record) => record.to === address ?
              <span>{ record.to }</span>
              : <Link to={`/explorer/eoa/${record.to}`}>{ formatAddress(record.to) }</Link>,
          },
          {
            title: <span>Value</span>,
            width: '15%',
            key: 'value',
            render: (_, record) => <span>{lookForTranferedValue(record)}</span>,
          },
          {
            title: <span>Txn Fee</span>,
            width: '15%',
            key: 'txn fee',
            render: (_, record) => <span>-</span>,
          },
        ]}
      />
      <PaginationLine>
        <PageSize />
        <PaginationR />
      </PaginationLine>
    </Wrap>
  );

};
