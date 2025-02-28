import React from 'react';
import '../styles/anonses_admin.css';
import { Button, Container } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../styles/titles-sizes.css';
import axios, { all } from 'axios';

function Anonses_admin(props) {
    const [ShowCreateAnons, SetShowCrAnons] = useState(false);
    const [ShowUpdateAnons, SetShowUpdateAnons] = useState(false);
    const [ShowDeleteAnons, SetShowDeleteAnons] = useState(false);

    const [ImageAnons, setImageAnons] = useState(null);
    const [FileNameAnons, setFileNameAnons] = useState("Выберите картинку")

    const [isAdmin, setIsAdmin] = useState(false);

    const [data, setData] = useState({ title: "", content: "" });
    const [dataImage, setDataImage] = useState(null);

    const [allAnnouncements, setAllAnnouncements] = useState(null);

    const [errors, setErrors] = useState({ title: "", content: "", image: "" });

    const [anonsData, setAnonsData] = useState(null);

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
                    console.log(error);
                });

        }
    }, []);

    useEffect(() => {
        axios.get('/announcement/all', {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setAllAnnouncements(response.data);
            setLoading(false);
        })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const validate = () => {

        let noErrors = true;

        if (!data.title) {
            setErrors(prevErrors => ({ ...prevErrors, title: "заголовок анонса не должен быть пустым" }))
            noErrors = false;
        }
        else if (data.title.length > 120) {
            setErrors(prevErrors => ({ ...prevErrors, title: "заголовок анонса не должен быть длинее 120 символов" }))
            noErrors = false;
        }

        if (!data.content) {
            setErrors(prevErrors => ({ ...prevErrors, content: "содержание не должно быть пустое" }))
            noErrors = false;
        }
        else if (data.content.length > 900) {
            setErrors(prevErrors => ({ ...prevErrors, content: "содержание не должно быть длиннее 900 символов" }))
            noErrors = false;
        }

        return noErrors;
    }

    const handleAnonsOnChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
        setErrors({
            ...errors,
            [e.target.name]: ""
        });
    }

    const handleDeleteClick = (e) => {
        axios.get('/announcement/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setAnonsData(response.data);
            SetShowDeleteAnons(true);
        })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleSaveAnons = (e) => {
        if (!validate()) {
            return;
        }

        let formData = new FormData();
        formData.append("title", data.title);
        formData.append("content", data.content);

        if (dataImage) {
            formData.append("image", dataImage);
        }

        axios.post('/announcement', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            SetShowCrAnons(false);
            setData({ title: "", content: "" });
            setDataImage(null);
            setImageAnons(null);
            setFileNameAnons("Выберите картинку");
            setAllAnnouncements([...allAnnouncements, response.data]);
        })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleDeleteAnons = (e) => {
        axios.delete('/announcement/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            const updatedAnons = allAnnouncements.filter(anons => anons.id != response.data);
            setAllAnnouncements(updatedAnons);

            SetShowDeleteAnons(false);
        })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleUpdateClick = (e) => {
        axios.get('/announcement/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setData(response.data);
            if (response.data.image) {
                setFileNameAnons(response.data.image);
                setImageAnons(axios.defaults.baseURL + response.data.imagePath);
            }
            SetShowUpdateAnons(true);
        })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleUpdateAnons = (e) => {
        if (!validate()) {
            return;
        }

        let formData = new FormData();
        formData.append("id", data.id);
        formData.append("title", data.title);
        formData.append("content", data.content);

        if (dataImage) {
            formData.append("image", dataImage);
            formData.append("sameImage", false);
        }

        if (!ImageAnons) {
            formData.append("sameImage", false);
        }

        axios.put('/announcement', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            SetShowUpdateAnons(false);
            setData({ title: "", content: "" });
            setDataImage(null);
            setImageAnons(null);
            setFileNameAnons("Выберите картинку");

            const updatedAnons = response.data;

            const index = allAnnouncements.findIndex(anons => anons.id == updatedAnons.id);

            if (index == -1) {
                return;
            }

            const updatedAnnouncements = allAnnouncements;
            updatedAnnouncements[index] = updatedAnons;

            setAllAnnouncements(updatedAnnouncements);
        })
            .catch((error) => {
                console.log(error);
            });
    }

    if (isAdmin) {
        return (
            <>
                <Container fluid className='main-cnt-anons-admin p-0'>
                    <p className='text-center mt-2 main-section-title mb-1'>ПАНЕЛЬ АДМИНИСТРАТОРА</p>
                    <Container className='d-flex justify-content-center' fluid>
                        <p className='text-secondary border-bottom border-primary border-opacity-50 text-center title-subsection'>Управление анонсами</p>
                    </Container>
                    <Row className='mt-3'>
                        <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                        <Col xs={9} sm={9} md={7} lg={9}>



                            <Container className='d-flex p-0' fluid>
                                <p className='d-flex align-items-center m-0 title-admin-add'>Добавить анонс?</p>
                                <Button className='ms-4 btn-admin-add' onClick={() => SetShowCrAnons(true)}>Добавить</Button>
                            </Container>
                            {loading ?
                                <Container fluid className='d-flex justify-center mt-3'>
                                    <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                    </svg>
                                </Container>
                                : allAnnouncements && allAnnouncements.length > 0 ?
                                    <Row xs={1} md={1} lg={2} className=''>
                                        {allAnnouncements.map(anons => (
                                            <Col key={anons.id}>
                                                <Container fluid className='anons-card p-4 shadow-sm rounded mt-4'>
                                                    <p className='m-0 titles-anons-card'>Заголовок анонса:</p>
                                                    <p className='m-0 name-anons-card fw-bold'>{anons.title}</p>
                                                    <p className='m-0 titles-anons-card mt-2'>Фото анонса:</p>

                                                    {anons.image ?
                                                        <Image
                                                            src={axios.defaults.baseURL + anons.imagePath}
                                                            width="100%"
                                                            className='mx-auto d-block format-anons-photo mt-2'
                                                            alt='Logo'
                                                        />
                                                        :
                                                        <Container className='no-admin-photo-anons mt-2 p-4 d-flex justify-content-center align-items-center'>
                                                            <div className='text-center'>
                                                                <i className="bi bi-ban ban-icon"></i>
                                                                <p className='no-admin-photo-text mt-2'>Нет фото</p>
                                                            </div>
                                                        </Container>
                                                    }


                                                    <p className='m-0 titles-anons-card mt-2'>Описание</p>
                                                    <Container className='cnt-admin-anons-descroption p-0'>
                                                        <p className='descriptoin-admin-anons'>{anons.content}</p>
                                                    </Container>
                                                    <Container className='d-flex justify-content-between p-0 mt-3 cnt-btn-anonse-admin mb-1'>
                                                        <Button className='btn-edit-anons shadow-sm' data-id={anons.id} onClick={handleUpdateClick}>Изменить</Button>
                                                        <Button className='btn-delete-anons shadow-sm' data-id={anons.id} onClick={handleDeleteClick}>Удалить</Button>
                                                    </Container>
                                                </Container>
                                            </Col>
                                        ))}
                                    </Row>
                                    : <p className='mx-auto text-center mt-5'>Анонсов еще не создано</p>}

                        </Col>

                    </Row>
                </Container>

                <Modal
                    show={ShowCreateAnons}
                    onHide={() => {
                        SetShowCrAnons(false)
                        setData({ title: "", content: "" })
                        setErrors({ title: "", content: "", image: "" })
                        setDataImage(null);
                        setImageAnons(null);
                        setFileNameAnons("Выберите картинку");
                    }}>
                    <Modal.Header closeButton>
                        <Modal.Title className='anons-modal-title'>
                            Создание анонса
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className='py-4 d-flex flex-column'>
                            <Form.Group>
                                <Form.Control type='text' placeholder='Введите заголовок анонса' name="title" onChange={handleAnonsOnChange} className='anons-name-control-input shadow-sm' />
                                <Form.Label className="mb-3 mx-1 text-danger">{errors.title}</Form.Label>
                            </Form.Group>
                            <Form.Group controlId='NameChapter'>
                                <Form.Control as="textarea" placeholder='Введите описание анонса' name="content" onChange={handleAnonsOnChange} className='anons-name-control-tetxarea shadow-sm' />
                                <Form.Label className="mb-3 mx-1 text-danger">{errors.content}</Form.Label>
                            </Form.Group>
                            <Form.Group className='form-input-logo-anons d-flex flex-column justify-content-center align-items-center mb-3 mx-auto'
                                onClick={() => document.querySelector(".input-field-anons").click()}>
                                <Form.Control type='file' accept=".jpg, .png" className='input-field-anons mb-3' hidden
                                    onChange={({ target: { files } }) => {
                                        if (files) {
                                            if ((files[0].size / 1024.0 / 1024.0) > 5) {
                                                setErrors({ ...errors, image: "размер изображения не должен превышать 5 МБ" });
                                                setFileNameAnons("Выберите картинку");
                                                setDataImage(null);
                                                setImageAnons(null);
                                                return;
                                            }
                                            else if (files[0].type != "image/jpeg" && files[0].type != "image/png") {
                                                setErrors({ ...errors, image: "изображение должно быть jpg или png" });
                                                setFileNameAnons("Выберите картинку");
                                                setImageAnons(null);
                                                setDataImage(null);
                                                return;
                                            }
                                            files[0] && setFileNameAnons(files[0].name)
                                            setImageAnons(URL.createObjectURL(files[0]))
                                            setDataImage(files[0]);
                                            setErrors({ ...errors, image: "" });
                                        }
                                    }

                                    } onClick={(event) => { event.target.value = null; }} />

                                {ImageAnons ?
                                    <Image
                                        src={ImageAnons}
                                        height="100%"
                                        width='100%'
                                        className='mx-auto my-auto d-block photo-admin-anons p-1'
                                        alt='Logo'
                                    /> :
                                    <>
                                        <i className='bi bi-upload upload_icon'></i>
                                        <p className='m-0 name-photo-anons'>Загрузить фото</p>
                                    </>
                                }
                            </Form.Group>

                            <section className='upload-del p-2 d-flex justify-content-between shadow-sm border rounded mt-2'>
                                <div className='d-flex align-items-center cnt-name-file-anons'>
                                    <i className="bi bi-file-image icon_image_anons"></i>
                                    <p className='m-0 name-photo-anons'>{FileNameAnons}</p>
                                </div>
                                <i className="bi bi-trash icon_trash_anons" onClick={() => {
                                    setFileNameAnons("Выберите картинку")
                                    setImageAnons(null)
                                    setDataImage(null)
                                }}></i>
                            </section>

                            <Button className="mt-4 btn_form_partner mx-auto" onClick={handleSaveAnons}>Сохранить</Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                {data ?
                    <Modal
                        show={ShowUpdateAnons}
                        onHide={() => {
                            SetShowUpdateAnons(false);
                            setData({ title: "", content: "" })
                            setErrors({ title: "", content: "", image: "" })
                            setDataImage(null);
                            setImageAnons(null);
                            setFileNameAnons("Выберите картинку");
                        }}>
                        <Modal.Header closeButton>
                            <Modal.Title className='partner-modal-title'>
                                Изменить анонс
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form className='py-4 d-flex flex-column'>
                                <Form.Group>
                                    <Form.Control type='text' placeholder='Введите заголовок анонса' defaultValue={data.title} name="title" onChange={handleAnonsOnChange} className='partner-name-control-input shadow-sm' />
                                    <Form.Label className="mb-3 mx-1 text-danger">{errors.title}</Form.Label>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Control type='text' placeholder='Введите ссылку на сайт партнера' defaultValue={data.content} name="content" onChange={handleAnonsOnChange} className='partner-name-control-input shadow-sm' />
                                    <Form.Label className="mb-3 mx-1 text-danger">{errors.content}</Form.Label>
                                </Form.Group>
                                <Form.Group className='form-input-logo-partner d-flex flex-column justify-content-center align-items-center mb-3 mx-auto'
                                    onClick={() => document.querySelector(".input-field-partner").click()}>
                                    <Form.Control type='file' accept=".jpg, .png" className='input-field-partner mb-3' name="image" hidden
                                        onChange={({ target: { files } }) => {
                                            if (files) {
                                                if ((files[0].size / 1024.0 / 1024.0) > 5) {
                                                    setErrors({ ...errors, image: "размер изображения не должен превышать 5 МБ" });
                                                    setFileNameAnons("Выберите картинку");
                                                    setDataImage(null);
                                                    setImageAnons(null);
                                                    return;
                                                }
                                                else if (files[0].type != "image/jpeg" && files[0].type != "image/png") {
                                                    setErrors({ ...errors, image: "изображение должно быть jpg или png" });
                                                    setFileNameAnons("Выберите картинку");
                                                    setImageAnons(null);
                                                    setDataImage(null);
                                                    return;
                                                }
                                                files[0] && setFileNameAnons(files[0].name)
                                                setImageAnons(URL.createObjectURL(files[0]))
                                                setDataImage(files[0]);
                                                setErrors({ ...errors, image: "" });
                                            }
                                        }

                                        } onClick={(event) => { event.target.value = null; }} />

                                    {ImageAnons ?
                                        <Image
                                            src={ImageAnons}
                                            height="100%"
                                            width='100%'
                                            className='mx-auto my-auto d-block photo-admin-partner p-1'
                                            alt='Logo'
                                        /> :
                                        <>
                                            <i className='bi bi-upload upload_icon'></i>
                                            <p className='m-0 name-photo-partner'>Загрузить фото</p>
                                        </>
                                    }
                                </Form.Group>
                                <Form.Label className="mb-3 text-center text-danger">{errors.image}</Form.Label>

                                <section className='upload-del p-2 d-flex justify-content-between shadow-sm border rounded mt-2'>
                                    <div className='d-flex align-items-center cnt-name-file-partner'>
                                        <i className="bi bi-file-image icon_image_partner"></i>
                                        <p className='m-0 name-photo-partner'>{FileNameAnons}</p>
                                    </div>
                                    <i className="bi bi-trash icon_trash_partner" onClick={() => {
                                        setFileNameAnons("Выберите картинку")
                                        setImageAnons(null)
                                        setDataImage(null)
                                    }}></i>
                                </section>

                                <Button className="mt-4 btn_form_partner mx-auto" onClick={handleUpdateAnons}>Сохранить</Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                    : ""}

                {anonsData ?
                    <Modal
                        show={ShowDeleteAnons}
                        onHide={() => SetShowDeleteAnons(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Удаление
                            </Modal.Title>
                        </Modal.Header>
                        {anonsData.title ?
                            <Modal.Body>
                                <h5 className='fw-light'>Вы действительно хотите удалить анонс <span className="fw-bold">{anonsData.title}</span></h5>
                                <Button className="mt-3 mb-2 btn_delete_chapter-service" data-id={anonsData.id} onClick={handleDeleteAnons}>Удалить</Button>
                            </Modal.Body>
                            : ""}

                    </Modal>
                    : ""}
            </>
        );
    }
}

export default Anonses_admin;