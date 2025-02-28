import React from 'react';
import { Container, Button } from 'react-bootstrap';
import '../styles/Educational_materials_admin.css';
import Sidebar from '../components/Sidebar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../styles/educational_materials.css';
import '../styles/titles-sizes.css';
import axios from 'axios';

function Educational_materials_admin(props) {
    const [ShowCreateEdMaterial, SetShowCreateEdMaterial] = useState(false);
    const [ShowDeleteEdMaterial, SetShowDeleteEdMaterial] = useState(false);
    const [ShowUpdateEdMaterial, SetShowUpdateEdMaterial] = useState(false);

    const [FileName, setFileName] = useState("Файл не выбран");
    const [data, setData] = useState({ name: ""});
    const [dataFile, setDataFile] = useState(null);
    const [dataFileUpdate, setDataFileUpdate] = useState(null);

    const [errors, setErrors] = useState({ name: "", file: "" })

    const [isAdmin, setIsAdmin] = useState(false);

    const [allEdMaterials, setAllEdMatertials] = useState(null);

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

    useEffect(() => { //получение всех учебных материалов
        axios.get('/education/all', {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setAllEdMatertials(response.data);
            setLoading(false);
        })
        .catch((error) => {
            console.log(error);
        })
    }, [])

    const validate = () => {
        let noErrors = true;

        if(!data.name){
            setErrors(prevState => ({...prevState, name: "название не должно быть пустым"}));
            noErrors = false;
        }
        else if(data.name.length > 80){
            setErrors(prevState => ({...prevState, name: "название не должно быть длинее 80 символов"}));
            noErrors = false;
        }

        return noErrors;
    }

    const handleSaveEdMaterial = () => { //создание учебного материала
        if(!validate()){
            return;
        }
        
        if(!dataFile){
            setErrors(prevState => ({...prevState, file: "файл не загружен"}));
            return;
        }

        let formData = new FormData();
        formData.append("name", data.name);
        formData.append("file", dataFile);

        axios.post('/education', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            SetShowCreateEdMaterial(false);
            setData({ name: ""});
            setDataFile(null);
            setFileName("Файл не выбран");
            setAllEdMatertials([...allEdMaterials, response.data]);
        })
        .catch((error) => {
            console.log(error);
        });
    }

    const handleChange = (e) => { //получение данных при изменении в полях модалки
        setData({...data, [e.target.name]: e.target.value});
        setErrors(prevState => ({...prevState, [e.target.name]: ""}));
    }

    const handleDeleteClick = (e) => { //получение информации об учебном материале и показ модалки удаления
        axios.get('/education/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setData(response.data);
            SetShowDeleteEdMaterial(true);
        })
        .catch((error) => {
            console.log(error);
        });
    }

    const handleDeleteEdMaterial = (e) => { //удаление учебного материала
        axios.delete('/education/' + e.target.dataset.id, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            const updatedEdMaterials = allEdMaterials.filter(edMaterial => edMaterial.id != response.data);
            setAllEdMatertials(updatedEdMaterials);
            SetShowDeleteEdMaterial(false);
        })
        .catch((error) => {
            console.log(error);
        });
    }

    const handleUpdateClick = (e) => { //получение информации об учебном материале и показ модалки изменения
        axios.get('/education/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            axios.get(response.data.filePath,{
                responseType: 'blob'
            }).then((responseFile) => {
                let file = new File([responseFile.data], response.data.file);
                setDataFileUpdate(file);
                var dt  = new DataTransfer();
                dt.items.add(file);
                var file_list = dt.files;

                document.getElementById("fileInputUpdate").files = file_list;
            });
            setData(response.data);
            setFileName(response.data.file);
            SetShowUpdateEdMaterial(true);
        })
        .catch((error) => {
            console.log(error);
        });
    }

    const handleUpdateEdMaterial = (e) => { //изменение учебного материала
        if(!validate()){
            return;
        }

        let formData = new FormData();
        formData.append("id", data.id);
        formData.append("name", data.name);

        if(dataFile){
            formData.append("file", dataFile);
        }

        axios.put('/education', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            SetShowUpdateEdMaterial(false);
            setData({ name: ""});
            setDataFile(null);
            const index = allEdMaterials.findIndex(material => material.id == response.data.id);
            const updatedEdMaterials = allEdMaterials;
            updatedEdMaterials[index] = response.data;
            setAllEdMatertials(updatedEdMaterials);
        })
        .catch((error) => {
            console.log(error);
        });
    }

    const setIcon = (name) => { //Установка икони по расширению файла
        let pdf = RegExp(/^.*[.](pdf)$/);
        let docx = RegExp(/^.*[.](docx)$/);
        let doc = RegExp(/^.*[.](doc)$/);

        if(pdf.test(name)){
            return <i className="bi bi-filetype-pdf admin-doc-icon"></i>;
        }

        if(docx.test(name)){
            return <i className="bi bi-filetype-docx admin-doc-icon"></i>;
        }

        if(doc.test(name)){
            return <i className="bi bi-filetype-doc admin-doc-icon"></i>;
        }
    }

    if(isAdmin){
        return (    
            <>
                <Container fluid className='cnt-main-ed-mat-admin p-0'>
                    <p className='text-center mt-2 main-section-title mb-1'>ПАНЕЛЬ АДМИНИСТРАТОРА</p>
                    <Container className=' d-flex justify-content-center' fluid>
                        <p className='text-secondary border-bottom border-primary border-opacity-50 text-center title-subsection'>Управление материалами</p>
                    </Container>
                    <Row className='mt-3'>
                        <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                        <Col xs={9} sm={9} md={7} lg={9}>


                            <Container className='d-flex p-0' fluid>
                                <p className='d-flex align-items-center m-0 title-admin-add'>Добавить документ?</p>
                                <Button className='ms-4 btn-admin-add' onClick={() => SetShowCreateEdMaterial(true)}>Добавить</Button>
                            </Container>
                            {loading ?
                                <Container fluid className='d-flex justify-center mt-3'>
                                    <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                    </svg>
                                </Container>
                            :allEdMaterials && allEdMaterials.length > 0 ?
                                allEdMaterials.map((edMaterial) => (
                                    <Container fluid className='admin-material-cnt p-3 rounded d-flex justify-content-between mt-4 shadow-sm' key={edMaterial.id}>
                                        <Container fluid className='p-0 d-flex admin-material-name-icon ms-0'>
                                            {setIcon(edMaterial.file)}
                                            <p className='admin-name-material my-auto ms-4'>{edMaterial.name}</p>
                                        </Container>
                                        <Button className='admin-materials-btn-edit me-1 d-flex justify-content-center align-items-center' data-id={edMaterial.id} onClick={handleUpdateClick}><i className="bi bi-pencil" style={{pointerEvents: 'none'}}></i></Button>
                                        <Button className='admin-materials-btn-delete d-flex justify-content-center align-items-center' data-id={edMaterial.id} onClick={handleDeleteClick}><i className="bi bi-trash3" style={{pointerEvents: 'none'}}></i></Button>
                                    </Container>
                                ))
                            : <p className='mx-auto text-center mt-3'>Учебных материалов еще не создано</p>}
                        </Col>
                    </Row>
                </Container>

                <Modal
                    show={ShowCreateEdMaterial}
                    onHide={() => {
                        SetShowCreateEdMaterial(false);
                        setData({ name: ""});
                        setErrors({name: "" });
                        setDataFile(null);
                    }}>
                    <Modal.Header closeButton>
                        <Modal.Title className='partner-modal-title'>
                            Создание учебного материала
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className='py-4 d-flex flex-column'>
                            <Form.Group>
                                <Form.Control type='text' placeholder='Введите наименование учебного материала' name="name" className='ed-mat-name-control-input shadow-sm' 
                                onChange={handleChange}/>
                                <Form.Label className='text-danger mx-1'>{errors.name}</Form.Label>
                                <Form.Control type="file" accept=".doc, .docx, .pdf" className='input-education-file shadow-sm mt-3'
                                    onChange={(e) => {

                                        let files = e.target.files;
                                        if (files) {

                                            if(files.length == 0 && dataFile){
                                                let file = new File([dataFile], dataFile.name);
                                                var dt  = new DataTransfer();
                                                dt.items.add(file);
                                                var file_list = dt.files;
                                
                                                e.target.files = file_list;
                                                return;
                                            }

                                            let r = RegExp(/^.*[.](pdf|docx|doc)$/);
                                            if ((files[0].size / 1024.0 / 1024.0) > 10) {
                                                setErrors({ ...errors, file: "размер файла не должен превышать 10 МБ" });
                                                e.target.value = "";
                                                return;
                                            }
                                            else if (!r.test(files[0].name)) {
                                                setErrors({ ...errors, file: "формат файла должен быть doc, docx или pdf" });
                                                e.target.value = "";
                                                return;
                                            }
                                            files[0] && setFileName(files[0].name)
                                            setDataFile(files[0]);
                                            setErrors({ ...errors, file: "" });
                                        }
                                    }
                                    }/>
                            <Form.Label className='text-danger mx-1'>{errors.file}</Form.Label>
                            </Form.Group>

                            <Button className="mt-5 btn_form_partner mx-auto" onClick={handleSaveEdMaterial}>Сохранить</Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                <Modal
                    show={ShowDeleteEdMaterial}
                    onHide={() => {
                        SetShowDeleteEdMaterial(false);
                        setData({ name: ""});
                        }}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Удаление
                        </Modal.Title>
                    </Modal.Header>
                    {data.name ?
                        <Modal.Body>
                            <h5 className='fw-light'>Вы действительно хотите удалить учебный материал <span className="fw-bold">{data.name}</span></h5>
                            <Button className="mt-3 mb-2 btn_delete_chapter-service" data-id={data.id} onClick={handleDeleteEdMaterial}>Удалить</Button>
                        </Modal.Body>
                        : ""}

                </Modal>

                <Modal
                    show={ShowUpdateEdMaterial}
                    onHide={() => {
                        SetShowUpdateEdMaterial(false);
                        setData({ name: ""});
                        setErrors({name: "" });
                        setDataFile(null);
                    }}>
                    <Modal.Header closeButton>
                        <Modal.Title className='partner-modal-title'>
                            Изменение учебного материала
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className='py-4 d-flex flex-column'>
                            <Form.Group>
                                <Form.Control type='text' placeholder='Введите наименование учебного материала' defaultValue={data.name} name="name" className='ed-mat-name-control-input shadow-sm' 
                                onChange={handleChange}/>
                                <Form.Label className='text-danger mx-1'>{errors.name}</Form.Label>
                                <Form.Control type="file" accept=".doc, .docx, .pdf" id="fileInputUpdate" className='input-education-file shadow-sm mt-3'
                                    onChange={(e) => {
                                        let files = e.target.files;
                                        if (files) {
                                            if(files.length == 0 && (dataFileUpdate || dataFile)){
                                                let createFile = dataFile ? dataFile : dataFileUpdate;
                                                let file = new File([createFile], createFile.name);
                                                var dt  = new DataTransfer();
                                                dt.items.add(file);
                                                var file_list = dt.files;
                                
                                                e.target.files = file_list;
                                                return;
                                            }
                                            
                                            let r = RegExp(/^.*[.](pdf|docx|doc)$/);
                                            if ((files[0].size / 1024.0 / 1024.0) > 10) {
                                                setErrors({ ...errors, file: "размер файла не должен превышать 10 МБ" });
                                                e.target.value = "";
                                                return;
                                            }
                                            else if (!r.test(files[0].name)) {
                                                setErrors({ ...errors, file: "формат файла должен быть doc, docx или pdf" });
                                                e.target.value = "";
                                                return;
                                            }
                                            files[0] && setFileName(files[0].name)
                                            setDataFile(files[0]);
                                            setErrors({ ...errors, file: "" });
                                        }
                                    }
                                    }/>
                            <Form.Label className='text-danger mx-1'>{errors.file}</Form.Label>
                            </Form.Group>

                            <Button className="mt-5 btn_form_partner mx-auto" onClick={handleUpdateEdMaterial}>Сохранить</Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}

export default Educational_materials_admin;