import React from 'react';
import '../styles/registration.css';
import { Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import '../styles/registration.css';
import logo from '../components/dosaaf_logo.png';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import axios from "axios";

function Password_recovery(props) {
    const [errors, setErrors] = useState({password: "", repeatPassword: ""});
    const [data, setData] = useState({forgotPasswordCode: "", newPassword: ""});
    const [repeatPassword, setRepeatPassword] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();

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

    const handlePasswordOnChange = (e) => {
        setData({...data, newPassword: e.target.value});
        setErrors(prevState => ({...prevState, password: ""}))
    }

    const handleRepeatPasswordOnChange = (e) => {
        setRepeatPassword(e.target.value);
        setErrors(prevState => ({...prevState, repeatPassword: ""}))
    }

    useEffect(() => {
        setData(prevData => ({...prevData, forgotPasswordCode: searchParams.get("uuid")}));
    })

    const validate = () => {
        let noErrors = true;
        let rPassword = new RegExp(/^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&? ".]).*$/);

        if(!data.newPassword){
            setErrors(prevState => ({...prevState, password: "пароль не должен быть пустой"}))
            noErrors = false;
        }
        else if(data.newPassword.length > 1000){
            setErrors(prevState => ({...prevState, password: "пароль не должен быть длиннее 1000 символов"}))
            noErrors = false;
        }
        else if(!rPassword.test(data.newPassword)){
            setErrors(prevState => ({...prevState, password: "пароль должен состоять из 8 или более символов. Содержать цифры, а также латинские буквы верхнего и нижнего регистров, и специальные символы ( «!», «@», «#», «$» и т.д.) "}))
            noErrors = false;
        }

        if(!repeatPassword){
            setErrors(prevState => ({...prevState, repeatPassword: "повтор пароля не должен быть пустым"}))
            noErrors = false;
        }
        else if(repeatPassword != data.newPassword){
            setErrors(prevState => ({...prevState, repeatPassword: "пароли не совпадают"}))
            noErrors = false;
        }

        return noErrors;
    }

    const handleResetPassword = () => {
        if(!validate()){
            return;
        }

        axios
        .post("/user/password/reset", data)
        .then((response) => {
            window.location.assign("login");
        })
        .catch((error) => {
            console.log(error);
        });
    }
    if(!isAuthorized){
        return (
            <>
                <Form className='form_registration mx-auto px-5 py-4 mb-5 bg-white mt-3'>
                    <Container>
                        <Image
                            src={logo}
                            height="80"
                            width="80"
                            className='mx-auto d-block'
                            alt='Logo'
                        />
                        <p className='fw-light text-secondary text-center mb-3'>ДОСААФ КОСТРОМА</p>
                    </Container>

                    <h4 className='text-center'>Восстановление пароля</h4>

                    <Form.Group className="mt-4" controlId="formBasicEmail">
                        <Form.Control type="password" placeholder="Укажите новый пароль" onChange={handlePasswordOnChange} className='control_input mx-auto d-block shadow-sm'/>
                        <Form.Label className='text-danger mx-1'>{errors.password}</Form.Label>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Control type="password" placeholder="Подтвердите пароль" onChange={handleRepeatPasswordOnChange} className='control_input mx-auto d-block shadow-sm'/>
                        <Form.Label className='text-danger mx-1'>{errors.repeatPassword}</Form.Label>
                    </Form.Group>

                    <p className='text-danger text-center mt-2'></p>
                    <Button className="mt-4 mb-3 btn_get_code_recovery mx-auto d-block" onClick={handleResetPassword}>
                        Восстановить
                    </Button>

                </Form>
            </>
        );
    }
}

export default Password_recovery;