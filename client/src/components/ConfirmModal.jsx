import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function ConfirmModal({
  show,
  onClose,
  onConfirm,
  message,
  confirmLabel = "Da, obriši",
}) {
  return (
    <Modal show={show} onClose={onClose} popup size="md" dismissible>
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-fon-muted dark:text-fon-dark-muted" />
          <h3 className="mb-5 text-lg font-normal text-fon-muted dark:text-fon-dark-muted">
            {message}
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="red" className="cursor-pointer" onClick={onConfirm}>
              {confirmLabel}
            </Button>
            <Button color="gray" className="cursor-pointer" onClick={onClose}>
              Ne, otkaži
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
