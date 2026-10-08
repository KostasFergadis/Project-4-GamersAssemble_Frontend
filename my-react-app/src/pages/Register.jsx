import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { DEV_API_AUTH } from "../consts-data";
import { Modal } from "react-bootstrap";

const Register = () => {
  const [errorInvalid, setErrorInvalid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    profile_image: "",
    description: "",
    discord_username: "",
  });

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const [showAlert, setShowAlert] = useState(false);

  const canSubmit =
    formData.username &&
    formData.email &&
    formData.password &&
    formData.password_confirmation;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`${DEV_API_AUTH}/register/`, formData);
      navigate("/login");
    } catch (err) {
      setErrorInvalid(getErrorMessage(err));
      setShowAlert(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-form-register">
      <form className="form-body-register" onSubmit={onSubmit}>
        <div className="registerinside">
          <h2 className="registertitle">Register</h2>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Control
              type="text"
              placeholder="Username (3-9 characters)"
              name="username"
              autoComplete="username"
              maxLength={9}
              onChange={onChange}
              value={formData.username}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Control
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={onChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Control
              type="password"
              onChange={onChange}
              placeholder="Password"
              name="password"
              autoComplete="new-password"
              value={formData.password}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Control
              type="password"
              placeholder="Confirm Password"
              name="password_confirmation"
              autoComplete="new-password"
              onChange={onChange}
              value={formData.password_confirmation}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Control
              type="text"
              name="profile_image"
              placeholder="Add an image URL (optional)"
              value={formData.profile_image}
              onChange={onChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Control
              type="text"
              placeholder="Description (optional)"
              name="description"
              onChange={onChange}
              value={formData.description}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Control
              type="text"
              placeholder="Discord username (optional)"
              name="discord_username"
              onChange={onChange}
              value={formData.discord_username}
            />
          </Form.Group>
          <div className="btncontainer">
            <div className="registerbtn">
              <Button
                className="form-btn"
                variant={canSubmit ? "primary" : "secondary"}
                type="submit"
                size="lg"
                disabled={!canSubmit || submitting}
              >
                {submitting ? "Registering..." : "Register"}
              </Button>
            </div>
          </div>
        </div>
        {errorInvalid && (
          <Modal show={showAlert} onHide={() => setShowAlert(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Error</Modal.Title>
            </Modal.Header>
            <Modal.Body>{errorInvalid} </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAlert(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </form>
    </div>
  );
};

export default Register;
