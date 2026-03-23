import React from "react";
import styled from "styled-components";
import { NavLink as RouterNavLink } from "react-router-dom";
import { FiUploadCloud, FiBarChart2, FiActivity, FiTrendingUp } from "react-icons/fi";

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

const NavLinkStyled = styled(RouterNavLink)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
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
    
    .nav-text {
      display: none;
    }
  }
`;

const TopNavBar = () => {
  return (
    <NavBar>
      <Logo to="/">
        <div className="logo-icon">
          <FiBarChart2 />
        </div>
        <span className="logo-text">Analytics</span>
      </Logo>
      
      <NavLinks>
        <NavLinkStyled to="/" end>
          <FiBarChart2 />
          <span className="nav-text">Insights</span>
        </NavLinkStyled>
        
        <NavLinkStyled to="/Upload">
          <FiUploadCloud />
          <span className="nav-text">Upload</span>
        </NavLinkStyled>
        
        <NavLinkStyled to="/Investment">
          <FiTrendingUp />
          <span className="nav-text">Investment</span>
        </NavLinkStyled>
        
        <NavLinkStyled to="/Monitor">
          <FiActivity />
          <span className="nav-text">Monitor</span>
        </NavLinkStyled>
      </NavLinks>
    </NavBar>
  );
};

export default TopNavBar;
