import React from 'react';
import { Modal } from 'react-bootstrap';

type ModalComponentProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const ModalComponent: React.FC<ModalComponentProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

export default ModalComponent;
