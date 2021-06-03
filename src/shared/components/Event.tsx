import React, { FC, ReactElement, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import type { EventRecord } from '@polkadot/types/interfaces/system';
import MoreSvg from '../../assets/imgs/more.svg';
import { Style } from '../styled/const';
import { Args, Obj } from './Args';
import { ApiContext } from '../../core';

const Wrapper = styled.div`
`;
const InfoLine = styled.div`
  cursor: pointer;
  display: flex;
  height: 48px;
  justify-content: space-between;
  align-items: center;
  padding: 0px 20px;
  color: ${Style.color.label.primary};
`;
const DetailToggle = styled.div`
  user-select: none;
  display: flex;
  align-items: center;

  > span {
    color: ${Style.color.primary};
    margin-right: 4px;
  }
`;
const Detail = styled.div`
  background: #EEECE9;
  padding: 20px 21px;
`;

export const Event: FC<{ event: EventRecord }> = ({ event }): ReactElement => {
  const [ expanded, setExpanded ] = useState(false);
  const { metadata } = useContext(ApiContext);

  const args = useMemo(() => {
    type Module = {
      name: string;
      events: {
        name: string;
        args: string[];
        documantion: string;
      }[];
    };

    let modules: Module[] = [];

    try {
      modules = (metadata.toJSON().metadata as any)['v13'].modules as Module[];
    } catch (e) {}

    return event.event.data.map((value, index) => {
      const args = modules.find(module => module.name.toLowerCase() === event.event.section.toLowerCase())?.events
        .find(_event => _event.name.toLowerCase() === event.event.method.toLowerCase())?.args || [];

      console.log('args', args, 'event', event.event.section + '+' + event.event.method);
      return {
        [args[index] ? args[index] : `${index}`]: value.toJSON(),
      } as unknown as Obj;
    });
  }, [metadata, event.event]);

  // console.log('event', event.event.data.toHuman(), 'args', args);

  return (
    <Wrapper>
      <InfoLine onClick={() => setExpanded(!expanded)}>
        <span>{event.event.section.toString()}.{event.event.method.toString()}</span>
        <DetailToggle>
          <span>
            Details
          </span>
          <img src={MoreSvg} alt="" style={{ transform: expanded ? 'scaleY(-1)' : '' }} />
        </DetailToggle>
      </InfoLine>
      {
        expanded &&
          <Detail>
            <Args args={args} />
          </Detail>
      }
    </Wrapper>
  );
};