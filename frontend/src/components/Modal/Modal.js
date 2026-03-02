import React, { useRef, useEffect, useCallback } from 'react';
import { useSpring, animated } from 'react-spring';
import styled from 'styled-components';
import { FiX, FiCheckCircle } from 'react-icons/fi';

const Background = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalWrapper = styled.div`
  width: 90%;
  max-width: 500px;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
`;

const ModalInfoWrapper = styled.div`
  width: 90%;
  max-width: 450px;
  padding: 2.5rem;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.2) 100%);
  border-radius: 50%;
  
  svg {
    font-size: 2.5rem;
    color: #10b981;
  }
`;

const ModalImg = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
`;

const ModalInfoContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.75rem;
    letter-spacing: -0.02em;
  }
  
  p {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 1.5rem;
    line-height: 1.6;
  }
`;

const ModalContent = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.5rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 1.5rem;
  }
  
  button {
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }
  }
`;

const CloseModalButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
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
  z-index: 10;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }
  
  svg {
    font-size: 1.25rem;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(99, 102, 241, 0.4);
  }
`;

export const ModalConstruction = ({ showModal, setShowModal }) => {
  const modalRef = useRef();

  const animation = useSpring({
    config: {
      duration: 300,
      tension: 300,
      friction: 20
    },
    opacity: showModal ? 1 : 0,
    transform: showModal ? `scale(1)` : `scale(0.9)`
  });

  const closeModal = e => {
    if (modalRef.current === e.target) {
      setShowModal(false);
    }
  };

  const keyPress = useCallback(
    e => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    },
    [setShowModal, showModal]
  );

  useEffect(
    () => {
      document.addEventListener('keydown', keyPress);
      return () => document.removeEventListener('keydown', keyPress);
    },
    [keyPress]
  );

  return (
    <>
      {showModal ? (
        <Background onClick={closeModal} ref={modalRef}>
          <animated.div style={animation}>
            <ModalWrapper showModal={showModal}>
              <ModalImg src={"images/modal.jpg"} alt='camera' />
              <ModalContent>
                <h1>Thank you</h1>
                <p>Be patience and get ready for our next launch.</p>
              </ModalContent>
              <CloseModalButton
                aria-label='Close modal'
                onClick={() => setShowModal(prev => !prev)}
              >
                <FiX />
              </CloseModalButton>
            </ModalWrapper>
          </animated.div>
        </Background>
      ) : null}
    </>
  );
};

export const ModalInfo = ({ showModal, setShowModal, title, content, img }) => {
  const modalRef = useRef();

  const animation = useSpring({
    config: {
      duration: 300,
      tension: 300,
      friction: 20
    },
    opacity: showModal ? 1 : 0,
    transform: showModal ? `scale(1)` : `scale(0.9)`
  });

  const closeModal = e => {
    if (modalRef.current === e.target) {
      setShowModal(false);
    }
  };

  const keyPress = useCallback(
    e => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    },
    [setShowModal, showModal]
  );

  useEffect(
    () => {
      document.addEventListener('keydown', keyPress);
      return () => document.removeEventListener('keydown', keyPress);
    },
    [keyPress]
  );

  return (
    <>
      {showModal ? (
        <Background onClick={closeModal} ref={modalRef}>
          <animated.div style={animation}>
            <ModalInfoWrapper showModal={showModal}>
              <CloseModalButton
                aria-label='Close modal'
                onClick={() => setShowModal(prev => !prev)}
              >
                <FiX />
              </CloseModalButton>
              <ModalInfoContent>
                <SuccessIcon>
                  <FiCheckCircle />
                </SuccessIcon>
                <h1>{title}</h1>
                <p>{content}</p>
                <ActionButton onClick={() => setShowModal(false)}>
                  Got it!
                </ActionButton>
              </ModalInfoContent>
            </ModalInfoWrapper>
          </animated.div>
        </Background>
      ) : null}
    </>
  );
};