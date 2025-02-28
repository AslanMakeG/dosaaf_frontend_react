import React from 'react';
import { Button, Container } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/settings.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Form } from 'react-bootstrap'
import { useState, useEffect } from 'react';
import axios from 'axios';

function Settings(props) {
    const [passwordData, setPasswordData] = useState({oldPassword: "", newPassword: "", repeatNewPassword: ""});
    const [userData, setUserData] = useState({name: "", surname: "", patronymic: "", subscribedForNews: false});
    
    const [errors, setErrors] = useState({name: "", surname: "", patronymic: "", oldPassword: "", newPassword: "", repeatNewPassword: ""})
    const [success, setSuccess] = useState({userData: "", passwordData: ""});

    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if(localStorage.getItem("token")){
            axios.get('/user', {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            }).then((response) => {
                setIsAuthorized(true);
                setUserData(response.data);
            })
            .catch((error) => {
                window.location.assign("login");
            });
        }
        else{
            window.location.assign("login");
        }
    }, [])

    const handleSubscribed = (e) => {
        setUserData({...userData, subscribedForNews: e.target.checked});
    }

    const handleUserDataChange = (e) => {
        setUserData({...userData, [e.target.name]: e.target.value});
        setErrors({...errors, [e.target.name]: ""});
    }

    const handlePasswordDataChange = (e) => {
        setPasswordData({...passwordData, [e.target.name]: e.target.value});
        setErrors({...errors, [e.target.name]: ""});
    }

    const validateUserData = () => {
        let noErrors = true;

        if(!userData.name){
            setErrors(prevState => ({...prevState, name: "имя не должно быть пустым"}))
            noErrors = false;
        }
        else if(userData.name.length > 50){
            setErrors(prevState => ({...prevState, name: "имя не должно быть длиннее 50 символов"}))
            noErrors = false;
        }

        if(!userData.surname){
            setErrors(prevState => ({...prevState, surname: "фамилия не должна быть пустой"}))
            noErrors = false;
        }
        else if(userData.surname.length > 50){
            setErrors(prevState => ({...prevState, surname: "фамилия не должна быть длиннее 50 символов"}))
            noErrors = false;
        }

        if(userData.patronymic.length > 50){
            setErrors(prevState => ({...prevState, patronymic: "отчество не должно быть длиннее 50 символов"}))
            noErrors = false;
        }

        return noErrors;
    }
    
    const handleSaveUserData = (e) => {
        if(!validateUserData()){
            setSuccess({...success, userData: ""});
            return;
        }

        axios.put('/user/updateInfo', userData, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setUserData(response.data);
            setSuccess({...success, userData: "данные успешно изменены"});
        })
        .catch((error) => {
            console.log(error);
        });
    }

    const validatePassword = () => {
        let noErrors = true;
        let rPassword = new RegExp(/^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&? ".]).*$/);

        if(!passwordData.oldPassword){
            setErrors(prevState => ({...prevState, oldPassword: "старый пароль не должен быть пустым"}))
            noErrors = false;
        }

        if(!passwordData.newPassword){
            setErrors(prevState => ({...prevState, newPassword: "новый пароль не должен быть пустым"}))
            noErrors = false;
        }
        else if(passwordData.newPassword.length > 1000){
            setErrors(prevState => ({...prevState, newPassword: "пароль не должен быть длиннее 1000 символов"}))
            noErrors = false;
        }
        else if(!rPassword.test(passwordData.newPassword)){
            setErrors(prevState => ({...prevState, newPassword: "пароль должен состоять из 8 или более символов. Содержать цифры, а также латинские буквы верхнего и нижнего регистров, и специальные символы ( «!», «@», «#», «$» и т.д.) "}))
            noErrors = false;
        }

        if(passwordData.newPassword != passwordData.repeatNewPassword){
            setErrors(prevState => ({...prevState, repeatNewPassword: "повтор пароля не совпадает"}))
            noErrors = false;
        }

        return noErrors;
    }

    const handleChangePassword = (e) => {
        if(!validatePassword()){
            setSuccess({...success, passwordData: ""});
            return;
        }

        axios.put('/user/password/change', passwordData, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setPasswordData({oldPassword: "", newPassword: "", repeatNewPassword: ""});
            setSuccess({...success, passwordData: "пароль успешно изменен"});
        })
        .catch((error) => {
            setErrors({...errors, oldPassword: error.response.data});
        });
    }

    if(isAuthorized){
        return (
            <Container fluid className='main-cnt-settings p-0'>
                <Container className='mt-2 d-flex justify-content-center' >
                    <p className='border-bottom p-2 border-primary border-opacity-50 main-section-title'>НАСТРОЙКИ</p>
                </Container>
                <Row className='mt-3'>
                    <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                    <Col xs={9} sm={9} md={7} lg={9}>
                        <Container fluid className='ms-0 p-4 settings-change-contact-data rounded shadow-sm'>
                            <Container fluid className='p-0 d-flex align-items-center'>
                                <i className="bi bi-person-circle settings-title-icon"></i>
                                <p className='mb-0 ms-2 settings-title'>Изменение контактных данных</p>
                            </Container>
                            <Form>
                                <p className='mb-0 mt-1 settings-name-titles'>Фамилия</p>
                                <Form.Control type='text' name="surname" onChange={handleUserDataChange} defaultValue={userData.surname} placeholder='Введите фамилию' className='settings-contact-input shadow-sm mt-1' />
                                <Form.Label className='text-danger mx-1'>{errors.name}</Form.Label>
                                <p className='mb-0 mt-1 settings-name-titles'>Имя</p>
                                <Form.Control type='text' name="name" onChange={handleUserDataChange} defaultValue={userData.name} placeholder='Введите имя' className='settings-contact-input shadow-sm mt-1' />
                                <Form.Label className='text-danger mx-1'>{errors.surname}</Form.Label>
                                <p className='mb-0 mt-1 settings-name-titles'>Отчество</p>
                                <Form.Control type='text' name="patronymic" onChange={handleUserDataChange} defaultValue={userData.patronymic} placeholder='Введите отчество' className='settings-contact-input shadow-sm mt-1' />
                                <Form.Label className='text-danger mx-1'>{errors.patronymic}</Form.Label>
                            </Form>
                        </Container>

                        <Container fluid className='ms-0 p-4 settings-change-contact-data rounded shadow-sm mt-4'>
                            <Container fluid className='p-0 d-flex align-items-center'>
                                <i className="bi bi-lock settings-title-icon"></i>
                                <p className='mb-0 ms-2 settings-title'>Изменение пароля</p>
                            </Container>
                            <Form>
                                <Form.Control type='password' value={passwordData.oldPassword} onChange={handlePasswordDataChange} name="oldPassword" placeholder='Введите старый пароль' className='settings-contact-input shadow-sm mt-1' />
                                <Form.Label className='text-danger mx-1'>{errors.oldPassword}</Form.Label> 
                                <Form.Control type='password' value={passwordData.newPassword} onChange={handlePasswordDataChange} name="newPassword" placeholder='Введите новый пароль' className='settings-contact-input shadow-sm mt-1' />
                                <Form.Label className='text-danger mx-1'>{errors.newPassword}</Form.Label>
                                <Form.Control type='password' value={passwordData.repeatNewPassword} onChange={handlePasswordDataChange} name="repeatNewPassword" placeholder='Подтвердите новый пароль' className='settings-contact-input shadow-sm mt-1' />
                                <Form.Label className='text-danger mx-1'>{errors.repeatNewPassword}</Form.Label>
                            </Form>
                            <Button className='mt-4 btn-change-password d-flex justify-content-center align-items-center' 
                            onClick={handleChangePassword}
                            >Изменить пароль</Button>
                            <p className='text-success mx-1 my-1'>{success.passwordData}</p>
                        </Container>

                        <Container fluid className='ms-0 p-4 settings-change-contact-data rounded shadow-sm mt-4'>
                            <Container fluid className='p-0 d-flex align-items-center'>
                                <i className="bi bi-envelope-check settings-title-icon"></i>
                                <p className='mb-0 ms-2 settings-title'>Подписка на новости </p>
                            </Container>
                            <Container fluid className='p-0 d-flex align-items-center mt-3'>
                                <Form.Check className='d-flex align-items-center'
                                    defaultChecked={userData.subscribedForNews}
                                    onChange={handleSubscribed}
                                    type="checkbox"
                                    name="Items" />

                                <p className='mb-0 ms-2 mailing-agreement-title'>Я хочу получать рассылки на почту</p>
                            </Container>
                        </Container>

                        <Button className='mt-4 btn-settings-save-changes d-flex justify-content-center align-items-center'
                        onClick={handleSaveUserData}
                        >Сохранить изменения</Button>

                        <p className='text-success mx-1 my-1'>{success.userData}</p>

                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Settings;