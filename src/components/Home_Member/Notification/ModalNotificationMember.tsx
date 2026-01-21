import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Form } from "react-bootstrap";

function ModalNotificationMember() {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return <>
        <Button variant="primary" onClick={handleShow} className="fw-bold">Thông báo</Button>
        <Modal size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={show}
            onHide={handleClose}>
            <Modal.Header closeButton className="bg-primary">
                <Modal.Title id="contained-modal-title-vcenter" className="text-light">
                    Thông báo: Ngọc Doanh
                </Modal.Title>

            </Modal.Header>
            <Modal.Body className="d-flex align-items-center justify-content-center">
                <div className="border border-dark rounded-4 m-1 p-0 w-100">
                    <div className="header border-bottom border-dark">
                        <p className="m-1 mx-2 fw-bold fs-5">
                            Nội dung thông báo
                        </p>
                    </div>
                    <div className="content m-2 my-1">
                        <Form>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label className="fw-bold">Tiêu đề</Form.Label>
                                <Form.Control type="text" placeholder="" className="border-1 border-secondary rounded-0" />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                <Form.Label className="fw-bold">Nội dung thông báo</Form.Label>
                                <Form.Control as="textarea" rows={3} className="border-1 border-secondary rounded-0" />
                            </Form.Group>
                        </Form>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleClose} variant="secondary">Thoát</Button>
                <Button onClick={handleClose}>Xác nhận</Button>
            </Modal.Footer>
        </Modal>
    </>
}
export default ModalNotificationMember