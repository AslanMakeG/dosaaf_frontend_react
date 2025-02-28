import React from 'react';
import '../styles/registration.css';
import { Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import '../styles/registration.css';
import logo from '../components/dosaaf_logo.png';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Registration from './Registration';
import { useState, useEffect } from "react";
import axios from "axios";


function Login() {
    const [data, setData] = useState({ email: "", password: "" });
    const [response, setResponse] = useState("");
    const [error, setError] = useState("")

    const [isAuthorized, setIsAuthorized] = useState(true);

    const [passwordVisible, setPasswordVisible] = useState(false);

    useEffect(() => {
        if(localStorage.getItem("token")){
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
        else{
            setIsAuthorized(false);
        }
    }, [])

    const handleChange = (event) => {
        setData({ ...data, [event.target.name]: event.target.value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        axios
            .post("/user/signin", data)
            .then((response) => {
                setResponse(response.data);
                localStorage.setItem('token', response.data['token'])
                window.location.assign("/my_page");
            })
            .catch((error) => {
                if(error.code == "ERR_NETWORK"){
                    setError("нет соединения с сервером");
                }
                else if(error.response.status == 400){
                    setError(error.response.data);
                }
                else if(error.response.status == 500){
                    setError("произошла ошибка на сервере");
                }
            });
    };

    if(!isAuthorized){
        return (
            <Container fluid className='main-cnt-autorization p-0'>
                <Form className='form_registration mx-auto px-5 py-4 mb-5 bg-white mt-3'>
                    <Container>
                        <Image
                            src={logo}
                            className='mx-auto d-block registration-logo'
                            alt='Logo'
                        />
                        <p className='fw-light text-secondary text-center mb-3 organization-name-title'>ДОСААФ КОСТРОМА</p>
                    </Container>

                    <p className='text-center entrance-title'>Вход</p>

                    <Form.Group controlId="formBasicEmail">
                        <Form.Control type="email" placeholder="Email" className='control_input mx-auto d-block shadow-sm' name="email" value={data.email}
                            onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className='mt-3' controlId="formBasicPassword">
                            <Container className='d-flex p-0' fluid>
                                <Form.Control type={passwordVisible ? "text" : "password"} placeholder="Пароль" name="password" className='control_input mx-auto d-block shadow-sm' 
                                onChange={handleChange} />
                                <Button style={{background: "#1A4BB3"}} className='ms-2 ' onClick={() => setPasswordVisible(!passwordVisible)}>{passwordVisible ? 
                                    <i style={{pointerEvents: "none"}} class="bi bi-eye-slash"></i> 
                                    :
                                    <i style={{pointerEvents: "none"}} class="bi bi-eye"></i>
                                    }</Button>
                            </Container>
                    </Form.Group>
                    <Link to= '/forgot_password' className='link_login'><p className='mt-2 mb-0'>Забыли пароль?</p></Link>
                    <p className='text-danger text-center mt-2'>{error}</p>
                    <Button type="submit" onClick={handleSubmit} className="mt-4 mb-3 btn_login mx-auto d-block shadow-sm">
                        Войти
                    </Button>
                    <Link to='/registration' className='link_login d-flex justify-content-center'><p className='m-0'>Зарегистироваться</p></Link>
                    
                </Form>
            </Container>
        );
    }
}

export default Login;