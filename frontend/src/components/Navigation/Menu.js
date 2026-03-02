import React from "react";
import styled from "styled-components";
import { FiUploadCloud, FiBarChart2, FiActivity, FiX } from "react-icons/fi";

const StyledMenu = styled.nav`
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transform: ${({ open }) => (open ? "translateX(0)" : "translateX(-100%)")};
  height: 100vh;
  width: 280px;
  padding: 2rem 1.5rem;
  position: fixed;
  top: 0;
  left: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: ${({ open }) => (open ? "0 0 50px rgba(0, 0, 0, 0.3)" : "none")};

  @media (max-width: 576px) {
    width: 100%;
  }
`;

const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  .logo-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 10px;
    
    svg {
      color: white;
      font-size: 1.25rem;
    }
  }
  
  .logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    letter-spacing: -0.02em;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }
  
  svg {
    font-size: 1.25rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NavLink = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s ease;
  
  svg {
    font-size: 1.25rem;
  }

  &:hover {
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    transform: translateX(4px);
  }
  
  &.active {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
    color: #818cf8;
  }
`;

const MenuFooter = styled.div`
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  p {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
    margin: 0;
  }
`;

const Menu = ({ open, setOpen }) => {
  const currentPath = window.location.pathname;
  
  return (
    <StyledMenu open={open}>
      <MenuHeader>
        <Logo>
          <div className="logo-icon">
            <FiBarChart2 />
          </div>
          <span className="logo-text">Analytics</span>
        </Logo>
        <CloseButton onClick={() => setOpen(false)}>
          <FiX />
        </CloseButton>
      </MenuHeader>
      
      <NavLinks>
        <NavLink href="/" className={currentPath === "/" ? "active" : ""}>
          <FiUploadCloud />
          Upload Data
        </NavLink>
        <NavLink href="/Insights" className={currentPath === "/Insights" ? "active" : ""}>
          <FiBarChart2 />
          Insights
        </NavLink>
        <NavLink href="/Monitor" className={currentPath === "/Monitor" ? "active" : ""}>
          <FiActivity />
          Monitor
        </NavLink>
      </NavLinks>
      
      <MenuFooter>
        <p>Customer Analysis App v2.0</p>
      </MenuFooter>
    </StyledMenu>
  );
};

export default Menu;
