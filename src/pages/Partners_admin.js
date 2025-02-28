import React from 'react';
import '../styles/partners_admin.css';
import { Button, Container } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../styles/educational_materials.css';
import '../styles/titles-sizes.css';
import axios from 'axios';

function Partners_admin(props) {
    const [ShowCreatePartner, SetShowCrPartner] = useState(false);
    const [ShowUpdatePartner, SetShowUpdatePartner] = useState(false);
    const [ImagePartner, setImagePartner] = useState(null);
    const [FileNamePartner, setFileNamePartner] = useState("Выберите картинку");

    const [data, setData] = useState({ name: "", link: "" });
    const [dataImage, setDataImage] = useState(null);

    const [allPartners, setAllPartners] = useState(null);

    const [showPartnerDelete, SetShowPartnerDelete] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false);

    const [partnerData, setPartnerData] = useState({ name: null });

    const [errors, setErrors] = useState({ name: "", image: "", link: "" });

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
    }, [])

    useEffect(() => { //Получить всех партнеров
        axios.get('/partner/all', {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setAllPartners(response.data);
            setLoading(false);
        })
            .catch((error) => {
                console.log(error);
            });
    }, []);


    const validate = () => {

        let noErrors = true;
        let r = new RegExp(/^(ftp|http|https):\/\/[^ "]+$/);

        if (!data.name) {
            setErrors(prevErrors => ({ ...prevErrors, name: "название партнера не должно быть пустым" }))
            noErrors = false;
        }
        else if (data.name.length > 50) {
            setErrors(prevErrors => ({ ...prevErrors, name: "название партнера не должно быть длинее, чем 50 символов" }))
            noErrors = false;
        }

        if (!data.link) {
            setErrors(prevErrors => ({ ...prevErrors, link: "ссылка на партнера не должна быть пустой" }))
            noErrors = false;
        }
        else if (!r.test(data.link)) {
            setErrors(prevErrors => ({ ...prevErrors, link: "ссылка должна выглядеть, как: https://dosaaf.ru" }))
            noErrors = false;
        }
        else if (data.link.length > 100) {
            setErrors(prevErrors => ({ ...prevErrors, link: "ссылка не должна быть длинее, чем 100 символов" }))
            noErrors = false;
        }

        if (dataImage == null) {
            setErrors(prevErrors => ({ ...prevErrors, image: "логотип партнера не загружен" }))
            noErrors = false;
        }

        return noErrors;
    }

    const handlePartnerSave = () => { //сохранение партнера

        if (!validate()) {
            return;
        }

        let formData = new FormData();
        formData.append("image", dataImage);
        formData.append("name", data.name);
        formData.append("link", data.link);

        axios.post('/partner', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            SetShowCrPartner(false);
            setData({ name: "", link: "" });
            setDataImage(null);
            setImagePartner(null);
            setFileNamePartner("Выберите картинку");
            setAllPartners([...allPartners, response.data]);
        })
            .catch((error) => {
                console.log(error);
            });
    }

    const handlePartnerOnChange = (e) => { //Изменение данных при вводе в модалке
        setData({ ...data, [e.target.name]: e.target.value });
        setErrors({
            ...errors,
            [e.target.name]: ""
        });
    }

    const handleDeleteClick = (e) => { //Получение данных при нажатии на удаление и открытие модалки
        axios.get('/partner/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setPartnerData(response.data);
            SetShowPartnerDelete(true);
        })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleDeletePartner = (e) => { //Удаление партнера
        axios.delete('/partner/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            const updatedPartners = allPartners.filter(partner => partner.id != response.data);
            setAllPartners(updatedPartners);
            SetShowPartnerDelete(false);
        })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleUpdateClick = (e) => { //Получение информации о партнере и открытие модалки изменения
        axios.get('/partner/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setData(response.data);
            setImagePartner(axios.defaults.baseURL + response.data.imagePath);
            setFileNamePartner(response.data.image);
            setDataImage(response.data.image);
            SetShowUpdatePartner(true);
        })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleUpdatePartner = (e) => { //Изменение партнера
        if (!validate()) {
            return;
        }

        let formData = new FormData();

        if (dataImage != null && data.image != dataImage) {
            formData.append("image", dataImage);
        }

        formData.append("name", data.name);
        formData.append("link", data.link);
        formData.append("id", data.id);

        setData({ name: "", link: "" });

        axios.put('/partner', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            SetShowUpdatePartner(false);
            setDataImage(null);
            setImagePartner(null);
            setFileNamePartner("Выберите картинку");;

            const index = allPartners.findIndex(partner => partner.id === response.data.id);

            if (index == -1) return;

            const updatedPartners = allPartners;
            updatedPartners[index] = response.data;

            setAllPartners(updatedPartners);
        })
            .catch((error) => {
                console.log(error);
            });
    }

    //Если авторизован, то выводить
    if (isAdmin) {
        return (
            <>
                <Container fluid className='main-cnt-partners-admin p-0'>
                    <p className='text-center mt-2 main-section-title mb-1'>ПАНЕЛЬ АДМИНИСТРАТОРА</p>
                    <Container className=' d-flex justify-content-center' fluid>
                        <p className='text-secondary border-bottom border-primary border-opacity-50 text-center title-subsection'>Управление партнерами</p>
                    </Container>
                    <Row className='mt-3'>
                        <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                        <Col xs={9} sm={9} md={7} lg={9}>


                            <Container className='d-flex p-0' fluid>
                                <p className='d-flex align-items-center m-0 title-admin-add'>Добавить партнера?</p>
                                <Button className='ms-4 btn-admin-add' onClick={() => SetShowCrPartner(true)}>Добавить</Button>
                            </Container>
                            <Row xs={1} md={1} lg={2} xl={3} className=''>
                                {loading ?
                                <Container fluid className='d-flex justify-center mt-3'>
                                    <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                    </svg>
                                </Container>
                                :
                                allPartners && allPartners.length > 0 ? allPartners.map((partner) => (
                                    <Col key={partner.id}>
                                        <Container fluid className='partner-card p-4 shadow-sm rounded mt-4'>
                                            <p className='m-0 titles-partner-card'>Наименование партнера:</p>
                                            <p className='m-0 name-partner-card fw-bold'>{partner.name}</p>
                                            <p className='m-0 titles-partner-card mt-2'>Логотип партнера:</p>
                                            <Container fluid className='cnt-photo-partner border border-2 p-1 ms-0 mt-2'>
                                                <a href={partner.link} target='_blank'>
                                                    <Image
                                                        src={axios.defaults.baseURL + partner.imagePath}
                                                        height="100%"
                                                        width='100%'
                                                        className='mx-auto my-auto d-block photo-partner p-1'
                                                        alt='Logo'
                                                    />
                                                </a>
                                            </Container>
                                            <Container className='d-flex justify-content-between p-0 mt-3 mb-1'>
                                                <Button className='btn-edit-partner shadow-sm' data-id={partner.id} onClick={handleUpdateClick}>Изменить</Button>
                                                <Button className='btn-delete-partner shadow-sm' data-id={partner.id} onClick={handleDeleteClick}>Удалить</Button>
                                            </Container>
                                        </Container>
                                    </Col>
                                )) : <p className='mx-auto text-center mt-5'>Партнеров еще не создано</p>}
                            </Row>
                        </Col>
                    </Row>
                </Container>

                <Modal
                    show={ShowCreatePartner}
                    onHide={() => {
                        SetShowCrPartner(false);
                        setErrors({ name: "", image: "", link: "" })
                    }}>
                    <Modal.Header closeButton>
                        <Modal.Title className='partner-modal-title'>
                            Создание партнера
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className='py-4 d-flex flex-column'>
                            <Form.Group>
                                <Form.Control type='text' placeholder='Введите наименование партнера' name="name" onChange={handlePartnerOnChange} className='partner-name-control-input shadow-sm' />
                                <Form.Label className="mb-3 mx-1 text-danger">{errors.name}</Form.Label>
                            </Form.Group>
                            <Form.Group>
                                <Form.Control type='text' placeholder='Введите ссылку на сайт партнера' name="link" onChange={handlePartnerOnChange} className='partner-name-control-input shadow-sm' />
                                <Form.Label className="mb-3 mx-1 text-danger">{errors.link}</Form.Label>
                            </Form.Group>
                            <Form.Group className='form-input-logo-partner d-flex flex-column justify-content-center align-items-center mb-3 mx-auto'
                                onClick={() => document.querySelector(".input-field-partner").click()}>
                                <Form.Control type='file' accept=".jpg, .png" className='input-field-partner mb-3' name="image" hidden
                                    onChange={({ target: { files } }) => {
                                        if (files) {
                                            if ((files[0].size / 1024.0 / 1024.0) > 5) {
                                                setErrors({ ...errors, image: "размер изображения не должен превышать 5 МБ" });
                                                setFileNamePartner("Выберите картинку");
                                                setDataImage(null);
                                                setImagePartner(null);
                                                return;
                                            }
                                            else if (files[0].type != "image/jpeg" && files[0].type != "image/png") {
                                                setErrors({ ...errors, image: "изображение должно быть jpg или png" });
                                                setFileNamePartner("Выберите картинку");
                                                setImagePartner(null);
                                                setDataImage(null);
                                                return;
                                            }
                                            files[0] && setFileNamePartner(files[0].name)
                                            setImagePartner(URL.createObjectURL(files[0]))
                                            setDataImage(files[0]);
                                            setErrors({ ...errors, image: "" });
                                        }
                                    }

                                    } onClick={(event) => { event.target.value = null; }} />

                                {ImagePartner ?
                                    <Image
                                        src={ImagePartner}
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
                                    <p className='m-0 name-photo-partner'>{FileNamePartner}</p>
                                </div>
                                <i className="bi bi-trash icon_trash_partner" onClick={() => {
                                    setFileNamePartner("Выберите картинку")
                                    setImagePartner(null)
                                    setDataImage(null)
                                }}></i>
                            </section>

                            <Button className="mt-4 btn_form_partner mx-auto" onClick={handlePartnerSave}>Сохранить</Button>
                        </Form>
                    </Modal.Body>
                </Modal>
                {data ?
                    <Modal
                        show={ShowUpdatePartner}
                        onHide={() => {
                            SetShowUpdatePartner(false);
                            setData({ name: "", link: "" })
                            setErrors({ name: "", image: "", link: "" })
                            setDataImage(null);
                            setImagePartner(null);
                            setFileNamePartner("Выберите картинку");
                        }}>
                        <Modal.Header closeButton>
                            <Modal.Title className='partner-modal-title'>
                                Изменить партнера
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form className='py-4 d-flex flex-column'>
                                <Form.Group>
                                    <Form.Control type='text' placeholder='Введите наименование партнера' defaultValue={data.name} name="name" onChange={handlePartnerOnChange} className='partner-name-control-input shadow-sm' />
                                    <Form.Label className="mb-3 mx-1 text-danger">{errors.name}</Form.Label>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Control type='text' placeholder='Введите ссылку на сайт партнера' defaultValue={data.link} name="link" onChange={handlePartnerOnChange} className='partner-name-control-input shadow-sm' />
                                    <Form.Label className="mb-3 mx-1 text-danger">{errors.link}</Form.Label>
                                </Form.Group>
                                <Form.Group className='form-input-logo-partner d-flex flex-column justify-content-center align-items-center mb-3 mx-auto'
                                    onClick={() => document.querySelector(".input-field-partner").click()}>
                                    <Form.Control type='file' accept=".jpg, .png" className='input-field-partner mb-3' name="image" hidden
                                        onChange={({ target: { files } }) => {
                                            if (files) {
                                                if ((files[0].size / 1024.0 / 1024.0) > 5) {
                                                    setErrors({ ...errors, image: "размер изображения не должен превышать 5 МБ" });
                                                    setFileNamePartner("Выберите картинку");
                                                    setDataImage(null);
                                                    setImagePartner(null);
                                                    return;
                                                }
                                                else if (files[0].type != "image/jpeg" && files[0].type != "image/png") {
                                                    setErrors({ ...errors, image: "изображение должно быть jpg или png" });
                                                    setFileNamePartner("Выберите картинку");
                                                    setImagePartner(null);
                                                    setDataImage(null);
                                                    return;
                                                }
                                                files[0] && setFileNamePartner(files[0].name)
                                                setImagePartner(URL.createObjectURL(files[0]))
                                                setDataImage(files[0]);
                                                setErrors({ ...errors, image: "" });
                                            }
                                        }

                                        } onClick={(event) => { event.target.value = null; }} />

                                    {ImagePartner ?
                                        <Image
                                            src={ImagePartner}
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
                                        <p className='m-0 name-photo-partner'>{FileNamePartner}</p>
                                    </div>
                                    <i className="bi bi-trash icon_trash_partner" onClick={() => {
                                        setFileNamePartner("Выберите картинку")
                                        setImagePartner(null)
                                        setDataImage(null)
                                    }}></i>
                                </section>

                                <Button className="mt-4 btn_form_partner mx-auto" onClick={handleUpdatePartner}>Сохранить</Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                    : ""}


                <Modal
                    show={showPartnerDelete}
                    onHide={() => SetShowPartnerDelete(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Удаление
                        </Modal.Title>
                    </Modal.Header>
                    {partnerData.name ?
                        <Modal.Body>
                            <h5 className='fw-light'>Вы действительно хотите удалить партнера <span className="fw-bold">{partnerData.name}</span></h5>
                            <Button className="mt-3 mb-2 btn_delete_chapter-service" data-id={partnerData.id} onClick={handleDeletePartner}>Удалить</Button>
                        </Modal.Body>
                        : ""}

                </Modal>
            </>
        );
    }
}

export default Partners_admin;