import React from 'react';
import { Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import '../styles/registration.css';
import { Route, Routes } from 'react-router-dom';
import logo from '../components/dosaaf_logo.png';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';
import Login from './Login';
import { useState, useEffect } from "react";
import axios from "axios";





function Registration() {
    const [data, setData] = useState({ name: "", surname: "", patronymic: "", email: "", password: "", subscribedForNews: true});
    const [repeatPassword, setRepeatPassword] = useState("");
    const [response, setResponse] = useState("");

    const [isAuthorized, setIsAuthorized] = useState(true);

    const [errors, setErrors] = useState({ name: "", surname: "", patronymic: "", email: "", password: "", repeatPassword: "" })

    const [mainError, setMainError] = useState("");

    const [registerOver, setRegisterOver] = useState(false);

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordRepeatVisible, setPasswordRepeatVisible] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("token")) {
            axios.get('/user', {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            }).then((response) => {
                setIsAuthorized(true);
                window.location.assign("my_page");
            })
                .catch((error) => {
                    setIsAuthorized(false);
                });
        }
        else {
            setIsAuthorized(false);
        }
    }, [])

    const handleChange = (event) => {
        setData({ ...data, [event.target.name]: event.target.value });
        setErrors(prevState => ({ ...prevState, [event.target.name]: "" }))
    };

    const handleChangeRepeatPassword = (event) => {
        setRepeatPassword(event.target.value);
        setErrors(prevState => ({ ...prevState, repeatPassword: "" }))
    };

    const validate = () => {
        let noErrors = true;

        if (!data.name) {
            setErrors(prevState => ({ ...prevState, name: "имя не должно быть пустым" }))
            noErrors = false;
        }
        else if (data.name.length > 50) {
            setErrors(prevState => ({ ...prevState, name: "имя не должно быть длиннее 50 символов" }))
            noErrors = false;
        }

        if (!data.surname) {
            setErrors(prevState => ({ ...prevState, surname: "фамилия не должна быть пустой" }))
            noErrors = false;
        }
        else if (data.surname.length > 50) {
            setErrors(prevState => ({ ...prevState, surname: "фамилия не должна быть длиннее 50 символов" }))
            noErrors = false;
        }

        if (data.patronymic.length > 50) {
            setErrors(prevState => ({ ...prevState, patronymic: "отчество не должно быть длиннее 50 символов" }))
            noErrors = false;
        }

        let rEmail = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i);

        if (!data.email) {
            setErrors(prevState => ({ ...prevState, email: "email не должен быть пустой" }))
            noErrors = false;
        }
        else if (data.email.length > 320) {
            setErrors(prevState => ({ ...prevState, email: "email не должен быть длиннее 320 символов" }))
            noErrors = false;
        }
        else if (!rEmail.test(data.email)) {
            setErrors(prevState => ({ ...prevState, email: "email должен быть в формате dosaaf_123@dosaaf.ru" }))
            noErrors = false;
        }

        let rPassword = new RegExp(/^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&? ".]).*$/);

        if (!data.password) {
            setErrors(prevState => ({ ...prevState, password: "пароль не должен быть пустой" }))
            noErrors = false;
        }
        else if (data.password.length > 1000) {
            setErrors(prevState => ({ ...prevState, password: "пароль не должен быть длиннее 1000 символов" }))
            noErrors = false;
        }
        else if (!rPassword.test(data.password)) {
            setErrors(prevState => ({ ...prevState, password: "пароль должен состоять из 8 или более символов. Содержать цифры, а также латинские буквы верхнего и нижнего регистров, и специальные символы ( «!», «@», «#», «$» и т.д.) " }))
            noErrors = false;
        }

        if (!repeatPassword) {
            setErrors(prevState => ({ ...prevState, repeatPassword: "повтор пароля не должен быть пустым" }))
            noErrors = false;
        }
        else if (repeatPassword != data.password) {
            setErrors(prevState => ({ ...prevState, repeatPassword: "пароли не совпадают" }))
            noErrors = false;
        }

        return noErrors;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (registerOver) {
            window.location.assign("login");
            return;
        }

        if (!validate()) {
            return;
        }

        setRegisterOver(true);

        axios
            .post("/user/signup", data)
            .then((response) => {
                setResponse(response.data);
                window.location.assign("login");
            })
            .catch((error) => {
                if (error.code == "ERR_NETWORK") {
                    setMainError("нет соединения с сервером");
                }
                else if (error.response.status == 400) {
                    setMainError(error.response.data);
                }
                else if (error.response.status == 500) {
                    setMainError("произошла ошибка на сервере");
                }
                setErrors({ name: "", surname: "", patronymic: "", email: "", password: "", repeatPassword: "" });
            });
    };

    const handleSubscribeChange = (e) => {
        setData({...data, subscribedForNews: e.target.checked});
    }

    if (!isAuthorized) {
        return (
            <Container fluid className='main-cnt-autorization p-0'>
                <Form className='form_registration mx-auto px-5 py-4 mb-5 bg-white mt-3'>
                    <Container>
                        <Image
                            src={logo}
                            className='mx-auto d-block registration-logo'
                            alt='Logo'
                        />
                        <p className='fw-light text-secondary text-center mb-2 organization-name-title'>ДОСААФ КОСТРОМА</p>
                    </Container>
                    <p className='text-center entrance-title'>Регистрация</p>
                    {registerOver ?
                        <p className='text-primary text-center'>На вашу почту будет направлено письмо с подтверждением</p>
                        :
                        <><Form.Group className="mt-0" controlId="formBasicName">
                            <Form.Control type="text" placeholder="Имя" className='control_input mx-auto d-block shadow-sm' name="name" value={data.name}
                                onChange={handleChange} />
                            <Form.Label className="mx-1 text-danger">{errors.name}</Form.Label>
                        </Form.Group>

                            <Form.Group controlId="formBasicSurname">
                                <Form.Control type="text" placeholder="Фамилия" className='control_input mx-auto d-block shadow-sm' name="surname" value={data.surname}
                                    onChange={handleChange} />
                                <Form.Label className="mx-1 text-danger">{errors.surname}</Form.Label>
                            </Form.Group>

                            <Form.Group controlId="formBasicPatronymic">
                                <Form.Control type="text" placeholder="Отчество" className='control_input mx-auto d-block shadow-sm' name="patronymic" value={data.patronymic}
                                    onChange={handleChange} />
                                <Form.Label className="mx-1 text-danger">{errors.patronymic}</Form.Label>
                            </Form.Group>

                            <Form.Group controlId="formBasicEmail">
                                <Form.Control type="email" placeholder="Email" className='control_input mx-auto d-block shadow-sm' name="email" value={data.email}
                                    onChange={handleChange} />
                                <Form.Label className="mx-1 text-danger">{errors.email}</Form.Label>
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword">
                                <Container className='d-flex p-0' fluid>
                                    <Form.Control type={passwordVisible ? "text" : "password"} placeholder="Пароль" className='control_input mx-auto d-block shadow-sm' name="password" value={data.password}
                                        onChange={handleChange} />
                                    <Button style={{ background: "#1A4BB3" }} className='ms-2 ' onClick={() => setPasswordVisible(!passwordVisible)}>{passwordVisible ?
                                        <i style={{ pointerEvents: "none" }} class="bi bi-eye-slash"></i>
                                        :
                                        <i style={{ pointerEvents: "none" }} class="bi bi-eye"></i>
                                    }</Button>
                                </Container>
                                <Form.Label className="mx-1 text-danger">{errors.password}</Form.Label>
                            </Form.Group>

                            <Form.Group controlId="formBasicPasswordRepeat">
                                <Container className='d-flex p-0' fluid>
                                    <Form.Control type={passwordRepeatVisible ? "text" : "password"} placeholder="Повторный пароль" className='control_input mx-auto d-block shadow-sm'
                                        onChange={handleChangeRepeatPassword} />
                                    <Button style={{ background: "#1A4BB3" }} className='ms-2' onClick={() => setPasswordRepeatVisible(!passwordRepeatVisible)}>{passwordRepeatVisible ?
                                        <i style={{ pointerEvents: "none" }} class="bi bi-eye-slash"></i>
                                        :
                                        <i style={{ pointerEvents: "none" }} class="bi bi-eye"></i>
                                    }</Button>
                                </Container>
                                <Form.Label className="mx-1 text-danger">{errors.repeatPassword}</Form.Label>
                            </Form.Group>

                            <Form.Group controlId="subscribedForNews">
                                <Container className='p-0 d-flex align-center'>
                                    <Form.Check
                                        className='d-flex align-items-center p-0'
                                        inline
                                        defaultChecked={true}
                                        onChange={handleSubscribeChange}
                                        type="checkbox"
                                        name="Items" />
                                    <Form.Label className='m-0 p-0'>Я хочу получать новостную рассылку на почту</Form.Label>
                                </Container>
                            </Form.Group>

                        </>
                    }
                    <p className='text-danger text-center'>{mainError}</p>
                    <Button onClick={handleSubmit} className="mt-4 mb-3 btn_registration mx-auto d-block shadow-sm">
                        {registerOver ? "Продолжить" : "Зарегистрироваться"}
                    </Button>
                    <p className='text-secondary text-center mt-2 mb-1'>Уже зарегистрированы?</p>
                    <Link to='/login' className='link_login d-flex justify-content-center'><p className='mb-0'>Войти</p></Link>
                </Form>

            </Container>
        );
    }
}

export default Registration;