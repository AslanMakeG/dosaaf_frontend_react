import React from 'react';
import { Container } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../styles/request.css';
import reguest_icon from '../components/reguest.png';
import Button from 'react-bootstrap/Button';
import { useState, useEffect } from 'react';
import axios from 'axios';
import PageInfo from '../components/PageInfo';


function RequestsService(props) {
    const [requests, setRequests] = useState([]);

    const [isAuthorized, setIsAuthorized] = useState(false);

    const [InfoTitle, setInfoTitle] = useState("Оставляйте онлайн-заявки на услуги.");
    const [InfoText, setInfoText] = useState("Это позволит Вам получить быстрое обслуживание прямо из дома.");
    const [InfoBtnText, setInfoBtnText] = useState("Перейти к услугам");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (localStorage.getItem("token")) {
            axios.get('/user', {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            }).then((response) => {
                setIsAuthorized(true);
            })
                .catch((error) => {
                    window.location.assign("login");
                });
        }
        else {
            window.location.assign("login");
        }
    }, [])

    useEffect(() => {
        axios
            .get("/request/user",
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem("token")
                    }
                })
            .then((response) => {
                setRequests(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                localStorage.removeItem("token");
            });
    }, [])

    const getDate = (date) => {
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

        let hour = parseInt(date.substring(11, 13)) + 3;
        let day = parseInt(date.substring(8, 10));
        let month = parseInt(date.substring(5, 7));
        let year = parseInt(date.substring(0, 4));

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

    if (isAuthorized) {
        return (
            <Container fluid className='main-cnt-erequest-service p-0'>
                <Container className='mt-2 d-flex justify-content-center' >
                    <p className='border-bottom p-2 border-primary border-opacity-50 main-section-title'>ЗАЯВКИ</p>
                </Container>
                <Row className='mt-3'>
                    <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                    <Col xs={9} sm={9} md={7} lg={9}>
                        <PageInfo text={InfoText} title={InfoTitle} btn_text={InfoBtnText} picture={reguest_icon} />
                        <Container fluid className='my_reguest-cnt p-0'>

                            <p className='mt-3 mb-2 my_reguest-title'>Мои заявки</p>
                            {loading ?
                                <Container fluid className='d-flex justify-center mt-3'>
                                    <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                    </svg>
                                </Container>
                                :
                                requests && requests.length > 0 ?
                                <table className="table table-striped table-bordered m-0 request-table">
                                    <thead>
                                        <tr className='border-bottom border-secondary border-opacity-50'>
                                            <th scope="col" className='text-secondary size-table-text '>№ Заявки</th>
                                            <th scope="col" className='text-secondary size-table-text'>Дата</th>
                                            <th scope="col" className='text-secondary size-table-text'>Услуга</th>
                                            <th scope="col" className='text-secondary size-table-text'>Статус</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((requestUser) => (
                                            <tr className='border-bottom border-secondary border-opacity-25'>
                                                <td className='size-table-text'>{requestUser.id}</td>
                                                <td className='size-table-text'>{getDate(requestUser.date)}</td>
                                                <td className='size-table-text'>{requestUser.serviceName}</td>
                                                {requestUser.status === "STATUS_EXAMINE" ?
                                                    <td className='text-primary opacity-75 size-table-text'>На рассмотрении</td> :
                                                    requestUser.status === "STATUS_ACCEPTED" ? <td className='text-success opacity-75 size-table-text'>Принята</td> :
                                                        <td className='text-danger opacity-75 size-table-text'>Отклонена</td>
                                                }
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                : <p className='mx-auto text-center mt-3'>Вы еще не оставляли заявок</p>
                            }
                            


                        </Container>






                    </Col>

                </Row>
            </Container>
        );
    }
}

export default RequestsService;