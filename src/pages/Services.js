import React from 'react';
import { Container, Modal } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import '../styles/Services.css';
import { Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css'
import axios from 'axios';


function Services() {

    const [services, setServices] = useState([]);

    useEffect(() => {
        axios
            .get("/service/all")
            .then((response) => {
                setServices(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const [show, setShow] = useState(false);
    const [service_name, setServiceName] = useState("");
    const [serviceId, setServiceId] = useState(-1);

    const [userData, setUserData] = useState({ name: "", surname: "", patronymic: "", email: "" });
    const [phoneNumber, setPhoneNumber] = useState("");

    const [errors, setErrors] = useState({ name: "", surname: "", patronymic: "", email: "", phoneNumber: "" });

    const [loading, setLoading] = useState(true);

    const handleChange = (event) => {
        setUserData({ ...userData, [event.target.name]: event.target.value });
        setErrors(prevState => ({ ...prevState, [event.target.name]: "" }))
    };

    const handleChangePhoneNumber = (event) => {
        let value = event.target.value;

        if (event.nativeEvent.inputType != "deleteContentBackward" && ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(event.nativeEvent.data) == -1) {
            event.target.value = value.substring(0, value.length - 1);
            return;
        }
        else if (event.nativeEvent.inputType == "deleteContentBackward") {
            if (value.length == 13) {
                event.target.value = value.substring(0, 12);
            }
            else if (value.length == 10) {
                event.target.value = value.substring(0, 9);
            }
            else if (value.length == 5) {
                event.target.value = value.substring(0, 3);
            }
            else if (value.length == 1) {
                event.target.value = "";
            }
        }
        else {
            if (value.length == 1) {
                event.target.value = '(' + value;
            }
            else if (value.length == 4) {
                event.target.value = value + ') ';
            }
            else if (value.length == 10) {
                event.target.value = value.substring(0, 9);
                event.target.value += ("-" + event.nativeEvent.data);
            }
            else if (value.length == 13) {
                event.target.value = value.substring(0, 12);
                event.target.value += ("-" + event.nativeEvent.data);
            }
            else if (value.length == 16) {
                event.target.value = value.substring(0, 15);
            }
        }

        setErrors(prevState => ({ ...prevState, phoneNumber: "" }))
        setPhoneNumber(event.target.value);
    };

    const handleClose = () => {
        setServiceId(-1);
        setShow(false);
        if (!userData.id) {
            setUserData({ name: "", surname: "", patronymic: "", email: "" });
        }
        setPhoneNumber("");
    }

    useEffect(() => {
        if (serviceId === -1) return;

        axios
            .get("/service/" + serviceId)
            .then((response) => {
                setServiceName(response.data['name']);
                setServiceId(response.data['id']);
            })
            .catch((error) => {
                console.log(error);
            });

        if (localStorage.getItem("token")) {
            axios
                .get("/user",
                    {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem("token")
                        }
                    })
                .then((response) => {
                    setUserData(response.data);
                })
                .catch((error) => {
                    localStorage.removeItem("token");
                    console.log(error);
                });
        }

        setShow(true);
    }, [serviceId]);

    const handleShow = (e) => {
        setServiceId(e.target.dataset.id);
    };

    const validate = () => {
        let noErrors = true;

        if (!userData.name) {
            setErrors(prevState => ({ ...prevState, name: "имя не должно быть пустым" }))
            noErrors = false;
        }
        else if (userData.name.length > 50) {
            setErrors(prevState => ({ ...prevState, name: "имя не должно быть длиннее 50 символов" }))
            noErrors = false;
        }

        if (!userData.surname) {
            setErrors(prevState => ({ ...prevState, surname: "фамилия не должна быть пустой" }))
            noErrors = false;
        }
        else if (userData.surname.length > 50) {
            setErrors(prevState => ({ ...prevState, surname: "фамилия не должна быть длиннее 50 символов" }))
            noErrors = false;
        }

        if (userData.patronymic.length > 50) {
            setErrors(prevState => ({ ...prevState, patronymic: "отчество не должно быть длиннее 50 символов" }))
            noErrors = false;
        }

        let rEmail = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i);

        if (!userData.email) {
            setErrors(prevState => ({ ...prevState, email: "email не должен быть пустой" }))
            noErrors = false;
        }
        else if (userData.email.length > 320) {
            setErrors(prevState => ({ ...prevState, email: "email не должен быть длиннее 320 символов" }))
            noErrors = false;
        }
        else if (!rEmail.test(userData.email)) {
            setErrors(prevState => ({ ...prevState, email: "email должен быть в формате dosaaf_123@dosaaf.ru" }))
            noErrors = false;
        }

        let rPhone = new RegExp(/^[+]7\s[(]\d{3}[)]\s\d{3}[-]\d{2}[-]\d{2}$/i);

        if (!phoneNumber) {
            setErrors(prevState => ({ ...prevState, phoneNumber: "номер телефона не должен быть пустым" }));
            noErrors = false;
        }
        else if (!rPhone.test("+7 " + phoneNumber)) {
            setErrors(prevState => ({ ...prevState, phoneNumber: "номер телефона заполнен неправильно" }))
            noErrors = false;
        }

        return noErrors;
    }

    const handleSendRequest = (e) => {
        if (!validate()) {
            return;
        }

        axios
            .post("/request?serviceId=" + serviceId,
                {
                    "userName": userData.name,
                    "userSurname": userData.surname,
                    "userPatronymic": userData.patronymic,
                    "userEmail": userData.email,
                    "userPhoneNumber": "+7 " + phoneNumber
                },
                {
                    headers: {
                        Authorization: localStorage.getItem("token") ? 'Bearer ' + localStorage.getItem("token") : ''
                    }
                })
            .then((response) => {
            })
            .catch((error) => {
                console.log(error);
            });

        if (!userData.id) {
            setUserData({ name: "", surname: "", patronymic: "", email: "" });
        }
        setPhoneNumber("");
        setShow(false);
        setPhoneNumber("");
    }

    return (
        <>
            <Container fluid className='p-0 main-service-cnt'>
                <Container className='mt-2 d-flex justify-content-center' >
                    <p className='border-bottom p-2 border-primary border-opacity-50 main-section-title mb-0'>УСЛУГИ ДОСААФ КОСТРОМА</p>
                </Container>
                {loading ?
                    <Container fluid className='d-flex justify-center'>
                        <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                        </svg>
                    </Container>
                    :
                    services && services.length > 0 ?
                        services.map((serviceSection) => (
                            serviceSection.services && serviceSection.services.length > 0 ?
                                <Container className='p-0' fluid key={serviceSection.id}>
                                    <Container className='d-flex justify-content-start p-0' fluid>
                                        <p className='border-bottom px-1 border-secondary border-opacity-50 border-1 section-title mb-0 mt-5'>{serviceSection.name}</p>
                                    </Container>
                                    <Container fluid className='p-0'>
                                        <Row xs={1} md={2} lg={2} xl={2} xxl={3}>
                                            {serviceSection['services'].map((service) => (
                                                <Col className='ms-0' key={service.id}>
                                                    <Container fluid className='py-4 px-4 mt-3 ms-0 center-block service-cards d-flex flex-column shadow'>
                                                        <Container fluid className='p-0 cnt-service-title'>
                                                            <p className='service-title fw-bold mb-0'>{service.name}</p>
                                                        </Container>
                                                        <Container className='service-description mt-1 p-0'>
                                                            <p className='text-secondary mb-0 description-text' style={{ whiteSpace: "pre-line" }}>{service.description}</p>
                                                        </Container>
                                                        <div className='border-price p-3 border border-secondary border-opacity-50 d-flex flex-row mt-2 shadow-sm'>
                                                            <div className='my-auto'>
                                                                <p className='stoimost fw-light mb-0'>Стоимость : </p>
                                                                <p className='price-value fw-bold mb-0 mt-1'>{service.cost} ₽</p>
                                                            </div>

                                                            <i className='bi bi-cash-stack wallet px-2 py-1 me-0 shadow-sm my-auto mx-auto'></i>
                                                        </div>
                                                        <Button type="submit" data-id={service.id} className="btn-service mt-5"
                                                            onClick={handleShow}>Подать заявку</Button>
                                                    </Container>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Container>
                                </Container> : <p className='mx-auto text-center mt-5'>Услуг еще не создано</p>))
                        : "Услуг еще нет"}
            </Container>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title className='sevice-modal-title'>Форма заполнения заявки</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className='px-4'>
                        <p className='text-secondary'>Подача заявки на услугу</p>
                        <h5 className='mb-4'>{service_name}</h5>
                        <Form.Group controlId='fromBasicRequestName'>
                            <Form.Control value={userData.name} onChange={handleChange} type='text' name="name" placeholder='Имя' className='request-control-input shadow-sm' />
                            <Form.Label className='mx-1 text-danger'>{errors.name}</Form.Label>
                        </Form.Group>

                        <Form.Group controlId='fromBasicRequestSurname'>
                            <Form.Control value={userData.surname} onChange={handleChange} type='text' name="surname" placeholder='Фамилия' className='request-control-input shadow-sm' />
                            <Form.Label className='mx-1 text-danger'>{errors.surname}</Form.Label>
                        </Form.Group>

                        <Form.Group controlId='fromBasicRequestSurname'>
                            <Form.Control value={userData.patronymic} onChange={handleChange} type='text' name="patronymic" placeholder='Отчество' className='request-control-input shadow-sm' />
                            <Form.Label className='mx-1 text-danger'>{errors.patronymic}</Form.Label>
                        </Form.Group>

                        <Form.Group controlId='fromBasicRequestPhoneNumber' className='d-flex justify-space-between'>
                            <Form.Control style={{ width: "50px" }} defaultValue="+7" readOnly={true} disabled={true} type='text' name="phoneNumber" placeholder='Номер телефона' className='request-control-input shadow-sm' />
                            <Form.Control style={{ marginLeft: "5px" }} onChange={handleChangePhoneNumber} onPaste={(e) => { e.preventDefault(); }} type='text' name="phoneNumber" placeholder='Номер телефона' className='request-control-input shadow-sm' />
                        </Form.Group>
                        <Form.Label className='mx-1 text-danger'>{errors.phoneNumber}</Form.Label>

                        <Form.Group controlId='fromBasicRequestEmail'>
                            <Form.Control value={userData.email} disabled={userData.id} onChange={userData.id ? '' : handleChange} type='Email' name="email" placeholder='Email' className='request-control-input shadow-sm' />
                            <Form.Label className='mx-1 mb-3 text-danger'>{errors.email}</Form.Label>
                        </Form.Group>
                        <p className='text-center opacity-75'>После подачи заявки с Вами свяжется сотрудник ДОСААФ</p>
                        <Button className="mt-4 mb-3 btn_form_reguest mx-auto d-block" onClick={handleSendRequest}>Отправить заявку</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Services;