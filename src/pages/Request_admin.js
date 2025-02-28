import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Button, Container } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/request_admin.css';
import axios from 'axios';

function Request_admin(props) {
    const [showtab, SetShowtab] = useState(1);
    const handletab = (e) => {
        SetShowtab(e);
    }

    const [allRequests, SetRequests] = useState(null);

    const [isAdmin, setIsAdmin] = useState(false);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            window.location.assign("login");
        }
        else {
            axios.get('/user', {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            }).then((response) => {
                if (response.data.roles[0].name != 'ROLE_ADMIN') {
                    window.location.assign("login");
                }
                else {
                    setIsAdmin(true);
                }
            })
            .catch((error) => {
                window.location.assign("login");
            })
        }
    }, []);

    useEffect(() => { //получить все заявки
        axios
            .get("/request/all", {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                SetRequests(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const handleAcceptRequest = (event) => { //принять заявку
        axios
            .get("/request/accept/" + event.target.dataset.request, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                const acceptedRequest = response.data;

                const indexRequest = allRequests.examine.findIndex(request => request.id == acceptedRequest.id); //Ищем нужную заявку

                if (indexRequest === -1) return;

                const item = allRequests;

                const updatedRequests = {
                    ...item,
                    examine: item.examine.filter(request => request.id != acceptedRequest.id) //фильтр чтоб не было этой заявки
                };

                updatedRequests.accepted.push(acceptedRequest); // клажем с новым статусом

                SetRequests(updatedRequests); //обновляем список

                axios
                .get("/request/notify/" + response.data.id, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem("token")
                    }
                })
                .then((responseNotification) => {
                
                })
                .catch((error) => {
                    console.log(error);
                });       
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleRejectRequest = (event) => { //отклонить заявку
        axios
            .get("/request/reject/" + event.target.dataset.request, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                const rejectedRequest = response.data;

                const indexRequest = allRequests.examine.findIndex(request => request.id == rejectedRequest.id); //Ищем нужную заявку

                if (indexRequest === -1) return;

                const item = allRequests;

                const updatedRequests = {
                    ...item,
                    examine: item.examine.filter(request => request.id != rejectedRequest.id)
                };

                updatedRequests.rejected.push(rejectedRequest);

                SetRequests(updatedRequests);

                axios
                .get("/request/notify/" + response.data.id, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem("token")
                    }
                })
                .then((responseNotification) => {
                
                })
                .catch((error) => {
                    console.log(error);
                });       
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleAcceptRejectedRequest = (event) => { //принять отклоненную заявку
        axios
            .get("/request/accept/" + event.target.dataset.request, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                const acceptedRequest = response.data;

                const indexRequest = allRequests.rejected.findIndex(request => request.id == acceptedRequest.id); //Ищем нужную заявку

                if (indexRequest === -1) return;

                const item = allRequests;

                const updatedRequests = {
                    ...item,
                    rejected: item.rejected.filter(request => request.id != acceptedRequest.id)
                };

                updatedRequests.accepted.push(acceptedRequest);

                SetRequests(updatedRequests);

                axios
                .get("/request/notify/" + response.data.id, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem("token")
                    }
                })
                .then((responseNotification) => {
                
                })
                .catch((error) => {
                    console.log(error);
                });                
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleRejectAcceptedRequest = (event) => { //отклонить принятую заявку
        axios
            .get("/request/reject/" + event.target.dataset.request, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                const rejectedRequest = response.data;

                const indexRequest = allRequests.accepted.findIndex(request => request.id == rejectedRequest.id); //Ищем нужную заявку

                if (indexRequest === -1) return;

                const item = allRequests;

                const updatedRequests = {
                    ...item,
                    accepted: item.accepted.filter(request => request.id != rejectedRequest.id)
                };

                updatedRequests.rejected.push(rejectedRequest);

                SetRequests(updatedRequests);

                axios
                .get("/request/notify/" + response.data.id, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem("token")
                    }
                })
                .then((responseNotification) => {
                })
                .catch((error) => {
                    console.log(error);
                });         
            })
            .catch((error) => {
                console.log(error);
            });
    }

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

    if(isAdmin){
        return (
            <>
                <Container fluid className='main-cnt-request-admin p-0'>
                    <p className='text-center mt-2 main-section-title mb-1'>ПАНЕЛЬ АДМИНИСТРАТОРА</p>
                    <Container className='d-flex justify-content-center' fluid>
                        <p className='text-secondary border-bottom border-primary border-opacity-50 text-center title-subsection'>Управление заявками</p>
                    </Container>
                    <Row className='mt-3'>
                        <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                        <Col xs={9} sm={9} md={7} lg={9}>
                            <Container fluid className='d-flex justify-content-center p-0'>
                                <Button className={showtab === 1 ? 'btn-new-requests active' : 'btn-new-requests'} onClick={() => handletab(1)}>Новые заявки</Button>
                                <Button className={showtab === 2 ? 'btn-accepted-requests active' : 'btn-accepted-requests'} onClick={() => handletab(2)}>Принятые заявки</Button>
                                <Button className={showtab === 3 ? 'btn-rejected-requests active' : 'btn-rejected-requests'} onClick={() => handletab(3)}>Отклоненные заявки</Button>
                            </Container>

                            {loading ?
                                <Container fluid className='d-flex justify-center mt-3'>
                                    <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                    </svg>
                                </Container>
                            : allRequests ?
                                <Container fluid className='tab-content text-dark p-0' id='pills-tabContent'>
                                    <Container fluid className={showtab === 1 ? 'tab-pane fade show active p-0' : "tab-pane fade show p-0"}>
                                        {allRequests.examine.length != 0 ? allRequests.examine.map((request) => ( //вывод заявок на рассмотрении
                                            <Container fluid className='cont-new-requests px-5 py-3 mt-4 shadow rounded' key={request.id}>
                                                <p className='text-secondary mb-4 admin-reguest-req-admin'>Заявка № {request.id} от {request.date ? getDate(request.date) : ""}</p>
                                                <p className='text-secondary mb-3 admin-reguest-descr-admin'>Имя: <span className='text-dark'>{request.userSurname + " " + request.userName + " " + request.userPatronymic}</span></p>
                                                <p className='text-secondary mb-3 admin-reguest-descr-admin'>Почта: <span className='text-dark'>{request.userEmail}</span></p>
                                                <p className='text-secondary admin-reguest-descr-admin'>Услуга: <span className='text-dark'>{request.serviceName}</span></p>
                                                <div className='d-flex justify-content-between mt-4'>
                                                    <Button className='btn-accept-request' data-request={request.id} onClick={handleAcceptRequest}>Принять</Button>
                                                    <Button className='btn-reject-request ms-5' data-request={request.id} onClick={handleRejectRequest}>Отклонить</Button>
                                                </div>
                                            </Container>
                                        )) : <p className='mx-auto text-center mt-5'>Заявок на рассмотрении нет</p>}
                                    </Container>

                                    <Container fluid className={showtab === 2 ? 'tab-pane fade show active p-0' : "tab-pane fade p-0"}>
                                        {allRequests.accepted.length != 0 ? allRequests.accepted.map((request) => ( //вывод принятых заявок
                                            <Container fluid className='cont-accept-requests px-5 py-3 mt-4 shadow rounded' key={request.id}>
                                                <p className='text-secondary mb-4 admin-reguest-req-admin'>Заявка № {request.id} от {request.date ? getDate(request.date) : ""}</p>
                                                <p className='text-secondary mb-3 admin-reguest-descr-admin'>Имя: <span className='text-dark'>{request.userSurname + " " + request.userName + " " + request.userPatronymic}</span></p>
                                                <p className='text-secondary mb-3 admin-reguest-descr-admin'>Почта: <span className='text-dark'>{request.userEmail}</span></p>
                                                <p className='text-secondary admin-reguest-descr-admin'>Услуга: <span className='text-dark'>{request.serviceName}</span></p>
                                                <div className='mt-4'>
                                                    <Button className='btn-reject-request' data-request={request.id} onClick={handleRejectAcceptedRequest}>Отклонить</Button>
                                                </div>
                                            </Container>
                                        )) : <p className='mx-auto text-center mt-5'>Принятых заявок нет</p>}

                                    </Container>

                                    <Container fluid className={showtab === 3 ? 'tab-pane fade show active p-0' : "tab-pane fade p-0"}>
                                        {allRequests.rejected.length != 0 ? allRequests.rejected.map((request) => ( //вывод отклоненных заявок
                                            <Container fluid className='cont-reject-requests px-5 py-3 mt-4 shadow rounded' key={request.id}>
                                                <p className='text-secondary mb-4 admin-reguest-req-admin'>Заявка № {request.id} от {request.date ? getDate(request.date) : ""}</p>
                                                <p className='text-secondary mb-3 admin-reguest-descr-admin'>Имя: <span className='text-dark'>{request.userSurname + " " + request.userName + " " + request.userPatronymic}</span></p>
                                                <p className='text-secondary mb-3 admin-reguest-descr-admin'>Почта: <span className='text-dark'>{request.userEmail}</span></p>
                                                <p className='text-secondary admin-reguest-descr-admin'>Услуга: <span className='text-dark'>{request.serviceName}</span></p>
                                                <div className='mt-4'>
                                                    <Button className='btn-accept-request' data-request={request.id} onClick={handleAcceptRejectedRequest}>Принять</Button>
                                                </div>
                                            </Container>
                                        )) : <p className='mx-auto text-center mt-5'>Отклоненных заявок нет</p>}
                                    </Container>
                                </Container>
                                : <p className='mx-auto text-center mt-5'>Заявок еще нет</p>
                            }
                        </Col>

                    </Row>
                </Container>



            </>
        );
    }
}

export default Request_admin;