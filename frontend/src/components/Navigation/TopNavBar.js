import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { FiUploadCloud, FiBarChart2, FiActivity, FiTrendingUp, FiUser, FiChevronDown } from "react-icons/fi";

const NavBar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(
    135deg,
    rgba(26, 26, 46, 0.7) 0%,
    rgba(22, 33, 62, 0.6) 50%,
    rgba(15, 52, 96, 0.5) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  
  @media (max-width: 576px) {
    padding: 0 1rem;
  }
`;

const Logo = styled(RouterNavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  
  .logo-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 10px;
    box-shadow: 
      0 4px 15px rgba(99, 102, 241, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    svg {
      color: white;
      font-size: 1.1rem;
    }
  }
  
  .logo-text {
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
    letter-spacing: -0.02em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    
    @media (max-width: 576px) {
      display: none;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 576px) {
    gap: 0.25rem;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownTrigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  min-width: 120px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.$isActive ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.15) 100%)'
    : props.$isOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.$isActive 
    ? 'rgba(99, 102, 241, 0.3)' 
    : props.$isOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  svg {
    font-size: 1.1rem;
  }
  
  .chevron {
    font-size: 0.8rem;
    transition: transform 0.2s ease;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 576px) {
    padding: 0.5rem 0.75rem;
    min-width: auto;
    
    .nav-text {
      display: none;
    }
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 180px;
  background: linear-gradient(
    135deg,
    rgba(26, 26, 46, 0.95) 0%,
    rgba(22, 33, 62, 0.95) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
`;

const DropdownItem = styled(RouterNavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  svg {
    font-size: 1.1rem;
  }
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    color: white;
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.25) 0%,
      rgba(139, 92, 246, 0.15) 100%
    );
    
    svg {
      color: #a5b4fc;
    }
  }
`;

const NavLinkStyled = styled(RouterNavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  min-width: 120px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  
  svg {
    font-size: 1.1rem;
  }
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  &.active {
    color: white;
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.25) 0%,
      rgba(139, 92, 246, 0.15) 100%
    );
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 
      0 4px 15px rgba(99, 102, 241, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
    svg {
      color: #a5b4fc;
    }
  }
  
  @media (max-width: 576px) {
    padding: 0.5rem 0.75rem;
    min-width: auto;
    
    .nav-text {
      display: none;
    }
  }
`;

const Dropdown = ({ label, icon: Icon, items, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownTrigger 
        $isOpen={isOpen} 
        $isActive={isActive}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon />
        <span className="nav-text">{label}</span>
        <FiChevronDown className="chevron" />
      </DropdownTrigger>
      <DropdownMenu $isOpen={isOpen}>
        {items.map((item) => (
          <DropdownItem 
            key={item.path} 
            to={item.path} 
            end={item.end}
            onClick={() => setIsOpen(false)}
          >
            <item.icon />
            {item.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </DropdownContainer>
  );
};

const TopNavBar = () => {
  const location = useLocation();

  const analyticsItems = [
    { path: '/', label: 'Insights', icon: FiBarChart2, end: true },
    { path: '/Investment', label: 'Investment', icon: FiTrendingUp },
  ];

  const toolsItems = [
    { path: '/Upload', label: 'Upload', icon: FiUploadCloud },
    { path: '/Monitor', label: 'Monitor', icon: FiActivity },
  ];

  const isAnalyticsActive = location.pathname === '/' || location.pathname === '/Investment';
  const isToolsActive = location.pathname === '/Upload' || location.pathname === '/Monitor';

  return (
    <NavBar>
      <Logo to="/">
        <div className="logo-icon">
          <FiBarChart2 />
        </div>
        <span className="logo-text">Analytics</span>
      </Logo>
      
      <NavLinks>
        <Dropdown 
          label="Analytics" 
          icon={FiBarChart2} 
          items={analyticsItems}
          isActive={isAnalyticsActive}
        />
        
        <Dropdown 
          label="Tools" 
          icon={FiActivity} 
          items={toolsItems}
          isActive={isToolsActive}
        />
        
        <NavLinkStyled to="/Portfolio">
          <FiUser />
          <span className="nav-text">Portfolio</span>
        </NavLinkStyled>
      </NavLinks>
    </NavBar>
  );
};

export default TopNavBar;
