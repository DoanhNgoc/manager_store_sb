import { useEffect, useState } from "react";
import { Button, FloatingLabel, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();




    if (loading) return <p className="text-center">Đang xác thực...</p>;

    return (
        <div className="min-vh-100 w-100 m-0 p-0 d-flex justify-content-center align-items-center position-relative background">
            <div className="bg-light roude rounded shadow shadow-lg">
                <h3 className="text-info text-center">Reset Password</h3>

                <FloatingLabel label="New password" style={{ minWidth: 500 }}
                    className="m-3 mb-1">
                    <Form.Control
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </FloatingLabel>

                <Button className="m-3 mb-1" >
                    Update password
                </Button>
            </div>
        </div>


    );
}
