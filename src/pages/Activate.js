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
import { useSearchParams } from 'react-router-dom';

function Activate(props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("Email успешно подтвержден! Вы можете зайти на аккаунт");

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

    useEffect(() => {
        const uuid = searchParams.get("uuid");

        if(!uuid){
            return;
        }

        axios
        .get("/user/activate/" + searchParams.get("uuid"))
        .then((response) => {
            setLoading(false);
        })
        .catch((error) => {
            setLoading(false);
            console.log(error);
        });
    })
    
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

                    <h4 className='text-center'>Подтверждение почты</h4>
                    {loading ?
                        <Container fluid className='d-flex'>
                            <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                            </svg>
                        </Container>
                        
                    :
                        <Container fluid className='d-flex flex-column'>
                            <p className='email-activate-instruction text-center mb-0 mt-3'>{message}</p>
                            <Button className="mt-4 mb-3 btn_get_code_recovery mx-auto d-block" onClick={() => {window.location.assign("login")}}>
                                Продолжить
                            </Button>
                        </Container>
                    }

                </Form>
            </>
        );
    }
}

export default Activate;