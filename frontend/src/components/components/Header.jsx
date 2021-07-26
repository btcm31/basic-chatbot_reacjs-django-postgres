import styled from 'styled-components';
import defaultTheme from '../theme';

const Header = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.headerBgColor};
  color: ${({ theme }) => theme.headerFontColor};
  display: flex;
  fill: ${({ theme }) => theme.headerFontColor};
  height: 70px;
  justify-content: space-between;
  padding: 0 10px;
  border: 0;
  border-radius: 0;
  border-bottom: ${props => (props.invalid ? '0' : '2px solid #696969')};
  border-top: ${props => (props.invalid ? '0' : '3px solid #696969')};
  box-shadow: ${props => (props.invalid ? 'inset 0 0 2px #E53935' : 'none')};
  box-sizing: border-box;
`;

Header.defaultProps = {
  theme: defaultTheme
};

export default Header;
