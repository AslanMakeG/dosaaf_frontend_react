import React from 'react';
import { Button, Container } from 'react-bootstrap';
import '../styles/home.css';
import '../styles/footer.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap-icons/font/bootstrap-icons.css'
import Image from 'react-bootstrap/Image';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Home(props) {
    const [allAnnouncements, setAllAnnouncements] = useState(null);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.addEventListener("resize", (event) => { setWindowWidth(window.innerWidth); });
    })

    useEffect(() => {
        axios.get('/announcement/all')
            .then((response) => {
                setAllAnnouncements(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <Container fluid className='home-cnt p-0'>
            <Container fluid className='banner-cnt p-5'>
                <p className='mb-1 banner-title'>Оказание услуг.</p>
                <p className='mb-1 banner-title'>Новости организации.</p>
                <p className='mb-1 banner-title'>Пробные экзамены.</p>

                <Row xs={1} md={1} lg={3} className='mt-3'>

                    <Col>
                        <Link to='/services' className='link_banner_function' >
                            <Container fluid className="shadow p-4 mt-3 ms-0 function-banner d-flex pt-auto align-items-center" >
                                <i className='bi bi-clipboard-check banner-icon m-0'></i>
                                <p className='function-banner-text my-0 ms-4'>Подача заявок на различные типы услуг</p>
                            </Container>
                        </Link>
                    </Col>

                    <Col>
                        <Link to='/news' className='link_banner_function' >
                            <Container fluid className="shadow p-4 mt-3 ms-0 function-banner d-flex pt-auto align-items-center" >
                                <i className='bi bi-newspaper banner-icon m-0'></i>
                                <p className='function-banner-text my-0 ms-4'>Просмотр опубликованных новостей организации</p>
                            </Container>
                        </Link>
                    </Col>
                    <Col>
                        <Link to='/testing' className='link_banner_function' >
                            <Container fluid className="shadow p-4 mt-3 ms-0 function-banner d-flex pt-auto align-items-center" >
                                <i className='bi bi-pencil-square banner-icon m-0'></i>
                                <p className='function-banner-text my-0 ms-4'>Прохождение пробных тестовых экзаменов </p>
                            </Container>
                        </Link>
                    </Col>
                </Row>
                <Button className='banner-btn mt-5 d-flex align-items-center justify-content-center' href='/my_page'>Перейти в личный кабинет</Button>
            </Container>
            {loading ?
                <Container fluid className='d-flex justify-center mt-5'>
                    <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                    </svg>
                </Container>
                :
                allAnnouncements && allAnnouncements.length > 0 ? allAnnouncements.map((anons, i) => (
                    windowWidth < 1200 ?
                        anons.image ?
                            <Container fluid className='home-anons p-0 mt-4' key={anons.id}>
                                <Container fluid className='d-flex flex-column p-0'>
                                    <Container fluid className='anons-text p-5 shadow border-container-radius d-flex flex-column'>

                                        <p className='anons-title'>{anons.title}</p>


                                        <p className='anons-info mt-4'>{anons.content}</p>

                                        <p className='photo-anons-title my-auto'>Фото анонса: </p>

                                    </Container>
                                    <Container fluid className='anons-image-cnt p-0'>
                                        <Image
                                            src={axios.defaults.baseURL + anons.imagePath}
                                            className='mx-auto d-block anons-image image-container-radius shadow-sm'
                                            alt='Logo'
                                        />
                                    </Container>
                                </Container>
                            </Container>
                            :
                            <Container fluid className='home-anons p-0 mt-4' key={anons.id}>
                                <Container fluid className='anons-text-without-photo p-5 shadow'>
                                    <p className='anons-title'>{anons.title}</p>
                                    <p className='anons-info mt-4'>{anons.content}</p>
                                </Container>
                            </Container>
                        :
                        anons.image ?
                            i % 2 == 0 ?
                                <Container fluid className='home-anons p-0 mt-4' key={anons.id}>
                                    <Row>
                                        <Col lg={7}>
                                            <Container className='anons-text p-5 shadow'>
                                                <Container fluid className='cnt-anons-title p-0'>
                                                    <p className='anons-title'>{anons.title}</p>
                                                </Container>
                                                <Container fluid className='cnt-anons-info p-0'>
                                                    <p className='anons-info mt-4'>{anons.content}</p>
                                                </Container>

                                            </Container>
                                        </Col>
                                        <Col lg={5}>
                                            <Container className='anons-image-cnt p-0'>
                                                <Image
                                                    src={axios.defaults.baseURL + anons.imagePath}
                                                    className='mx-auto d-block anons-image'
                                                    alt='Logo'
                                                />
                                            </Container>
                                        </Col>
                                    </Row>
                                </Container>
                                :
                                <Container fluid className='home-anons p-0 mt-4' key={anons.id}>
                                    <Row>
                                        <Col sm={5}>
                                            <Container className='anons-image-cnt p-0'>
                                                <Image
                                                    src={axios.defaults.baseURL + anons.imagePath}
                                                    className='mx-auto d-block anons-image'
                                                    alt='Logo'
                                                />
                                            </Container>
                                        </Col>
                                        <Col sm={7}>
                                            <Container className='anons-text p-5 shadow'>
                                                <p className='anons-title'>{anons.title}</p>
                                                <p className='anons-info mt-4'>{anons.content}</p>
                                            </Container>
                                        </Col>
                                    </Row>
                                </Container>
                            :
                            <Container fluid className='home-anons p-0 mt-4' key={anons.id}>
                                <Container fluid className='anons-text-without-photo p-5 shadow'>
                                    <p className='anons-title'>{anons.title}</p>
                                    <p className='anons-info mt-4'>{anons.content}</p>
                                </Container>
                            </Container>
                )) : <p className='mx-auto text-center mt-5'>Анонсов еще не создано</p>}

        </Container >

    );
}

export default Home;