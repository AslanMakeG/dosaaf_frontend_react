import React from 'react';
import { Container, Button } from 'react-bootstrap';
import '../styles/Educational_materials_admin.css';
import Sidebar from '../components/Sidebar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../styles/testing_admin.css';
import '../styles/titles-sizes.css';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';

function Testing_admin(props) {
    const [isAdmin, setIsAdmin] = useState(false);

    const [allTests, setAllTests] = useState(null);

    const [showTestDelete, setShowTestDelete] = useState(false);

    const [testData, setTestData] = useState(null);

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

    useEffect(() => { //получение всех тестов
        axios.get('/test/all', {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        })
        .then((response) => {
            setAllTests(response.data);
            setLoading(false);
        })
        .catch((error) => {
            console.log(error);
        })
    })

    const handleDeleteClick = (e) => { //получение информации о тесте и показ модалки удаления
        axios.get('/test/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        })
        .then((response) => {
            setTestData(response.data);
            setShowTestDelete(true);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handleDeleteTest = (e) => { //удаление теста
        axios.delete('/test/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        })
        .then((response) => {
            const updatedTests = allTests.filter(test => test.id != response.data);
            setAllTests(updatedTests);
            setShowTestDelete(false);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handleUpdateClick = (e) => { //переход на страницу изменения теста с указанием параметра id
        window.location.assign("update_test_admin?id=" + e.target.dataset.id);
    }

    if(isAdmin){
        return (
            <Container fluid className='main-cnt-admin-testing p-0'>
                <p className='text-center mt-2 main-section-title mb-1'>ПАНЕЛЬ АДМИНИСТРАТОРА</p>
                <Container className=' d-flex justify-content-center' fluid>
                    <p className='text-secondary border-bottom border-primary border-opacity-50 text-center title-subsection'>Управление тестами</p>
                </Container>
                <Row className='mt-3'>
                    <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                    <Col xs={9} sm={9} md={7} lg={9}>


                        <Container className='d-flex p-0' fluid>
                            <p className='d-flex align-items-center m-0 title-admin-add'>Добавить тест?</p>
                            <Button className='ms-4 btn-admin-add' href='create_test_admin'>Добавить</Button>
                        </Container>
                        <Row xs={1} md={1} lg={2} className='mt-4 cols-test-cards'>
                            {loading ?
                                <Container fluid className='d-flex justify-center mt-3'>
                                    <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                    </svg>
                                </Container>
                            :allTests && allTests.length > 0 ? 
                                allTests.map((test) => (
                                    <Col key={test.id}>
                                        <Container fluid className='admin-card-test px-5 py-4 mb-4 shadow rounded'>
                                            <Container fluid className='cnt-admin-name-test p-0'>
                                                <p className='mb-1 admin-name-card-test'><span className="fw-bold">Наименование: </span>{test.name}</p>
                                            </Container>
                                            <p className='mb-1 card-test-count-questions'><span className="fw-bold">Количество вопросов: </span>{test.questions.length}</p>
                                            <div className='d-flex justify-content-between mt-3'>
                                                <Button className='btn-admin-test-card-edit d-flex justify-content-center align-items-center' data-id={test.id} onClick={handleUpdateClick}><p className='m-0 test-card-btn-text' style={{pointerEvents: 'none'}}>Изменить</p> <i className="bi bi-pencil test-card-btn-icon" style={{pointerEvents: 'none'}}></i></Button>
                                                <Button className='btn-admin-test-card-delete d-flex justify-content-center align-items-center' data-id={test.id} onClick={handleDeleteClick}><p className='m-0 test-card-btn-text' style={{pointerEvents: 'none'}}>Удалить</p> <i className="bi bi-trash3 test-card-btn-icon" style={{pointerEvents: 'none'}}></i></Button>
                                            </div>
                                        </Container>
                                    </Col>
                                ))
                            : <p className='mx-auto text-center mt-3'>Тестов еще не создано</p>}                   
                        </Row>
                    </Col>
                </Row>
                {testData ?
                    <Modal
                        show={showTestDelete}
                        onHide={() => setShowTestDelete(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Удаление
                            </Modal.Title>
                        </Modal.Header>
                        {testData.name ?
                            <Modal.Body>
                                <h5 className='fw-light'>Вы действительно хотите удалить тест <span className="fw-bold">{testData.name}</span></h5>
                                <Button className="mt-3 mb-2 btn_delete_chapter-service" data-id={testData.id} onClick={handleDeleteTest}>Удалить</Button>
                            </Modal.Body>
                            : ""}

                    </Modal>
                :""}
            </Container>
        );
    }
}

export default Testing_admin;