import React from 'react';
import { Container } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/profile.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import none_test from '../components/none_test.png';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ProgressBar from 'react-bootstrap/ProgressBar';


function My_page(props) {

    const [user, setUser] = useState(null);
    const [lastRequest, setLastRequest] = useState(null);
    const [lastTests, setLastTests] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (localStorage.getItem("token")) {
            axios
                .get("/user",
                    {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem("token")
                        }
                    })
                .then((response) => {
                    setUser(response.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        else {
            window.location.assign("/login");
        }
    }, []);

    useEffect(() => {
        axios
            .get("/request/user/last",
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem("token")
                    }
                })
            .then((response) => {
                setLastRequest(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    useEffect(() => {
        axios
            .get("/test/last",
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem("token")
                    }
                })
            .then((response) => {
                setLastTests(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const getDate = (registrationDate) => {
        const months = {
            1: 31,
            2: 28,
            3: 31,
            4: 30,
            5: 31,
            6: 30,
            7: 31,
            8: 31,
            9: 30,
            10: 31,
            11: 30,
            12: 31
        }

        let hour = parseInt(registrationDate.substring(11, 13)) + 3;
        let day = parseInt(registrationDate.substring(8, 10));
        let month = parseInt(registrationDate.substring(5, 7));
        let year = parseInt(registrationDate.substring(0, 4));

        if (hour >= 24) {
            hour = hour - 24;

            day++;

            if (day > months[month]) {
                if (month == 2 && ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)) {
                    day = 29;
                }
                else {
                    month++;
                    day = 1;
                }

                if (month > 12) {
                    month = 1;
                    year++;
                }
            }
        }

        return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year < 10 ? '0' + year : year}`;
    }

    return (
        <Container fluid className='main-cnt-my-page p-0'>
            <Container className='mt-2 d-flex justify-content-center' >
                <p className='border-bottom p-2 border-primary border-opacity-50 main-section-title'>ПРОФИЛЬ</p>
            </Container>
            {loading ?
                <Container fluid className='d-flex justify-center mt-3'>
                    <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                    </svg>
                </Container>
                :
                user ?
                    <Row className='mt-3'>
                        <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                        <Col xs={9} sm={9} md={7} lg={9}>
                            <Row xs={1} md={1} lg={1} xl={2} xxl={2}>
                                <Col key={'userinfo'}>
                                    <Container className='info_user p-4 shadow-sm mb-auto d-flex flex-column'>
                                        <Container fluid className='p-0 d-flex align-items-center my-auto'>
                                            <i className="bi bi-person-circle icon-name-user"></i>
                                            <p className='mb-0 title-name-user'>{user['name'] + ' ' + user['surname']}</p>
                                        </Container>


                                        <Container fluid className='p-0 d-flex align-items-center mt-3'>
                                            <i className="bi bi-envelope-open icon-time-user"></i>
                                            <p className='time_registration mb-0'>
                                                {user['email']}
                                            </p>
                                        </Container>

                                        <Container fluid className='p-0 d-flex align-items-center mt-2'>
                                            <i className="bi bi-clock icon-time-user"></i>
                                            <p className='time_registration mb-0'>Зарегистрирован с {getDate(user.registrationDate)}
                                            </p>
                                        </Container>

                                    </Container>
                                </Col>
                                <Col key={'lastrequest'}>
                                    <Container fluid className='p-4 cnt-last-request shadow-sm d-flex flex-column'>
                                        <Container fluid className='p-0 d-flex align-items-center'>
                                            <i className="bi bi-clipboard icon-status-last-request"></i>
                                            <p className='mb-0 title-status-last-request'>Статус последней заявки</p>
                                        </Container>

                                        {lastRequest ?
                                            <p className='mb-0 mt-3 last-reques-name-service'>{lastRequest.serviceName}</p>
                                            : ""}

                                        {lastRequest ?
                                            lastRequest.status == "STATUS_EXAMINE" ?
                                                <Container fluid className='d-flex p-0 mt-2 align-items-center'>
                                                    <i className="bi bi-hourglass wait-last-request-icon"></i>
                                                    <p className='mb-0 wait-last-request-text ms-2'>Рассматривается</p>
                                                </Container>
                                                :
                                                lastRequest.status == "STATUS_ACCEPTED" ?
                                                    <Container fluid className='d-flex p-0 mt-1 align-items-center'>
                                                        <i className="bi bi-check-circle check-last-request-icon"></i>
                                                        <p className='mb-0 check-last-request-text ms-2'>Принята</p>
                                                    </Container>
                                                    :
                                                    <Container fluid className='d-flex p-0 mt-1 align-items-center'>
                                                        <i className="bi bi-x-circle cancel-last-request-icon"></i>
                                                        <p className='mb-0 cancel-last-request-text ms-2'>Отклонена</p>
                                                    </Container>
                                            :
                                            <Container fluid className='p-0 cnt-user-no-request d-flex align-items-center my-auto'>
                                                <i className="bi bi-exclamation-circle icon-user-no-request"></i>
                                                <p className='mb-0 ms-2 text-user-no-request'>Заявок нет</p>
                                            </Container>
                                        }

                                    </Container>
                                </Col>
                            </Row>

                            <Container className={'p-4 mt-4 shadow-sm d-flex flex-column ' + (lastTests && lastTests.length > 0 ? 'dinamic-tests' : 'dinamic-tests-no-passing')}>
                                <Container fluid className='p-0 d-flex align-items-center'>
                                    <i className="bi bi-clipboard-data icon-dinamic-passing-tests"></i>
                                    <p className='title-dinamic-passing-tests mb-0'>Последние прохождения тестов</p>
                                </Container>
                                <hr className='hrfor'></hr>

                                {lastTests && lastTests.length > 0 ?
                                    lastTests.map((test, i) => (
                                        <Container fluid className='cnt-one-passing-test p-0' key={i}>
                                            <p className='mb-0 user-name-passing-test'>{test.name}</p>
                                            <Container fluid className='p-0 d-flex align-items-center justify-content-between mt-3 cnt-user-test-pr-bar'>
                                                <p className='mb-0 percent-passing-test'>0%</p>
                                                <Container fluid className='p-0 cnt-dinamic-progress-bar'>
                                                    <ProgressBar now={test.percent * 100} className='user-dinamic-test-progress shadow-sm' label={`${parseInt(test.percent * 100)}%`} />
                                                </Container>
                                                <p className='mb-0 percent-passing-test'>100%</p>
                                            </Container>
                                        </Container>
                                    ))
                                    :
                                    <Container className='my-auto'>
                                        <p className='text-secondary text-tests-no-passing text-center'>Пока нет данных, проходите тесты и они обязательно появятся</p>
                                        <img
                                            src={none_test}
                                            className='mx-auto d-block my-auto img-no-passing-test'
                                            alt='none_test'
                                        />
                                    </Container>
                                }


                            </Container>

                        </Col>
                    </Row>
                    : ''
            }
        </Container >

    );
}


export default My_page;