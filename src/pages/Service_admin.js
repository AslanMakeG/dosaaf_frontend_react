import React, { useState, useEffect, useRef } from 'react';
import { Button, Container } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Sidebar from '../components/Sidebar';
import '../styles/service_admin.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Modal } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import { Regex } from 'react-bootstrap-icons';

function Service_admin(props) {

    const [ShowEditChapter, SetShowEdChapter] = useState(false);
    const [ShowCreateChapter, SetShowCrChapter] = useState(false);
    const [ShowCreateService, SetShowCrService] = useState(false);
    const [ShowEditService, SetShowEdService] = useState(false);
    const [ShowDeeteServiceChapter, SetShowDelServiceChapter] = useState(false);
    const [ShowDeeteService, SetShowDelService] = useState(false);

    const [serviceSectionId, setServiceSectionId] = useState(-1); //для получения индекса раздела
    const [deleteServiceSectionId, setDeleteServiceSectionId] = useState(-1); //для получения индекса раздела
    const [serviceId, setServiceId] = useState(-1); //для получения индекса услуги


    const [dataServiceSection, setDataServiceSection] = useState({ name: "" }); //для добавления раздела
    const [dataService, setDataService] = useState({ name: "", description: "", cost: 0 }); //для добавления услуги

    const [serviceName, setServiceName] = useState(""); //для вывода названия услуги в модальном окне 
    const [serviceSectionName, setServiceSectionName] = useState(""); //для вывода названия раздела в модальном окне 


    const [serviceSections, setServiceSections] = useState([]); //для вывода всех разделов на страницу

    const [errors, setErrors] = useState({ sectionName: "", serviceName: "", serviceCost: "", serviceDescription: "" })

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
                    console.log(error);
                })
        }
    }, [])

    //запрос всех разделов с услугами
    useEffect(() => {
        axios
            .get("/service/all")  //получаем все данные услуг
            .then((response) => {
                setServiceSections(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const validate = () => {
        let noErrors = true;

        let r = new RegExp(/^\d{1,}$/);

        if (!dataService.name) {
            setErrors(prevState => ({ ...prevState, serviceName: "название услуги не может быть пустым" }));
            noErrors = false;
        }
        else if (dataService.name.length > 200) {
            setErrors(prevState => ({ ...prevState, serviceName: "название услуги не может быть длинее 200 символов" }));
            noErrors = false;
        }

        if (!dataService.description) {
            setErrors(prevState => ({ ...prevState, serviceDescription: "описание услуги не может быть пустым" }));
            noErrors = false;
        }
        else if (dataService.description.length > 200) {
            setErrors(prevState => ({ ...prevState, serviceName: "название услуги не может быть длинее 200 символов" }));
            noErrors = false;
        }

        if (!dataService.cost) {
            setErrors(prevState => ({ ...prevState, serviceCost: "цена услуги не может быть пустой" }));
            noErrors = false;
        }
        else if (!r.test(dataService.cost)) {
            setErrors(prevState => ({ ...prevState, serviceCost: "цена услуги должна состоять из цифр" }));
            noErrors = false;
        }
        else if (dataService.cost < 0) {
            setErrors(prevState => ({ ...prevState, serviceCost: "цена услуги не может быть меньше 0" }));
            noErrors = false;
        }

        return noErrors;
    }

    //Создание услуги
    const addService = () => {
        if (!validate()) {
            return;
        }

        axios
            .post("/service?serviceSectionId=" + serviceSectionId, dataService, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            }) //отправляем id раздела, данные об услуге
            .then((response) => {
                const serviceResponse = response.data; //получаем услугу
                const index = serviceSections.findIndex(item => item.id === serviceResponse['sectionId']); //Ищем нужный раздел

                if (index === -1) return; //если такой раздел не найден, ничего не происходит

                const item = serviceSections[index]; //Получаем найденный раздел по индексу 
                const servicesUpdated = [...item.services]; //Копируем услуги с раздела
                servicesUpdated.push(serviceResponse); //записываем услугу в данные с разделом

                const updatedService = { //Обновляем услуги у раздела
                    ...item,
                    services: servicesUpdated //Услугам присваиваем новый массив с услугами
                };

                const updatedServices = [...serviceSections]; //Копируем все разделы

                updatedServices[index] = updatedService; //По индексу меняем прошлый раздел на обновленный

                setServiceSections(updatedServices); //Устанавливаем разделы вместе с обновленным

                SetShowCrService(false);
            })
            .catch((error) => {
                console.log(error);
            });

    };

    //Изменение полей в модальном окне добавления раздела
    const handleChangeServiceSectionAdd = (event) => {
        setDataServiceSection({ ...dataServiceSection, [event.target.name]: event.target.value });
        setErrors(prevState => ({ ...prevState, sectionName: "" }));
    };

    //Создание раздела
    const addServiceSection = (e) => {
        if (!dataServiceSection.name) {
            setErrors(prevState => ({ ...prevState, sectionName: "название раздела не может быть пустым" }));
            return;
        }
        else if (dataServiceSection.name.length > 200) {
            setErrors(prevState => ({ ...prevState, sectionName: "название раздела не может быть длинее 200 символов" }));
            return;
        }

        axios
            .post("/service/section", dataServiceSection, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                setServiceSections(prevServices => [...prevServices, response.data])
                SetShowCrChapter(false);
            })
            .catch((error) => {
                console.log(error);
            });

    };

    const handleShowModalAddService = (event) => {
        setServiceSectionId(event.target.dataset.section);
        SetShowCrService(true);
    }

    //Изменение полей в модальном окне добавления услуги
    const handleChangeServiceAdd = (event) => {
        setDataService({ ...dataService, [event.target.name]: event.target.value });
        if (event.target.name == "name") {
            setErrors(prevState => ({ ...prevState, serviceName: "" }))
        }
        if (event.target.name == "cost") {
            setErrors(prevState => ({ ...prevState, serviceCost: "" }))
        }
        if (event.target.name == "description") {
            setErrors(prevState => ({ ...prevState, serviceDescription: "" }))
        }
    };

    const deleteService = (e) => {
        setServiceId(e.target.dataset.service);
    }

    useEffect(() => { //получить информацию об услуге и открыть модалку удаления
        if (serviceId === -1) return;

        axios
            .get("/service/" + serviceId, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                setServiceName(response.data['name']);
                SetShowDelService(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [serviceId]);

    const handleDeleteService = (event) => { //удалить услугу
        axios
            .delete("/service/" + serviceId, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                const deletedServiceId = response.data;

                const indexServiceSection = serviceSections.findIndex(section =>
                    section.services.findIndex(service => service.id == deletedServiceId) != -1); //Ищем нужный раздел

                if (indexServiceSection === -1) return; //если такой раздел не найден, ничего не происходит

                const item = serviceSections[indexServiceSection]; //Получаем найденный раздел по индексу 

                const updatedService = { //Обновляем услуги у раздела
                    ...item,
                    services: item.services.filter(service => service.id != deletedServiceId) //удаляем услугу разделе 
                };

                const updatedServices = [...serviceSections]; //Копируем все разделы

                updatedServices[indexServiceSection] = updatedService; //По индексу меняем прошлый раздел на обновленный

                setServiceSections(updatedServices); //Устанавливаем разделы вместе с обновленным

                SetShowDelService(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleDeleteChapter = (event) => { //удалить раздел
        axios
            .delete("/service/section/" + deleteServiceSectionId, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                const deletedServiceSectionId = response.data;

                const updatedServiceSections = serviceSections.filter(section => section.id != deletedServiceSectionId)

                setServiceSections(updatedServiceSections); //Устанавливаем разделы вместе с обновленным

                SetShowDelServiceChapter(false);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const deleteServiceSection = (e) => {
        setDeleteServiceSectionId(e.target.dataset.section);
        SetShowDelServiceChapter(true);
    }

    useEffect(() => { //получить информацию для удаления раздела и открыть модалку
        if (deleteServiceSectionId === -1) return;

        axios
            .get("/service/section/" + deleteServiceSectionId, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                setServiceSectionName(response.data['name']);
                SetShowDelServiceChapter(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [deleteServiceSectionId]);

    const handleUpdateClick = (e) => { //получить информацию для модалки изменения услуги
        axios
            .get("/service/" + e.target.dataset.id, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                setDataService(response.data);
                SetShowEdService(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleUpdateSave = (e) => { //изменение услуги
        if (!validate()) {
            return;
        }

        axios
            .put("/service", dataService, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                const updatedService = response.data;
                const index = serviceSections.findIndex(section => section.id == response.data.sectionId);

                const indexService = serviceSections[index].services.findIndex(service => service.id == updatedService.id);

                const updatedSections = serviceSections;

                updatedSections[index].services[indexService] = updatedService;

                setServiceSections(updatedSections);

                setDataService({ name: "", cost: "", description: "" });
                SetShowEdService(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleUpdateSectionClick = (e) => { //получение информации для изменения раздела и открытие модалки
        axios
            .get("/service/section/" + e.target.dataset.id, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                setDataServiceSection(response.data);
                SetShowEdChapter(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleUpdateSectionSave = (e) => { //изменить раздел
        if (!dataServiceSection.name) {
            setErrors(prevState => ({ ...prevState, sectionName: "название раздела не может быть пустым" }));
            return;
        }
        else if (dataServiceSection.name.length > 200) {
            setErrors(prevState => ({ ...prevState, sectionName: "название раздела не может быть длинее 200 символов" }));
            return;
        }

        axios
            .put("/service/section", dataServiceSection, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                const updatedSection = response.data;
                const index = serviceSections.findIndex(section => section.id == response.data.id);
                const updatedSections = serviceSections;
                updatedSections[index] = updatedSection;
                setServiceSections(updatedSections);

                setDataServiceSection({ name: "" });
                SetShowEdChapter(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    if (isAdmin) {
        return (
            <>
                <Container fluid className='main-cnt-sevice-admin p-0'>
                    <p className='text-center mt-2 main-section-title mb-1'>ПАНЕЛЬ АДМИНИСТРАТОРА</p>
                    <Container className='title-subsection d-flex justify-content-center' fluid>
                        <p className='text-secondary border-bottom border-primary border-opacity-50 text-center'>Управление услугами</p>
                    </Container>
                    <Row className='mt-3'>
                        <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                        <Col xs={9} sm={9} md={7} lg={9}>
                            <Container className='d-flex p-0' fluid>
                                <p className='d-flex align-items-center title-admin-add m-0'>Добавить раздел услуг?</p>
                                <Button className='ms-4 btn-admin-add' onClick={() => SetShowCrChapter(true)}>Добавить</Button>
                            </Container>
                            {loading ?
                                <Container fluid className='d-flex justify-center mt-3'>
                                    <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                    </svg>
                                </Container>
                                : serviceSections && serviceSections.length > 0 ?
                                    serviceSections.map((serviceSection) => (
                                        <Container className='mt-4 chapter-services p-5 rounded shadow' fluid key={serviceSection.id}>
                                            <div className='d-flex justify-content-start cnt-name-ed-del-section'>
                                                <Container fluid className='cnt-width-name-section p-0'>
                                                    <p className='d-flex align-items-center fw-bold title-chapter'>{serviceSection.name}</p>
                                                </Container>
                                                <Container fluid className='p-0 cnt-width-btn-ed-del d-flex'>
                                                    <Button className='btn-admin-chapter-edit ms-5 d-flex justify-content-center align-items-center' onClick={handleUpdateSectionClick} data-id={serviceSection.id}>
                                                        <p className='m-0 service-admin-btn-p'>Изменить раздел</p>
                                                        <i className="bi bi-pencil service-admin-btn-i" style={{ pointerEvents: 'none' }}></i>
                                                    </Button>
                                                    <Button className='btn-admin-chapter-delete ms-2 d-flex justify-content-center align-items-center' onClick={deleteServiceSection} data-section={serviceSection.id}>
                                                        <p className='m-0 service-admin-btn-p'>Удалить раздел</p>
                                                        <i class="bi bi-trash3 service-admin-btn-i" style={{ pointerEvents: 'none' }}></i></Button>
                                                </Container>
                                            </div>
                                            <p className='pre-serv'>Услуги</p>
                                            <Row xs={1} md={1} lg={2} xxl={3}>
                                                {serviceSection.services && serviceSection.services.length > 0 ? serviceSection.services.map((service) => (
                                                    <Col className='p-0' key={service.id}>
                                                        <Container fluid className='admin-card-service px-3 py-4 mb-3 shadow-sm rounded'>
                                                            <Container className='cnt-card-name-service p-0'>
                                                                <p className='card-name-service'><span className="fw-bold pre-name-serv">Наименование: </span>{service.name}</p>
                                                            </Container>
                                                            <p className='card-name-service'><span className="fw-bold pre-name-serv">Стоимость: </span>{service.cost} рублей.</p>
                                                            <Container className='d-flex justify-content-between p-0'>
                                                                <Button className='btn-admin-service-edit d-flex justify-content-center align-items-center' onClick={handleUpdateClick} data-id={service.id}>
                                                                    <p className='m-0 service-admin-btn-p'>Изменить</p>
                                                                    <i className="bi bi-pencil service-admin-btn-i" style={{ pointerEvents: 'none' }}></i></Button>

                                                                <Button className='btn-admin-service-delete d-flex justify-content-center align-items-center' data-service={service.id} onClick={deleteService}>
                                                                    <p className='m-0 service-admin-btn-p'>Удалить</p>
                                                                    <i class="bi bi-trash3 service-admin-btn-i" style={{ pointerEvents: 'none' }}></i>
                                                                </Button>
                                                            </Container>
                                                        </Container>
                                                    </Col>
                                                )) : <p>Услуг еще не создано</p>}
                                            </Row>
                                            <Container className='d-flex justify-content-start p-0' fluid>
                                                <Button className='btn-plus-service fw-light d-flex justify-content-center align-items-center' data-section={serviceSection.id} onClick={handleShowModalAddService}><i className='bi bi-plus icon_disabled'></i></Button>
                                                <p className='text-secondary ms-3 d-block mt-auto my-auto plus-service-admin'>Добавить услугу в раздел</p>
                                            </Container>
                                        </Container>
                                    )) : <p className='mx-auto text-center mt-5'>Разделов еще не создано</p>}
                        </Col >
                    </Row >
                </Container >
                <Modal
                    show={ShowCreateChapter}
                    onHide={() => { SetShowCrChapter(false); setErrors({ sectionName: "", serviceName: "", serviceCost: "", serviceDescription: "" }); setDataServiceSection({ name: "" }) }}>
                    <Modal.Header closeButton>
                        <Modal.Title className='admin-service-modal-title'>
                            Добавить раздел
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className='py-4'>
                            <Form.Group controlId='NameChapter'>
                                <Form.Control type='text' placeholder='Введите наименование раздела' name="name" onChange={handleChangeServiceSectionAdd} className='chapter-service-control-input' />
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.sectionName}</Form.Label>
                            </Form.Group>
                            <Button className="mt-3 mb-2 btn_form_chapter-service" onClick={addServiceSection}>Сохранить</Button>
                        </Form>
                    </Modal.Body>
                </Modal>


                <Modal
                    show={ShowEditChapter}
                    onHide={() => { SetShowEdChapter(false); setErrors({ sectionName: "", serviceName: "", serviceCost: "", serviceDescription: "" }); setDataServiceSection({ name: "" }) }}>
                    <Modal.Header closeButton>
                        <Modal.Title className='admin-service-modal-title'>
                            Изменить раздел
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className='py-4'>
                            <Form.Group controlId='NameChapter'>
                                <Form.Control type='text' placeholder='Введите наименование раздела' name="name" defaultValue={dataServiceSection.name} onChange={handleChangeServiceSectionAdd} className='chapter-service-control-input' />
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.sectionName}</Form.Label>
                            </Form.Group>
                            <Button className="mt-3 mb-2 btn_form_chapter-service" onClick={handleUpdateSectionSave}>Сохранить</Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                <Modal
                    show={ShowCreateService}
                    onHide={() => { SetShowCrService(false); setErrors({ sectionName: "", serviceName: "", serviceCost: "", serviceDescription: "" }); setDataService({ name: "", description: "", cost: 0 }) }}>
                    <Modal.Header closeButton>
                        <Modal.Title className='admin-service-modal-title'>
                            Добавить услугу
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className='py-4'>
                            <Form.Group controlId='NameChapter'>
                                <Form.Control type='text' placeholder='Введите наименование услуги' name="name" onChange={handleChangeServiceAdd} className='chapter-service-control-input' />
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.serviceName}</Form.Label>
                            </Form.Group>
                            <Form.Group controlId='NameChapter'>
                                <Form.Control type='text' placeholder='Введите стоимость услуги (в рублях)' name="cost" onChange={handleChangeServiceAdd} className='chapter-service-control-input' />
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.serviceCost}</Form.Label>
                            </Form.Group>
                            <Form.Group controlId='NameChapter'>
                                <Form.Control as="textarea" placeholder='Введите описание услуги' style={{ whiteSpace: "pre-line" }} name="description" onChange={handleChangeServiceAdd} className='chapter-service-description-input' />
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.serviceDescription}</Form.Label>
                            </Form.Group>
                            <Button className="mt-3 mb-2 btn_form_chapter-service" onClick={addService}>Сохранить</Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                <Modal
                    show={ShowEditService}
                    onHide={() => { SetShowEdService(false); setErrors({ sectionName: "", serviceName: "", serviceCost: "", serviceDescription: "" }); setDataService({ name: "", description: "", cost: 0 }) }}>
                    <Modal.Header closeButton>
                        <Modal.Title className='admin-service-modal-title'>
                            Изменить услугу
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className='py-4'>
                            <Form.Group controlId='NameChapter'>
                                <Form.Control type='text' placeholder='Введите наименование услуги' name="name" defaultValue={dataService.name} onChange={handleChangeServiceAdd} className='chapter-service-control-input' />
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.serviceName}</Form.Label>
                            </Form.Group>
                            <Form.Group controlId='NameChapter'>
                                <Form.Control type='text' placeholder='Введите стоимость услуги (в рублях)' name="cost" defaultValue={dataService.cost} onChange={handleChangeServiceAdd} className='chapter-service-control-input' />
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.serviceCost}</Form.Label>
                            </Form.Group>
                            <Form.Group controlId='NameChapter'>
                                <Form.Control as="textarea" placeholder='Введите описание услуги' style={{ whiteSpace: "pre-line" }} defaultValue={dataService.description} name="description" onChange={handleChangeServiceAdd} className='chapter-service-description-input' />
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.serviceDescription}</Form.Label>
                            </Form.Group>
                            <Button className="mt-3 mb-2 btn_form_chapter-service" onClick={handleUpdateSave}>Сохранить</Button>
                        </Form>
                    </Modal.Body>
                </Modal>


                <Modal
                    show={ShowDeeteServiceChapter}
                    onHide={() => SetShowDelServiceChapter(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Удаление
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5 className='fw-light'>Вы действительно хотите удалить раздел <span className="fw-bold">{serviceSectionName}</span> со всеми услугами в нем?</h5>
                        <Button className="mt-3 mb-2 btn_delete_chapter-service " onClick={handleDeleteChapter}>Удалить</Button>
                    </Modal.Body>
                </Modal>

                <Modal
                    show={ShowDeeteService}
                    onHide={() => { SetShowDelService(false); setServiceId(-1); }}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Удаление
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5 className='fw-light'>Вы действительно хотите удалить услугу <span className="fw-bold">{serviceName}</span> с полной потерей данных?</h5>
                        <Button className="mt-3 mb-2 btn_delete_chapter-service " onClick={handleDeleteService}>Удалить</Button>
                    </Modal.Body>
                </Modal>

            </>


        );
    }
}

export default Service_admin;