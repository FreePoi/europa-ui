import React, { FC, ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import LogoSVG from '../../assets/imgs/Europa.svg';
import CloseSVG from '../../assets/imgs/close.svg';
import MoreSVG from '../../assets/imgs/more-option.svg';
import SearchSVG from '../../assets/imgs/search.svg';
import { BreadCrumb, Divide } from '../../shared';
import { Style } from '../../shared';
import { BlocksContext, Extrinsic } from '../../core';
import { message } from 'antd';
import { ActiveTab as ContractActiveTab } from '../contract';
import { ActiveTab as ExtrinsicActiveTab } from '../extrinsic/DetailPage';
import { ActiveTab as DeveloperActiveTab } from '../developer/Developer';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  background: linear-gradient(90deg, ${Style.color.button.primary} 0%, ${Style.color.primary} 100%);
`;
const HeaderLeft = styled.div`
  display: flex;
`;

const More = styled.div`
  width: 68px;
  height: 68px;
  margin-right: 20px;
  background: linear-gradient(180deg, ${Style.color.label.primary} 0%, #555356 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    width: 20px;
    cursor: pointer;
    height: 20px;
  }
`;

const SiderBg = styled.div`
  z-index: 100;
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  transition: opacity 0.3s; 
  background-color: rgb(0, 0, 0);
  opacity: 0;
`;

const Sider = styled.div`
  z-index: 101;
  color: white;
  background: linear-gradient(180deg, ${Style.color.label.primary} 0%, #555356 100%);
  position: absolute;
  width: 240px;
  left: -240px;
  top: 0px;
  transition: left 0.3s;
  bottom: 0px;
  padding: 16px 0px;
`;
const SiderHeadr = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 24px;
  margin-bottom: 56px;

  > div {
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    line-height: 24px;
  }
  > div img {
    margin-right: 12px;
    width: 36px;
    height: 36px;
  }
  > img {
    cursor: pointer;
  }
`;
const Tabs = styled.ul`
  padding: 0px 24px;

`;
const Tab = styled.li`
  display: flex;
  height: 24px;
  margin: 14px 0px;

  > img {
    vertical-align: middle;
    margin-right: 20px;
  }
  > a {
    vertical-align: middle;
    font-size: 16px;
    color: white;
  }
`;

const TabSlice = styled.div`
  height: 1px;
  margin: 30px 0px;
  background-color: gray;
`;
const Search = styled.div`
  position: relative;
  margin-right: 20px;
  height: 36px;

  > input::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: #FFFFFF;
    opacity: 0.7;
  }
  > input {
    background-color: rgba(0,0,0,0);
    width: 300px;
    height: 100%;
    border-radius: 22px;
    border: 1px solid #FFFFFF;
    outline: none;
    padding: 10px 50px 10px 16px;
    font-size: 14px;
    color: #FFFFFF;
    line-height: 16px;
  }
  > img {
    cursor: pointer;
    width: 24px;
    height: 24px;
    position: absolute;
    right: 16px;
    top: 6px;
  }
`;

interface TabStructure {
  img: any;
  title: string;
  link: string;
}
const TabGroupOne: TabStructure[] = [
  {
    img: MoreSVG,
    title: 'Explorer',
    link: '/explorer',
  },
  {
    img: MoreSVG,
    title: 'Accounts',
    link: '/account',
  },
  {
    img: MoreSVG,
    title: 'Blocks',
    link: '/block',
  },
  {
    img: MoreSVG,
    title: 'Extrinsics',
    link: '/extrinsic',
  },
  {
    img: MoreSVG,
    title: 'Events',
    link: '/event',
  },
  {
    img: MoreSVG,
    title: 'Contracts',
    link: '/contract',
  },
  {
    img: MoreSVG,
    title: 'Developer',
    link: '/developer',
  }
];

const TabGroupTwo: TabStructure[] = [
  {
    img: MoreSVG,
    title: 'Setting',
    link: '/setting',
  }
];

const hashReg = '(.+)';
const addressReg = '(.+)';

export const Header: FC = (): ReactElement => {
  const [ showSider, toggoleSider ] = useState<boolean>(false);
  const [ showSiderBg, toggoleSiderBg ] = useState<boolean>(false);
  const [ divides, setDivides ] = useState<Divide[]>([]);
  const { pathname } = useLocation();
  const [ search, setSearch ] = useState('');
  const { blocks } = useContext(BlocksContext);
  const h = useHistory();
  
  const pathRegs: {
    reg: RegExp;
    divides: Divide[];
  }[] = useMemo(() => [
    {
      reg: new RegExp('^/explorer$'),
      divides: [
        {
          name: 'Explorer',
          link: '/explorer',
        },
      ],
    },
    {
      reg: new RegExp(`^/explorer/code-hash/${hashReg}$`),
      divides: [
        {
          name: 'Explorer',
          link: '/explorer',
        },
        {
          name: 'Code Hash',
        },
      ],
    },
    {
      reg: new RegExp(`^/explorer/eoa/${addressReg}$`),
      divides: [
        {
          name: 'Explorer',
          link: '/explorer',
        },
        {
          name: 'EOA',
        },
      ],
    },
    {
      reg: new RegExp(`^/explorer/contract/${addressReg}$`),
      divides: [
        {
          name: 'Explorer',
          link: '/explorer',
        },
        {
          name: 'Contract',
        },
      ],
    },
    {
      reg: new RegExp(`^/block/${hashReg}$`),
      divides: [
        {
          name: 'Block',
          link: '/block',
        },
        {
          name: (pathname) => {
            const reg = new RegExp(`^/block/(${hashReg})$`);
            const result = reg.exec(pathname);
            const blockHash =  result ? `${result[1]}` : '';
            const height = blocks.find(block => block.blockHash === blockHash)?.height;

            return  `#${height}`;
          },
        },
      ],
    },
    {
      reg: new RegExp('^/account$'),
      divides: [
        {
          name: 'Account',
        },
      ],
    },
    {
      reg: new RegExp('^/block$'),
      divides: [
        {
          name: 'Block',
        },
      ],
    },
    {
      reg: new RegExp('^/extrinsic$'),
      divides: [
        {
          name: 'Extrinsic',
        },
      ],
    },
    {
      reg: new RegExp(`^/extrinsic/${hashReg}/(.+)$`),
      divides: [
        {
          name: 'Extrinsic',
          link: '/extrinsic',
        },
        {
          name: (pathname) => {
            const reg = new RegExp(`^/extrinsic/${hashReg}/(.+)$`);
            const result = reg.exec(pathname);
            const part =  result ? `${result[2]}` : '';
            const map: { [key: string]: string } = {
              [ExtrinsicActiveTab.Details]: 'Details',
              [ExtrinsicActiveTab.Events]: 'Events',
              [ExtrinsicActiveTab.State]: 'State',
            }

            return  map[part] || '';
          },
        },
      ],
    },
    {
      reg: new RegExp('^/event$'),
      divides: [
        {
          name: 'Events',
        },
      ],
    },
    {
      reg: new RegExp('^/contract/(.+)$'),
      divides: [
        {
          name: 'Contracts',
          link: '/contract'
        },
        {
          name: (pathname) => {
            const reg = new RegExp(`^/contract/(.+)$`);
            const result = reg.exec(pathname);
            const part =  result ? `${result[1]}` : '';
            const map: { [key: string]: string } = {
              [ContractActiveTab.Codes]: 'Codes',
              [ContractActiveTab.Instances]: 'Instances'
            }

            return  map[part] || '';
          },
        }
      ],
    },
    {
      reg: new RegExp('^/developer/(.+)$'),
      divides: [
        {
          name: 'Developer',
          link: '/developer'
        },
        {
          name: (pathname) => {
            const reg = new RegExp(`^/developer/(.+)$`);
            const result = reg.exec(pathname);
            const part =  result ? `${result[1]}` : '';
            const map: { [key: string]: string } = {
              [DeveloperActiveTab.ChainState]: 'Chain State',
              [DeveloperActiveTab.Extrinsic]: 'Extrinsic',
              [DeveloperActiveTab.RpcCall]: 'Rpc Call',
              [DeveloperActiveTab.Log]: 'Log',
            }

            return  map[part] || '';
          },
        }
      ],
    },
    {
      reg: new RegExp('^/setting$'),
      divides: [
        {
          name: 'Setting',
        },
      ],
    },
  ], [blocks]);

  const onSearch = useCallback(() => {
    const block = blocks.find(block => block.blockHash === search);

    if (block) {
      setSearch('');
      return h.push(`/block/${block.blockHash}`);
    }

    const extrinsic = blocks
      .reduce((all: Extrinsic[], block) => all.concat(block.extrinsics), [])
      .find(extrinsic => extrinsic.hash.toString() === search)
    
    if (extrinsic) {
      setSearch('');
      return h.push(`/extrinsic/${extrinsic.hash.toString()}/details`);
    }

    message.info('nothing found!')
  }, [blocks, search, h]);

  useMemo(() => {
    setDivides(pathRegs.find(reg => reg.reg.test(pathname))?.divides || []);
  }, [setDivides, pathname, pathRegs]);

  useEffect(() => {
    if (showSider) {
      toggoleSiderBg(true);
      return;
    }
    const timer = setTimeout(() => {
      toggoleSiderBg(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [showSider]);

  const onToggle = (): void => {
    document.body.style.overflow = showSider ? 'initial' : 'hidden';
    toggoleSider(show => !show);
  };

  return (
  <Wrapper>
    <SiderBg onClick={onToggle} style={{ opacity: showSider ? 0.6 : 0, display: showSiderBg ? 'block' : 'none' }}/>
    <Sider style={{ left: showSider ? '0px' : '-240px' }}>
      <SiderHeadr>
        <div>
          <img src={LogoSVG} alt='' />
          <span>Europa</span>
        </div>
        <img src={CloseSVG} alt='' onClick={onToggle} />
      </SiderHeadr>
      <Tabs>
        {
          TabGroupOne.map(tab => (
            <Tab key={tab.title}>
              <img src={tab.img} alt="" />
              <Link to={tab.link} onClick={onToggle}>
                {tab.title}
              </Link>
            </Tab>
          ))
        }
      </Tabs>
      <TabSlice />
      <Tabs>
        {
          TabGroupTwo.map(tab => (
            <Tab key={tab.title}>
              <img src={tab.img} alt="" />
              <Link to={tab.link} onClick={onToggle}>
                {tab.title}
              </Link>
            </Tab>
          ))
        }
      </Tabs>
    </Sider>
    <HeaderLeft>
      <More>
        <img src={MoreSVG} alt="" onClick={onToggle} />
      </More>
      <BreadCrumb divides={divides} />
    </HeaderLeft>
    <Search>
      <input placeholder="Search by Txn hash/Block" onKeyDown={e => e.key === 'Enter' && onSearch()} value={search} onChange={e => setSearch(e.target.value)} />
      <img onClick={onSearch} src={SearchSVG} alt="" />
    </Search>
  </Wrapper>
  );
};
