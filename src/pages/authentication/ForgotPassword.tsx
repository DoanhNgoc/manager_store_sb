import { useState } from "react";
import { Button, FloatingLabel, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();


    return (
        <div className="bg-light roude rounded shadow shadow-lg">
            <div className="text-center ">
                <p className="fs-1 fw-bold m-1 text-info">Forgot Password</p>
            </div>
            <div>
                <Form>
                    {/* text email */}
                    <FloatingLabel
                        controlId="floatingInput"
                        label="Email"
                        style={{ minWidth: 500 }}
                        className="m-3 mb-1"

                    >
                        <Form.Control type="email" placeholder="abc123@gmail.com" value={email}
                            onChange={(e) => setEmail(e.target.value)} />
                    </FloatingLabel>
                    {sent && (
                        <p className="text-success m-3 mb-1">
                            Vui lòng kiểm tra email để đặt lại mật khẩu
                        </p>
                    )}
                    <div className="d-flex justify-content-end m-3">
                        <Button onClick={() => navigate("/")} variant="info" className="me-1 text-light">Login</Button>
                        <Button >
                            Send reset email
                        </Button>

                    </div>
                </Form>

            </div>
        </div>
    );
}