import React from 'react';
import '../styles/registration.css';
import '../styles/loading.css';
import { Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import '../styles/registration.css';
import logo from '../components/dosaaf_logo.png';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import axios from "axios";
function Forgot_password(props) {
    const [errors, setErrors] = useState({email: ""});

    const [email, setEmail] = useState("");

    const [showMessage, setShowMessage] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const [loading, setLoading] = useState(false);

    const [isAuthorized, setIsAuthorized] = useState(true);

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

    const validate = () => {
        let rEmail = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i);
        let noErrors = true;
        if(!email){
            setErrors(prevState => ({...prevState, email: "email не должен быть пустой"}))
            noErrors = false;
        }
        else if(email.length > 320){
            setErrors(prevState => ({...prevState, email: "email не должен быть длиннее 320 символов"}))
            noErrors = false;
        }
        else if(!rEmail.test(email)){
            setErrors(prevState => ({...prevState, email: "email должен быть в формате dosaaf@dosaaf.ru"}))
            noErrors = false;
        }
        return noErrors;
    }

    const handleOnChange = (e) => {
        setEmail(e.target.value);
        setErrors(prevState => ({...prevState, email: ""}))
    }

    const handleSendEmail = () => {
        if(loading){
            return;
        }

        if(!isSuccess && showMessage){
            setShowMessage(null);
            return;
        }
        
        if(showMessage){
            window.location.assign("login");
            return;
        }

        if(!validate()){
            return;
        }

        setLoading(true);

        axios
        .get("/user/password/forgot/" + email)
        .then((response) => {
            setShowMessage("На ваш Email было направлено письмо с ссылкой для восстановления пароля");
            setIsSuccess(true);
            setLoading(false);
        })
        .catch((error) => {
            setIsSuccess(false);
            setShowMessage(error.response.data);
            setLoading(false);
        });
    }
    if(!isAuthorized){
        return (
            <Container fluid className='main-cnt-autorization p-0'>
                <Form className='form_registration d-flex flex-column mx-auto px-5 py-4 mb-5 bg-white mt-3'>
                    <Container>
                        <Image
                            src={logo}
                            className='mx-auto d-block registration-logo'
                            alt='Logo'
                        />
                        <p className='fw-light text-secondary text-center mb-3 organization-name-title'>ДОСААФ КОСТРОМА</p>
                    </Container>

                    <p className='text-center entrance-title'>Восстановление пароля</p>

                    {showMessage ? 
                        <p className={'text-center mt-2 ' + (isSuccess ? " text-primary" : " text-danger")}>{showMessage}</p>
                    :
                        loading ? 
                            <svg className="spinner align-self-center mt-4 mb-4" viewBox="0 0 50 50">
                                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                            </svg>
                            
                        :    
                            <Form.Group className="mb-3 mt-3" controlId="formBasicEmail">
                                <Form.Control type="email" placeholder="Укажите Вашу почту" className='control_input mx-auto d-block shadow-sm' name="email" 
                                onChange={handleOnChange}/>
                                <Form.Label className='text-danger mx-1'>{errors.email}</Form.Label>
                            </Form.Group>
                    }

                    <Button className="mb-3 btn_get_code_recovery mx-auto d-block" onClick={handleSendEmail}>
                        Продолжить
                    </Button>

                    <Link to='/login' className='link_login d-flex justify-content-center'><p className='mb-0'>Вернуться ко входу</p></Link>

                </Form>
            </Container>
        );
    }
}

export default Forgot_password;