import React from 'react';
import { Button, Container } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/educational_materials.css';
import Image from 'react-bootstrap/Image';
import book from '../components/book.png';
import axios from 'axios';
import { useState, useEffect } from 'react';
import PageInfo from '../components/PageInfo';

function Educational_materials(props) {
    const [InfoTitle, setInfoTitle] = useState("Изучение теории.");
    const [InfoText, setInfoText] = useState("Это позволит Вам подготовиться к экзаменационному тестированию.");
    const [InfoBtnText, setInfoBtnText] = useState("Тренировочные тесты");

    const [allEdMaterials, setAllEdMatertials] = useState(null);

    const [isAuthorized, setIsAuthorized] = useState(false);

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

    const setIcon = (name) => {
        let pdf = RegExp(/^.*[.](pdf)$/);
        let docx = RegExp(/^.*[.](docx)$/);
        let doc = RegExp(/^.*[.](doc)$/);

        if (pdf.test(name)) {
            return <i className="bi bi-filetype-pdf admin-doc-icon"></i>;
        }

        if (docx.test(name)) {
            return <i className="bi bi-filetype-docx admin-doc-icon"></i>;
        }

        if (doc.test(name)) {
            return <i className="bi bi-filetype-doc admin-doc-icon"></i>;
        }
    }

    const handleDownloadFile = (e) => {
        axios.get('/education/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            axios.get(response.data.filePath, {
                responseType: 'blob'
            }).then((responseFile) => {
                const href = URL.createObjectURL(responseFile.data);

                const link = document.createElement('a');
                link.href = href;
                link.setAttribute('download', response.data.file);
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                URL.revokeObjectURL(href);
            });
        })
            .catch((error) => {
                console.log(error);
            });
    }
    if (isAuthorized) {
        return (

            <Container className='cnt-ed-material p-0' fluid>
                <Container className='mt-2 d-flex justify-content-center' >
                    <p className='border-bottom p-2 border-primary border-opacity-50 main-section-title'>УЧЕБНЫЕ МАТЕРИАЛЫ</p>
                </Container>
                <Row className='mt-3'>
                    <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                    <Col xs={9} sm={9} md={7} lg={9}>
                        <PageInfo text={InfoText} title={InfoTitle} btn_text={InfoBtnText} picture={book} />

                        {loading ?
                                <Container fluid className='d-flex justify-center mt-3'>
                                    <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                    </svg>
                                </Container>
                        :allEdMaterials && allEdMaterials.length > 0 ?
                            allEdMaterials.map((edMaterial) => (
                                <Container fluid className='material-cnt p-3 rounded d-flex justify-content-between align-items-center mt-3 shadow-sm'
                                key={edMaterial.id}>
                                    <Container fluid className='p-0 d-flex align-items-center material-name-icon ms-0'>
                                        {setIcon(edMaterial.file)}
                                        <p className='name-material my-auto ms-4' data-id={edMaterial.id} onClick={handleDownloadFile}>{edMaterial.name}</p>
                                    </Container>
                                    <i className="bi bi-download download-material-icon fw-bold" data-id={edMaterial.id} onClick={handleDownloadFile}></i>
                                </Container>
                            ))
                            : <p className='mx-auto text-center mt-3'>Учебных материалов еще не создано</p>}
                    </Col>

                </Row>
            </Container>
        );
    }
}

export default Educational_materials;