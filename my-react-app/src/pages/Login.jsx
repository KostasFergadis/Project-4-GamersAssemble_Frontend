import { useState } from "react";
import api, { getErrorMessage } from "../api";
import { DEV_API_AUTH } from "../consts-data";
import { Link, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Modal } from "react-bootstrap";

const Login = () => {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const [showAlert, setShowAlert] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post(`${DEV_API_AUTH}/login/`, formData);
      localStorage.setItem("token", response.data.token);
      navigate("/browse");
    } catch (err) {
      setError(getErrorMessage(err));
      setShowAlert(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-form-login">
      <span className="form-body-login">
        <div className="insidecard">
          <h2 className="logintitle">Log in</h2>
          <form onSubmit={onSubmit}>
            <div className="inputs">
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Control
                  type="email"
                  placeholder="Email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={onChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  onChange={onChange}
                  placeholder="Password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                />
              </Form.Group>
            </div>

            <div className="btncontainer">
              <Button
                className="form-btn"
                variant={
                  formData.email && formData.password ? "primary" : "secondary"
                }
                type="submit"
                size="lg"
                disabled={!formData.email || !formData.password || submitting}
              >
                {submitting ? "Logging in..." : "Login"}
              </Button>
            </div>

            <div className="mt-3">
              <p className="text-muted">
                Don't have an account? <Link to="/register">Sign up</Link>
              </p>
            </div>

            {error && (
              <Modal show={showAlert} onHide={() => setShowAlert(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>{error}</Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setShowAlert(false)}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            )}
          </form>
        </div>
      </span>
    </div>
  );
};

export default Login;
