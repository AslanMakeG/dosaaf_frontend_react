import React from 'react';
import { Container, Button } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import '../styles/new.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Modal } from 'react-bootstrap';
import { useState, useEffect, useRef, createRef } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import Compon_breadcrumps from '../components/Compon_breadcumps';

function New(props) {
    const [PhotoGalleryShow, setPhotoGalleryShow] = useState(false);
    const [PhotoInCarouselShow, setPhotoInCarouselShow] = useState(false);

    const [isGalleryShowing, setGalleryShowing] = useState(false);

    const [newsData, setNewsData] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const [chousenPicture, setChousenPicture] = useState(null);

    const [index, setIndex] = useState(-1);

    const links = [
        { url: '/news', title: 'Новости' },
        { url: '/new', title: 'Просмотр новости' }
    ];


    const handleSelect = (selectedIndex, e) => {
        chousenPicture.classList.remove('active');
        if (e.target.className.includes('prev')) {
            if (index == 0) {
                setIndex(newsData.pictures.length - 1);
            }
            else {
                setIndex(parseInt(index) - 1);
            }
        }
        else if (e.target.className.includes('next')) {
            if (index < newsData.pictures.length - 1) {
                setIndex(parseInt(index) + 1);
            }
            else {
                setIndex(0);
            }
        }
    };


    const handleShowImage = (e) => {
        if (e.target.getAttribute("data-gallery") !== "false") {
            setGalleryShowing(true);
        }
        setIndex(e.target.getAttribute("data-index"));
        setPhotoGalleryShow(false);
        setPhotoInCarouselShow(true);
    }

    useEffect(() => {
        if (index === -1) return;

        console.log(index);

        const el = document.getElementById('carousel_item_' + index);

        if (el === null) {
            console.log("не найден");
            return;
        }

        setChousenPicture(el);

        el.classList.add('active');
    }, [index]);

    const months = {
        1: "января",
        2: "февраля",
        3: "марта",
        4: "апреля",
        5: "мая",
        6: "июня",
        7: "июля",
        8: "августа",
        9: "сентября",
        10: "октября",
        11: "ноября",
        12: "декабря"
    }

    useEffect(() => {
        axios
            .get("/news/" + searchParams.get("newsId"))
            .then((response) => {
                setNewsData(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const getDate = (news) => {
        const monthsDays = {
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

        let hour = parseInt(news.creationDateTime.substring(11, 13)) + 3;
        let minute = parseInt(news.creationDateTime.substring(14, 16));
        let day = parseInt(news.creationDateTime.substring(8, 10));
        let month = parseInt(news.creationDateTime.substring(5, 7));
        let year = parseInt(news.creationDateTime.substring(0, 4));

        if (hour >= 24) {
            hour = hour - 24;

            day++;

            if (day > monthsDays[month]) {
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
        return `${day < 10 ? '0' + day : day} ${months[month]} ${year < 10 ? '0' + year : year} г. в ${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`
    }

    return (
        <>
            {newsData ?
                <Container fluid className='mt-5 main-new p-0'>
                    <Compon_breadcrumps links={links} />

                    <p className='new-title fw-bold'>{newsData ? newsData.title : ""}</p>
                    {newsData.pictures && newsData.pictures.length > 0 ?
                        <Row xs={3} sm={4} md={4} lg={6}>
                            {newsData.pictures.length > 12 ?
                                newsData.pictures.slice(0, 11).map((picture, i) => (
                                    <Col>
                                        <Container fluid className="preview-photo p-0 mt-3" onClick={handleShowImage} data-index={i} data-gallery={false}>
                                            <div className='go-to-preview-photo d-flex justify-content-center align-items-center image_disabled'><i className='bi bi-arrows-angle-expand text-light opacity-75 image_disabled'></i></div>
                                            <Image
                                                src={picture.pictureLink}
                                                height="100%"
                                                width='100%'
                                                className='mx-auto d-block format-preview-photo image_disabled'
                                                alt='Logo'
                                            />
                                        </Container>
                                    </Col>
                                ))
                                : newsData.pictures.map((picture, i) => (
                                    <Col>
                                        <Container fluid className="preview-photo p-0 mt-3" onClick={handleShowImage} data-index={i} data-gallery={false}>
                                            <div className='go-to-preview-photo d-flex justify-content-center align-items-center image_disabled'><i className='bi bi-arrows-angle-expand text-light opacity-75 image_disabled'></i></div>
                                            <Image
                                                src={picture.pictureLink}
                                                height="100%"
                                                width='100%'
                                                className='mx-auto d-block format-preview-photo image_disabled'
                                                alt='Logo'
                                            />
                                        </Container>
                                    </Col>
                                ))}
                            {newsData.pictures.length > 12 ?
                                <Col>
                                    <Container fluid className="preview-photo p-0 mt-3" onClick={() => setPhotoGalleryShow(true)}>
                                        <div className='go-to-all-photo d-flex justify-content-center align-items-center'><div><p className='text-light m-0 text-center show-all-photo'>Увидеть все фото</p> <p className='text-light text-center m-0 pt-2 fw-bolder count-photo-new'>{newsData.pictures.length} фото</p></div></div>
                                        <Image
                                            src={newsData.pictures[11].pictureLink}
                                            height="100%"
                                            width='100%'
                                            className='mx-auto d-block format-preview-photo'
                                            alt='Logo'
                                        />
                                    </Container>
                                </Col>
                                :
                                ""}

                        </Row>
                        : ""}

                    <Container fluid className='d-flex justify-content-center p-0 mt-3'>
                        <Container fluid className='new-all-card p-4 shadow'>
                            <p style={{ whiteSpace: "pre-line" }} className='mt-2 text-new'>{newsData.content} </p>
                            <Container fluid className='d-flex justifi-content-start p-0'>
                                <i class="bi bi-clock text-secondary fw-light text-date-publication me-2"></i>
                                <p className='text-secondary fw-light text-date-publication'>Дата публикации: </p>
                                <p className='text-secondary fw-light text-date-publication ms-2'>{getDate(newsData)}</p>
                            </Container>

                        </Container>
                    </Container>
                </Container>
                : ""}

            {newsData ?
                <Modal
                    size='xl'
                    show={PhotoGalleryShow}
                    onHide={() => setPhotoGalleryShow(false)}
                    scrollable
                >
                    <Modal.Header closeButton>
                        <Modal.Title >
                            {newsData.title}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='mb-3'>
                        <Row xs={3} md={4} lg={6}>
                            {newsData.pictures && newsData.pictures.length > 0 ?
                                newsData.pictures.map((picture, i) => (
                                    <Col>
                                        <Container fluid className="photo-in-gallery p-0 mt-3" data-index={i} onClick={handleShowImage}>
                                            <Image
                                                src={picture.pictureLink}
                                                height="100%"
                                                width='100%'
                                                className='mx-auto d-block format-preview-photo image_disabled'
                                                alt='Logo'
                                            />
                                        </Container>
                                    </Col>
                                ))
                                : ""}
                        </Row>
                    </Modal.Body>
                </Modal>
                : ""}

            {newsData ?
                <Modal
                    size='lg'
                    show={PhotoInCarouselShow}
                    onHide={() => {
                        setPhotoInCarouselShow(false);
                        setIndex(-1);
                        if (isGalleryShowing) {
                            setPhotoGalleryShow(true);
                            setGalleryShowing(false);
                        }

                    }}
                    animation={false}
                    backdrop="static"
                    keyboard={false}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Просмотр фотографии {parseInt(index) + 1} из {newsData.pictures.length}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='mb-3'>
                        <Carousel data-bs-theme="dark" interval={null} indicators={false} slide={false} touch={false} activeIndex={parseInt(index)} onSelect={handleSelect}>
                            {newsData.pictures && newsData.pictures.length > 0 ?
                                newsData.pictures.map((picture, i) => (
                                    <Carousel.Item id={`carousel_item_` + i}>
                                        <Container className='mx-auto d-block format-selected-photo d-flex justify-content-center'>
                                            <Image className='selected-img'
                                                src={picture.pictureLink}
                                                alt='Logo'
                                            />
                                        </Container>
                                    </Carousel.Item>
                                ))
                                : ""}
                        </Carousel>
                    </Modal.Body>
                </Modal>
                : ""}
        </>
    );
}

export default New;