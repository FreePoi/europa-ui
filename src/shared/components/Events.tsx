import React, { CSSProperties, FC, ReactElement, useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { PaginationContext } from '../../core';
import { PageLine } from './index';
import { Event } from './Event';
import type { EventRecord } from '@polkadot/types/interfaces/system';

const Wrapper = styled.div`
  flex: 1;
  > .content {
    background-color: white;
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: white;
  }
  flex: 1;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
`;

export const Events: FC<{
  events: EventRecord[];
  paginationStyle?: CSSProperties;
  showIndex?: boolean;
}> = ({ events: eventsSource, paginationStyle = {}, showIndex = false }): ReactElement => {
  const { pageIndex, pageSize, setTotal } = useContext(PaginationContext);
  const events = useMemo(
    () =>
    eventsSource.slice(pageSize * (pageIndex - 1), pageSize * pageIndex) || [],
    [eventsSource, pageIndex, pageSize],
  );

  useEffect(() => setTotal(eventsSource.length), [eventsSource, setTotal]);

  return (
    <Wrapper>
      <div className="content">
        {
          events.map((event, index) =>
            <Event showIndex={showIndex} key={index} event={event} />
          )
        }
      </div>
      <PageLine style={{ paddingTop: '16px', ...paginationStyle }} />
    </Wrapper>
  );
};
